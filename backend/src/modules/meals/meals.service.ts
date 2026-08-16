import { prisma } from '../../lib/prisma';
import { NotFound } from '../../core/errors';
import { paginated } from '../../core/pagination';
import type { z } from 'zod';
import type { createMealBody, listMealsQuery } from './meals.schema';

export const mealService = {
  create: (userId: string, data: z.infer<typeof createMealBody>) =>
    prisma.mealEntry.create({ data: { ...data, userId } }),

  list: async (userId: string, q: z.infer<typeof listMealsQuery>) => {
    const where = {
      userId,
      ...(q.mealType && { mealType: q.mealType }),
      ...((q.startDate || q.endDate) && {
        date: { ...(q.startDate && { gte: q.startDate }), ...(q.endDate && { lte: q.endDate }) },
      }),
    };
    const [items, total] = await Promise.all([
      prisma.mealEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.mealEntry.count({ where }),
    ]);
    return paginated(items, total, q.page, q.limit);
  },

  getOwned: async (userId: string, id: string) => {
    const meal = await prisma.mealEntry.findFirst({ where: { id, userId } });
    if (!meal) throw NotFound('Meal not found');
    return meal;
  },

  update: async (userId: string, id: string, data: Partial<z.infer<typeof createMealBody>>) => {
    await mealService.getOwned(userId, id);
    return prisma.mealEntry.update({ where: { id }, data });
  },

  remove: async (userId: string, id: string) => {
    await mealService.getOwned(userId, id);
    await prisma.mealEntry.delete({ where: { id } });
  },
};
