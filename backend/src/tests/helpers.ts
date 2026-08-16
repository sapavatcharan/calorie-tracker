import request from 'supertest';
import app from '../app';

export async function makeUser(email = `u${Date.now()}${Math.random().toString(16).slice(2)}@t.com`) {
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  return res.body.token as string;
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
