import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: () => ({
          sendMessage: async () => {
            const err = new Error('[429 Too Many Requests] You exceeded your current quota') as Error & {
              status: number;
            };
            err.status = 429;
            throw err;
          },
        }),
      };
    }
  },
}));

import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';
import { AI_BUSY_MESSAGE } from '../core/geminiFallback';

describe('chat when every Gemini model is rate-limited', () => {
  let token: string;

  beforeAll(async () => {
    token = await makeUser();
  });

  it('returns 429 with the friendly message, not 500', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set(auth(token))
      .send({ message: 'Log a banana for snack, 105 calories' });
    expect(res.status).toBe(429);
    expect(res.body.message).toBe(AI_BUSY_MESSAGE);
    expect(res.body.message).not.toMatch(/internal server error/i);
  });
});
