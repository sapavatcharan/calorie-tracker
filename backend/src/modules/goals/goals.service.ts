import { prisma } from '../../lib/prisma';
import { NotFound } from '../../core/errors';
import { paginated } from '../../core/pagination';
import type { z } from 'zod';
import type { createGoalBody, listGoalsQuery, updateGoalBody } from './goals.schema';

export const goalService = {
  create: async (userId: string, data: z.infer<typeof createGoalBody>) => {
    return prisma.$transaction(async (tx) => {
      await tx.goal.updateMany({ where: { userId, isActive: true }, data: { isActive: false } });
      return tx.goal.create({ data: { ...data, userId, isActive: true } });
    });
  },

  list: async (userId: string, q: z.infer<typeof listGoalsQuery>) => {
    const where = { userId };
    const [items, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.goal.count({ where }),
    ]);
    return paginated(items, total, q.page, q.limit);
  },

  current: async (userId: string) => {
    const goal = await prisma.goal.findFirst({ where: { userId, isActive: true } });
    if (!goal) throw NotFound('No active goal');
    return goal;
  },

  getOwned: async (userId: string, id: string) => {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw NotFound('Goal not found');
    return goal;
  },

  update: async (userId: string, id: string, data: z.infer<typeof updateGoalBody>) => {
    await goalService.getOwned(userId, id);
    return prisma.$transaction(async (tx) => {
      if (data.isActive === true) {
        await tx.goal.updateMany({
          where: { userId, isActive: true, NOT: { id } },
          data: { isActive: false },
        });
      }
      return tx.goal.update({ where: { id }, data });
    });
  },

  remove: async (userId: string, id: string) => {
    await goalService.getOwned(userId, id);
    await prisma.goal.delete({ where: { id } });
  },
};
