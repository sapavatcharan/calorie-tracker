import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

describe('weight', () => {
  let tokenA: string;
  let tokenB: string;
  let entryId: string;

  beforeAll(async () => {
    tokenA = await makeUser();
    tokenB = await makeUser();
  });

  it('creates an entry and lists a pagination envelope', async () => {
    const created = await request(app).post('/api/weight').set(auth(tokenA)).send({ weight: 72.5 });
    expect(created.status).toBe(201);
    expect(created.body.weight).toBe(72.5);
    entryId = created.body.id;

    const list = await request(app).get('/api/weight?page=1&limit=10').set(auth(tokenA));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('returns 404 on cross-user DELETE', async () => {
    const res = await request(app).delete(`/api/weight/${entryId}`).set(auth(tokenB));
    expect(res.status).toBe(404);
  });
});
