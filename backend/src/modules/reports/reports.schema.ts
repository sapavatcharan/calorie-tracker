import { z } from 'zod';
import { rangeEndDate, rangeStartDate } from '../../core/dateRange';

export const dateRangeQuery = z.object({
  startDate: rangeStartDate,
  endDate: rangeEndDate,
});

export const macrosQuery = dateRangeQuery.extend({
  groupBy: z.enum(['day', 'week']).default('day'),
});
