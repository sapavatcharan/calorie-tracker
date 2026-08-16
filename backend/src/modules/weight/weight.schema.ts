import { z } from 'zod';
import { paginationQuery } from '../../core/pagination';
import { rangeEndDate, rangeStartDate } from '../../core/dateRange';

export const createWeightBody = z.object({
  weight: z.number().positive(),
  date: z.coerce.date().optional(),
});

export const listWeightQuery = paginationQuery.extend({
  startDate: rangeStartDate,
  endDate: rangeEndDate,
});

export const idParam = z.object({ id: z.string().cuid() });
