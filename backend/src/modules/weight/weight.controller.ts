import { asyncHandler } from '../../core/asyncHandler';
import { weightService } from './weight.service';
import type { z } from 'zod';
import type { createWeightBody, listWeightQuery } from './weight.schema';

export const weightController = {
  create: asyncHandler(async (req, res) =>
    res.status(201).json(await weightService.create(req.userId!, req.validated.body as z.infer<typeof createWeightBody>)),
  ),
  list: asyncHandler(async (req, res) =>
    res.json(await weightService.list(req.userId!, req.validated.query as z.infer<typeof listWeightQuery>)),
  ),
  remove: asyncHandler(async (req, res) => {
    await weightService.remove(req.userId!, (req.validated.params as { id: string }).id);
    res.status(204).send();
  }),
};
