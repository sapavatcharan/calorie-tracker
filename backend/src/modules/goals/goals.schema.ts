import { z } from 'zod';
import { paginationQuery } from '../../core/pagination';

export const createGoalBody = z.object({
  dailyCalories: z.number().int().positive(),
  dailyProtein: z.number().nonnegative().optional(),
  dailyCarbs: z.number().nonnegative().optional(),
  dailyFat: z.number().nonnegative().optional(),
  weightGoal: z.number().positive().optional(),
  micronutrients: z.record(z.string(), z.number()).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateGoalBody = createGoalBody.partial().extend({
  isActive: z.boolean().optional(),
});

export const listGoalsQuery = paginationQuery;

export const idParam = z.object({ id: z.string().cuid() });
