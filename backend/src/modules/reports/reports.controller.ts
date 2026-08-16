import { asyncHandler } from '../../core/asyncHandler';
import { reportService } from './reports.service';
import type { z } from 'zod';
import type { dateRangeQuery, macrosQuery } from './reports.schema';

export const reportController = {
  weeklyTrend: asyncHandler(async (req, res) =>
    res.json(await reportService.weeklyTrend(req.userId!, req.validated.query as z.infer<typeof dateRangeQuery>)),
  ),
  macros: asyncHandler(async (req, res) =>
    res.json(await reportService.macros(req.userId!, req.validated.query as z.infer<typeof macrosQuery>)),
  ),
  micronutrients: asyncHandler(async (req, res) =>
    res.json(await reportService.micronutrients(req.userId!, req.validated.query as z.infer<typeof dateRangeQuery>)),
  ),
  goalComparison: asyncHandler(async (req, res) =>
    res.json(await reportService.goalComparison(req.userId!, req.validated.query as z.infer<typeof dateRangeQuery>)),
  ),
};
