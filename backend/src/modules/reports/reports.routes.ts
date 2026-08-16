import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../core/validate';
import { reportController } from './reports.controller';
import { dateRangeQuery, macrosQuery } from './reports.schema';

const r = Router();
r.use(authenticate);
r.get('/weekly-trend', validate({ query: dateRangeQuery }), reportController.weeklyTrend);
r.get('/macros', validate({ query: macrosQuery }), reportController.macros);
r.get('/micronutrients', validate({ query: dateRangeQuery }), reportController.micronutrients);
r.get('/goal-comparison', validate({ query: dateRangeQuery }), reportController.goalComparison);
export default r;
