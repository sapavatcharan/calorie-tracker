import { asyncHandler } from '../../core/asyncHandler';
import { mealService } from './meals.service';
import type { z } from 'zod';
import type { createMealBody, listMealsQuery, updateMealBody } from './meals.schema';

export const mealController = {
  create: asyncHandler(async (req, res) =>
    res.status(201).json(await mealService.create(req.userId!, req.validated.body as z.infer<typeof createMealBody>)),
  ),
  list: asyncHandler(async (req, res) =>
    res.json(await mealService.list(req.userId!, req.validated.query as z.infer<typeof listMealsQuery>)),
  ),
  get: asyncHandler(async (req, res) =>
    res.json(await mealService.getOwned(req.userId!, (req.validated.params as { id: string }).id)),
  ),
  update: asyncHandler(async (req, res) =>
    res.json(
      await mealService.update(
        req.userId!,
        (req.validated.params as { id: string }).id,
        req.validated.body as z.infer<typeof updateMealBody>,
      ),
    ),
  ),
  remove: asyncHandler(async (req, res) => {
    await mealService.remove(req.userId!, (req.validated.params as { id: string }).id);
    res.status(204).send();
  }),
};
