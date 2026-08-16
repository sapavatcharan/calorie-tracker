import { FunctionDeclaration, GoogleGenerativeAI, Part } from '@google/generative-ai';
import { prisma } from '../../lib/prisma';
import { config } from '../../config';
import { paginated } from '../../core/pagination';
import { NotFound } from '../../core/errors';
import { withModelFallback } from '../../core/geminiFallback';
import { tools } from './tools';
import type { z } from 'zod';
import type { listHistoryQuery } from './chat.schema';

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const MAX_HOPS = 5;
const SYSTEM = `You are a helpful nutrition assistant.

Use tools to log meals, set goals, and look up the user's data. After a tool returns, you MUST write a natural-language answer for the user that uses the actual numbers and names from the tool result. Never reply with only "Done", "OK", "Got it", or similar acknowledgments — those are not answers.

- After a read tool (list_meals, goal_progress, weekly_summary): summarize the data in 1–3 sentences (totals, counts, food names). Example: "You've logged 105 calories today (1 meal: banana)."
- After a write tool (log_meal, set_goal): confirm what was saved, including numbers. Example: "Logged banana (105 kcal)."
- Answer general nutrition questions directly without tools.`;

const WRITE_TOOLS = new Set(['log_meal', 'set_goal']);
const READ_TOOLS = new Set(['list_meals', 'goal_progress', 'weekly_summary']);

function serialize(data: unknown) {
  return JSON.parse(JSON.stringify(data, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))) as object;
}

function readText(resp: { response: { text: () => string } }) {
  try {
    return (resp.response.text() ?? '').trim();
  } catch {
    return '';
  }
}

type ToolTrace = { name: string; data: unknown };

function isWeakReply(text: string) {
  const t = text.trim();
  if (!t) return true;
  if (/^(done|ok|okay|got it|sure|thanks|thank you|yes|noted)[.! ]*$/i.test(t)) return true;
  if (t.length <= 12 && !/\d/.test(t)) return true;
  return false;
}

function isRealSentence(text: string) {
  const t = text.trim();
  if (isWeakReply(t)) return false;
  return t.split(/\s+/).length >= 4 || /\d/.test(t);
}

function primaryCalorieTotal(traces: ToolTrace[]): number | undefined {
  const list = traces.find((t) => t.name === 'list_meals')?.data as { totalCalories?: number } | undefined;
  if (list?.totalCalories != null) return Math.round(Number(list.totalCalories));
  const progress = traces.find((t) => t.name === 'goal_progress')?.data as { actualCalories?: number } | undefined;
  if (progress?.actualCalories != null) return Math.round(Number(progress.actualCalories));
  const weekly = traces.find((t) => t.name === 'weekly_summary')?.data as { totalCalories?: number } | undefined;
  if (weekly?.totalCalories != null) return Math.round(Number(weekly.totalCalories));
  return undefined;
}

function citesToolNumbers(text: string, traces: ToolTrace[]) {
  const usedRead = traces.some((t) => READ_TOOLS.has(t.name));
  if (!usedRead) return true;
  const total = primaryCalorieTotal(traces);
  if (total == null) return true;
  return text.includes(String(total));
}

function fallbackFromTools(traces: ToolTrace[]): string {
  const list = traces.find((t) => t.name === 'list_meals')?.data as
    | {
        totalCalories?: number;
        count?: number;
        mealNames?: string[];
        meals?: { foodName: string; calories: number }[];
      }
    | undefined;
  if (list) {
    const kcal = Math.round(Number(list.totalCalories ?? 0));
    const count = Number(list.count ?? list.meals?.length ?? 0);
    const names = (list.mealNames ?? list.meals?.map((m) => m.foodName) ?? []).filter(Boolean);
    if (count === 0) return "You haven't logged any meals for that period.";
    if (names.length) {
      return `You've logged ${kcal} calories today (${count} meal${count === 1 ? '' : 's'}: ${names.join(', ')}).`;
    }
    return `You've logged ${kcal} calories today (${count} meal${count === 1 ? '' : 's'}).`;
  }
  const progress = traces.find((t) => t.name === 'goal_progress')?.data as
    | { actualCalories?: number; goalCalories?: number; days?: number }
    | undefined;
  if (progress?.actualCalories != null) {
    const actual = Math.round(Number(progress.actualCalories));
    const goal = progress.goalCalories != null ? Math.round(Number(progress.goalCalories)) : null;
    if (goal != null) return `You've logged ${actual} calories vs a ${goal} calorie goal.`;
    return `You've logged ${actual} calories in this window.`;
  }
  const weekly = traces.find((t) => t.name === 'weekly_summary')?.data as
    | { totalCalories?: number; days?: number }
    | undefined;
  if (weekly?.totalCalories != null) {
    return `You've logged ${Math.round(Number(weekly.totalCalories))} calories over the last ${weekly.days ?? 7} days.`;
  }
  const logged = traces.find((t) => t.name === 'log_meal')?.data as { foodName?: string; calories?: number } | undefined;
  if (logged?.foodName) {
    return `Logged ${logged.foodName}${logged.calories != null ? ` (${logged.calories} kcal)` : ''}.`;
  }
  const goal = traces.find((t) => t.name === 'set_goal')?.data as { dailyCalories?: number } | undefined;
  if (goal?.dailyCalories != null) {
    return `Set your daily calorie goal to ${goal.dailyCalories}.`;
  }
  return 'Done.';
}

