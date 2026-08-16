import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel({ model }: { model: string }) {
      return {
        generateContent: async () => {
          if (model === 'not-a-real-model') {
            const err = new Error(`This model models/${model} is no longer available`) as Error & { status: number };
            err.status = 404;
            throw err;
          }
          if (model === 'gemini-flash-lite-latest' || model === 'gemini-3.5-flash-lite') {
            const err = new Error('[429 Too Many Requests] You exceeded your current quota') as Error & {
              status: number;
            };
            err.status = 429;
            throw err;
          }
          if (model.startsWith('fail-all')) {
            const err = new Error('[429 Too Many Requests] quota') as Error & { status: number };
            err.status = 429;
            throw err;
          }
          return {
            response: { text: () => '{"foodName":"Banana","calories":105,"micronutrients":{}}' },
          };
        },
      };
    }
  },
}));

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
    headers: { get: () => 'image/jpeg' },
  })),
);

import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';
import { AI_BUSY_MESSAGE } from '../core/geminiFallback';
import { config } from '../config';

describe('AI extraction model fallback', () => {
  let token: string;

  beforeEach(async () => {
    token = await makeUser();
  });

  it('succeeds when the first two models return 429', async () => {
    expect(config.GEMINI_VISION_MODELS[0]).toBe('gemini-flash-lite-latest');
    expect(config.GEMINI_VISION_MODELS[1]).toBe('gemini-3.5-flash-lite');
    const res = await request(app)
      .post('/api/ai/extract-nutrition')
      .set(auth(token))
      .send({ imageUrl: 'http://example.com/banana.jpg' });
    expect(res.status).toBe(200);
    expect(res.body.foodName).toBe('Banana');
    expect(res.body.calories).toBe(105);
  });
});
