import { z } from 'zod';

export const extractNutritionBody = z.object({
  imageUrl: z.string().url(),
});

const num = z.coerce.number().nonnegative();

export const NutritionSchema = z.object({
  foodName: z.string().min(1),
  calories: num.default(0),
  protein: num.optional(),
  carbs: num.optional(),
  fat: num.optional(),
  quantity: z.coerce.number().positive().optional(),
  micronutrients: z.record(z.string(), z.coerce.number()).default({}),
});
