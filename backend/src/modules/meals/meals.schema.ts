import { z } from 'zod';
import { MealType } from '@prisma/client';
import { paginationQuery } from '../../core/pagination';
import { rangeEndDate, rangeStartDate } from '../../core/dateRange';

export const createMealBody = z.object({
  foodName: z.string().min(1).max(200),
  mealType: z.nativeEnum(MealType),
  quantity: z.number().positive(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  micronutrients: z.record(z.string(), z.number()).optional(),
  date: z.coerce.date().optional(),
  goalId: z.string().cuid().optional(),
});
export const updateMealBody = createMealBody.partial();

export const listMealsQuery = paginationQuery.extend({
  startDate: rangeStartDate,
  endDate: rangeEndDate,
  mealType: z.nativeEnum(MealType).optional(),
});

export const idParam = z.object({ id: z.string().cuid() });
