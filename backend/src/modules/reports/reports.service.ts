import { prisma } from '../../lib/prisma';
import { NotFound } from '../../core/errors';
import type { z } from 'zod';
import type { dateRangeQuery, macrosQuery } from './reports.schema';

const MS_DAY = 86_400_000;

function resolveWindow(q: z.infer<typeof dateRangeQuery>) {
  const endDate = q.endDate ?? new Date();
  if (q.startDate) return { startDate: q.startDate, endDate };
  const endDay = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const startDate = new Date(endDay - 6 * MS_DAY);
  return { startDate, endDate };
}

function inclusiveDays(start: Date, end: Date) {
  const a = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const b = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.max(1, Math.floor((b - a) / MS_DAY) + 1);
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function weekKey(d: Date) {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = day.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  day.setUTCDate(day.getUTCDate() + mondayOffset);
  return day.toISOString().slice(0, 10);
}

async function mealsInWindow(userId: string, startDate: Date, endDate: Date) {
  return prisma.mealEntry.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: 'asc' },
  });
}

function pct(actual: number, goal: number) {
  if (goal === 0) return 0;
  return (actual / goal) * 100;
}

export const reportService = {
  weeklyTrend: async (userId: string, q: z.infer<typeof dateRangeQuery>) => {
    const { startDate, endDate } = resolveWindow(q);
    const meals = await mealsInWindow(userId, startDate, endDate);
    const byDay = new Map<string, number>();
    for (const m of meals) {
      const key = dayKey(m.date);
      byDay.set(key, (byDay.get(key) ?? 0) + m.calories);
    }
    const data = [...byDay.entries()].map(([date, calories]) => ({ date, calories }));
    return { data };
  },

  macros: async (userId: string, q: z.infer<typeof macrosQuery>) => {
    const { startDate, endDate } = resolveWindow(q);
    const meals = await mealsInWindow(userId, startDate, endDate);
    const keyFn = q.groupBy === 'week' ? weekKey : dayKey;
    const byPeriod = new Map<string, { protein: number; carbs: number; fat: number }>();
    for (const m of meals) {
      const period = keyFn(m.date);
      const cur = byPeriod.get(period) ?? { protein: 0, carbs: 0, fat: 0 };
      cur.protein += m.protein ?? 0;
      cur.carbs += m.carbs ?? 0;
      cur.fat += m.fat ?? 0;
      byPeriod.set(period, cur);
    }
    const data = [...byPeriod.entries()].map(([period, macros]) => ({ period, ...macros }));
    return { data };
  },

  micronutrients: async (userId: string, q: z.infer<typeof dateRangeQuery>) => {
    const { startDate, endDate } = resolveWindow(q);
    const meals = await mealsInWindow(userId, startDate, endDate);
    const totals: Record<string, number> = {};
    for (const m of meals) {
      const micro = (m.micronutrients ?? {}) as Record<string, unknown>;
      for (const [k, v] of Object.entries(micro)) {
        const n = typeof v === 'number' ? v : Number(v);
        if (Number.isFinite(n)) totals[k] = (totals[k] ?? 0) + n;
      }
    }
    return { data: totals };
  },

  goalComparison: async (userId: string, q: z.infer<typeof dateRangeQuery>) => {
    const { startDate, endDate } = resolveWindow(q);
    const goal = await prisma.goal.findFirst({ where: { userId, isActive: true } });
    if (!goal) throw NotFound('No active goal');

    const meals = await mealsInWindow(userId, startDate, endDate);
    const days = inclusiveDays(startDate, endDate);

    const actual = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    for (const m of meals) {
      actual.calories += m.calories;
      actual.protein += m.protein ?? 0;
      actual.carbs += m.carbs ?? 0;
      actual.fat += m.fat ?? 0;
    }

    const scaled = {
      calories: goal.dailyCalories * days,
      protein: (goal.dailyProtein ?? 0) * days,
      carbs: (goal.dailyCarbs ?? 0) * days,
      fat: (goal.dailyFat ?? 0) * days,
    };

    const perNutrient = (['calories', 'protein', 'carbs', 'fat'] as const).map((name) => ({
      name,
      goal: scaled[name],
      actual: actual[name],
      pct: pct(actual[name], scaled[name]),
    }));

    return { days, goal: scaled, actual, perNutrient };
  },
};
