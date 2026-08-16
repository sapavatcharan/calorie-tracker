import { asyncHandler } from '../../core/asyncHandler';
import { goalService } from './goals.service';
import type { z } from 'zod';
import type { createGoalBody, listGoalsQuery, updateGoalBody } from './goals.schema';

export const goalController = {
  create: asyncHandler(async (req, res) =>
    res.status(201).json(await goalService.create(req.userId!, req.validated.body as z.infer<typeof createGoalBody>)),
  ),
  list: asyncHandler(async (req, res) =>
    res.json(await goalService.list(req.userId!, req.validated.query as z.infer<typeof listGoalsQuery>)),
  ),
  current: asyncHandler(async (req, res) => res.json(await goalService.current(req.userId!))),
  update: asyncHandler(async (req, res) =>
    res.json(
      await goalService.update(
        req.userId!,
        (req.validated.params as { id: string }).id,
        req.validated.body as z.infer<typeof updateGoalBody>,
      ),
    ),
  ),
  remove: asyncHandler(async (req, res) => {
    await goalService.remove(req.userId!, (req.validated.params as { id: string }).id);
    res.status(204).send();
  }),
};
