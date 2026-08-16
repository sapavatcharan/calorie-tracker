import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('auth', () => {
  const email = `phase1-${Date.now()}@t.com`;
  const password = 'password123';
  let token: string;

  it('registers a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password, name: 'Ada' });
    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();
    token = res.body.token;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password });
    expect(res.status).toBe(409);
  });

  it('rejects a short password via Zod', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `short-${Date.now()}@t.com`, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('logs in and returns /me', async () => {
    const login = await request(app).post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it('rejects missing auth on /me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('health & 404', () => {
  it('returns ok from /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('sends unknown routes through the central handler', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
