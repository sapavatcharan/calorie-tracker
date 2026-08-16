import { z } from 'zod';
import { createMealBody } from '../meals/meals.schema';

export const MealsArraySchema = z.array(createMealBody);

export const confirmImportBody = z.object({
  meals: MealsArraySchema,
});
