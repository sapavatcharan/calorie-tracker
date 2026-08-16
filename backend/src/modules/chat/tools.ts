import { mealService } from '../meals/meals.service';
import { goalService } from '../goals/goals.service';
import { reportService } from '../reports/reports.service';
import { createMealBody } from '../meals/meals.schema';
import { createGoalBody } from '../goals/goals.schema';

import { parseRangeEnd, parseRangeStart } from '../../core/dateRange';

type Tool = {
  declaration: { name: string; description: string; parameters: Record<string, unknown> };
  handler: (userId: string, args: Record<string, unknown>) => Promise<unknown>;
};

export const tools: Record<string, Tool> = {
  log_meal: {
    declaration: {
      name: 'log_meal',
      description: 'Log a food entry for the user',
      parameters: {
        type: 'object',
        properties: {
          foodName: { type: 'string' },
          mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] },
          quantity: { type: 'number' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
        required: ['foodName', 'mealType', 'quantity', 'calories'],
      },
    },
    handler: (userId, args) => mealService.create(userId, createMealBody.parse(args)),
  },
  list_meals: {
    declaration: {
      name: 'list_meals',
      description:
        "Look up what the user ate and how many calories they logged. Use this for questions like 'how many calories today' or 'what did I eat'. Omitting dates defaults to today. Returns count, totalCalories, mealNames.",
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          mealType: { type: 'string' },
        },
      },
    },
    handler: async (userId, args) => {
      const startDate = parseRangeStart(args.startDate) ?? (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();
      const endDate = parseRangeEnd(args.endDate) ?? (() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
      })();
      const listed = await mealService.list(userId, {
        page: 1,
        limit: 20,
        mealType: args.mealType as Parameters<typeof mealService.list>[1]['mealType'],
        startDate,
        endDate,
      });
      const meals = listed.data.map((m) => ({
        foodName: m.foodName,
        mealType: m.mealType,
        calories: Math.round(m.calories),
      }));
      const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
      return {
        count: listed.pagination.total,
        totalCalories,
        mealNames: meals.map((m) => m.foodName),
        meals,
      };
    },
  },
  set_goal: {
    declaration: {
      name: 'set_goal',
      description: "Create/set the user's daily nutrition goal",
      parameters: {
        type: 'object',
        properties: {
          dailyCalories: { type: 'number' },
          dailyProtein: { type: 'number' },
          dailyCarbs: { type: 'number' },
          dailyFat: { type: 'number' },
          weightGoal: { type: 'number' },
        },
        required: ['dailyCalories'],
      },
    },
    handler: (userId, args) => goalService.create(userId, createGoalBody.parse(args)),
  },
  goal_progress: {
    declaration: {
      name: 'goal_progress',
      description:
        'Compare intake against the daily goal (percent of goal). Do not use this for a simple calorie-total or what-did-I-eat question — use list_meals.',
      parameters: {
        type: 'object',
        properties: { startDate: { type: 'string' }, endDate: { type: 'string' } },
      },
    },
    handler: async (userId, args) => {
      const raw = await reportService.goalComparison(userId, {
        startDate: parseRangeStart(args.startDate),
        endDate: parseRangeEnd(args.endDate),
      });
      return {
        days: raw.days,
        goalCalories: Math.round(raw.goal.calories),
        actualCalories: Math.round(raw.actual.calories),
        perNutrient: raw.perNutrient.map((n) => ({
          name: n.name,
          goal: Math.round(n.goal),
          actual: Math.round(n.actual),
          pct: Math.round(n.pct),
        })),
      };
    },
  },
  weekly_summary: {
    declaration: {
      name: 'weekly_summary',
      description: 'Weekly calorie trend summary',
      parameters: { type: 'object', properties: {} },
    },
    handler: async (userId) => {
      const raw = await reportService.weeklyTrend(userId, {});
      const totalCalories = Math.round(raw.data.reduce((s, d) => s + d.calories, 0));
      return {
        days: raw.data.length,
        totalCalories,
        byDay: raw.data.map((d) => ({ date: d.date, calories: Math.round(d.calories) })),
      };
    },
  },
};
