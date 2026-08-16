import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

describe('meals ownership & pagination', () => {
  let tokenA: string;
  let tokenB: string;
  let mealId: string;

  beforeAll(async () => {
    tokenA = await makeUser();
    tokenB = await makeUser();
    const m = await request(app)
      .post('/api/meals')
      .set(auth(tokenA))
      .send({ foodName: 'Egg', mealType: 'BREAKFAST', quantity: 1, calories: 78 });
    mealId = m.body.id;
  });

  it('blocks cross-user access', async () => {
    const res = await request(app).get(`/api/meals/${mealId}`).set(auth(tokenB));
    expect(res.status).toBe(404);
  });

  it('returns a pagination envelope', async () => {
    const res = await request(app).get('/api/meals?limit=10').set(auth(tokenA));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      totalPages: expect.any(Number),
      hasNext: expect.any(Boolean),
      hasPrev: false,
    });
  });

  it('rejects page=0 and limit above 100', async () => {
    const page0 = await request(app).get('/api/meals?page=0').set(auth(tokenA));
    expect(page0.status).toBe(400);
    const over = await request(app).get('/api/meals?limit=9999').set(auth(tokenA));
    expect(over.status).toBe(400);
  });

  it('includes a meal later the same UTC day when endDate is date-only', async () => {
    const token = await makeUser();
    const created = await request(app)
      .post('/api/meals')
      .set(auth(token))
      .send({
        foodName: 'Late snack',
        mealType: 'SNACKS',
        quantity: 1,
        calories: 120,
        date: '2026-08-16T18:30:00.000Z',
      });
    expect(created.status).toBe(201);

    const res = await request(app)
      .get('/api/meals')
      .query({ startDate: '2026-08-16', endDate: '2026-08-16', limit: 10 })
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data.some((m: { foodName: string }) => m.foodName === 'Late snack')).toBe(true);
  });
});
