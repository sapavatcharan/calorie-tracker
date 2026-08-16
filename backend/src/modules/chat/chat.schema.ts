import { z } from 'zod';
import { paginationQuery } from '../../core/pagination';

export const messageBody = z.object({
  message: z.string().min(1).max(4000),
});

export const listHistoryQuery = paginationQuery;

export const idParam = z.object({ id: z.string().cuid() });
