import { prisma } from '../../lib/prisma';
import { NotFound } from '../../core/errors';
import { paginated } from '../../core/pagination';
import type { z } from 'zod';
import type { createWeightBody, listWeightQuery } from './weight.schema';

export const weightService = {
  create: (userId: string, data: z.infer<typeof createWeightBody>) =>
    prisma.weightEntry.create({ data: { ...data, userId } }),

  list: async (userId: string, q: z.infer<typeof listWeightQuery>) => {
    const where = {
      userId,
      ...((q.startDate || q.endDate) && {
        date: { ...(q.startDate && { gte: q.startDate }), ...(q.endDate && { lte: q.endDate }) },
      }),
    };
    const [items, total] = await Promise.all([
      prisma.weightEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.weightEntry.count({ where }),
    ]);
    return paginated(items, total, q.page, q.limit);
  },

  getOwned: async (userId: string, id: string) => {
    const entry = await prisma.weightEntry.findFirst({ where: { id, userId } });
    if (!entry) throw NotFound('Weight entry not found');
    return entry;
  },

  remove: async (userId: string, id: string) => {
    await weightService.getOwned(userId, id);
    await prisma.weightEntry.delete({ where: { id } });
  },
};
