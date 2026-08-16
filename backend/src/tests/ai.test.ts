import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
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

describe('AI extraction', () => {
  let token: string;

  beforeEach(async () => {
    generateContent.mockReset();
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
      headers: { get: () => 'image/jpeg' },
    } as Response);
    token = await makeUser();
  });

  it('parses fenced JSON and validates shape', async () => {
    generateContent.mockResolvedValue({
      response: { text: () => '```json\n{"foodName":"Apple","calories":95,"micronutrients":{}}\n```' },
    });

    const res = await request(app)
      .post('/api/ai/extract-nutrition')
      .set(auth(token))
      .send({ imageUrl: 'http://example.com/apple.jpg' });

    expect(res.status).toBe(200);
    expect(res.body.foodName).toBe('Apple');
    expect(res.body.calories).toBe(95);
    expect(res.body.micronutrients).toEqual({});
  });

  it('returns 422 when foodName is missing', async () => {
    generateContent.mockResolvedValue({
      response: { text: () => '{"calories":95}' },
    });

    const res = await request(app)
      .post('/api/ai/extract-nutrition')
      .set(auth(token))
      .send({ imageUrl: 'http://example.com/x.jpg' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for non-JSON output', async () => {
    generateContent.mockResolvedValue({
      response: { text: () => 'not json at all' },
    });

    const res = await request(app)
      .post('/api/ai/extract-nutrition')
      .set(auth(token))
      .send({ imageUrl: 'http://example.com/x.jpg' });

    expect(res.status).toBe(422);
  });

  it('returns 422 with an upload hint when the URL is not an image', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
      headers: { get: () => 'text/html' },
    } as Response);

    const res = await request(app)
      .post('/api/ai/extract-nutrition')
      .set(auth(token))
      .send({ imageUrl: 'http://example.com/blocked' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Couldn't fetch that image URL — try uploading the file instead");
  });
});
