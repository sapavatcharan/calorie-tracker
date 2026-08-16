import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

describe('goals', () => {
  let token: string;
  let firstId: string;
  let secondId: string;

  beforeAll(async () => {
    token = await makeUser();
  });

  it('creates a goal then deactivates it when a second is created', async () => {
    const first = await request(app)
      .post('/api/goals')
      .set(auth(token))
      .send({ dailyCalories: 2000, dailyProtein: 150 });
    expect(first.status).toBe(201);
    expect(first.body.isActive).toBe(true);
    firstId = first.body.id;

    const second = await request(app)
      .post('/api/goals')
      .set(auth(token))
      .send({ dailyCalories: 1800, dailyProtein: 140, dailyCarbs: 200, dailyFat: 60 });
    expect(second.status).toBe(201);
    expect(second.body.isActive).toBe(true);
    secondId = second.body.id;

    const list = await request(app).get('/api/goals?limit=10').set(auth(token));
    expect(list.status).toBe(200);
    expect(list.body).toHaveProperty('data');
    expect(list.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    const active = list.body.data.filter((g: { isActive: boolean }) => g.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe(second.body.id);
    expect(list.body.data.find((g: { id: string }) => g.id === firstId).isActive).toBe(false);

    const current = await request(app).get('/api/goals/current').set(auth(token));
    expect(current.status).toBe(200);
    expect(current.body.id).toBe(second.body.id);
  });

  it('PATCH reactivating a goal deactivates the others', async () => {
    const patched = await request(app)
      .patch(`/api/goals/${firstId}`)
      .set(auth(token))
      .send({ isActive: true });
    expect(patched.status).toBe(200);
    expect(patched.body.isActive).toBe(true);

    const list = await request(app).get('/api/goals').set(auth(token));
    const active = list.body.data.filter((g: { isActive: boolean }) => g.isActive);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe(firstId);
    expect(list.body.data.find((g: { id: string }) => g.id === secondId).isActive).toBe(false);
  });

  it('DELETE current goal then GET /current → 404', async () => {
    const del = await request(app).delete(`/api/goals/${firstId}`).set(auth(token));
    expect(del.status).toBe(204);

    const current = await request(app).get('/api/goals/current').set(auth(token));
    expect(current.status).toBe(404);
  });
});