function finalizeReply(modelText: string, traces: ToolTrace[]) {
  const usedRead = traces.some((t) => READ_TOOLS.has(t.name));
  const usedWrite = traces.some((t) => WRITE_TOOLS.has(t.name));
  if (isRealSentence(modelText) && citesToolNumbers(modelText, traces) && !(usedRead && isWeakReply(modelText))) {
    return modelText;
  }
  if (traces.length && (usedRead || usedWrite || isWeakReply(modelText))) {
    return fallbackFromTools(traces);
  }
  return modelText || 'Done.';
}

export const chatService = {
  handleMessage: async (userId: string, message: string) => {
    const saved = await prisma.chatMessage.create({ data: { userId, role: 'user', content: message } });

    const prior = await prisma.chatMessage.findMany({
      where: { userId, NOT: { id: saved.id } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const history = prior.reverse().map((m) => ({
      role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.content || ' ' }],
    }));
    const toolDecls = Object.values(tools).map((t) => t.declaration as unknown as FunctionDeclaration);

    const reply = await withModelFallback(config.GEMINI_CHAT_MODELS, async (modelName) => {
      const model = genAI.getGenerativeModel(
        {
          model: modelName,
          systemInstruction: SYSTEM,
          tools: [{ functionDeclarations: toolDecls }],
        },
        { apiVersion: config.GEMINI_API_VERSION },
      );

      const chat = model.startChat({ history });
      const traces: ToolTrace[] = [];
      let resp = await chat.sendMessage(message);
      let toolsRan = false;
      let askedForSummary = false;
      for (let hop = 0; hop < MAX_HOPS; hop++) {
        const calls = resp.response.functionCalls?.() ?? [];
        const text = readText(resp);

        if (calls.length > 0) {
          toolsRan = true;
          const results: Part[] = await Promise.all(
            calls.map(async (c) => {
              const tool = tools[c.name];
              const data = tool
                ? await tool.handler(userId, c.args as Record<string, unknown>).catch((e: unknown) => ({
                    error: String((e as { message?: string })?.message ?? e),
                  }))
                : { error: 'unknown tool' };
              traces.push({ name: c.name, data });
              return { functionResponse: { name: c.name, response: { result: serialize(data) } } };
            }),
          );
          try {
            resp = await chat.sendMessage(results);
          } catch (err) {
            if (traces.length) return fallbackFromTools(traces);
            throw err;
          }
          continue;
        }

        if (text && !(toolsRan && isWeakReply(text))) break;
        if (askedForSummary) break;

        askedForSummary = true;
        try {
          resp = await chat.sendMessage(
            'Using the tool results above, answer the user in 1–3 sentences with the actual numbers and food names. Do not say Done or OK.',
          );
        } catch (err) {
          if (traces.length) return fallbackFromTools(traces);
          throw err;
        }
      }

      return finalizeReply(readText(resp), traces);
    });

    await prisma.chatMessage.create({ data: { userId, role: 'assistant', content: reply } });
    return reply;
  },

  listHistory: async (userId: string, q: z.infer<typeof listHistoryQuery>) => {
    const where = { userId };
    const [items, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.chatMessage.count({ where }),
    ]);
    return paginated(items, total, q.page, q.limit);
  },

  clearHistory: async (userId: string) => {
    await prisma.chatMessage.deleteMany({ where: { userId } });
  },

  remove: async (userId: string, id: string) => {
    const msg = await prisma.chatMessage.findFirst({ where: { id, userId } });
    if (!msg) throw NotFound('Message not found');
    await prisma.chatMessage.delete({ where: { id } });
  },
};
