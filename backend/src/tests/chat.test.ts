import { beforeAll, describe, expect, it, vi } from 'vitest';

const sendMessage = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        startChat: () => ({ sendMessage }),
      };
    }
  },
}));

import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

describe('chat function-calling', () => {
  let token: string;

  beforeAll(async () => {
    token = await makeUser();
    let hop = 0;
    sendMessage.mockImplementation(async () => {
      hop += 1;
      if (hop === 1) {
        return {
          response: {
            functionCalls: () => [
              {
                name: 'log_meal',
                args: { foodName: 'Apple', mealType: 'SNACKS', quantity: 1, calories: 95 },
              },
            ],
            text: () => '',
          },
        };
      }
      return {
        response: {
          functionCalls: () => [],
          text: () => 'Logged Apple for you.',
        },
      };
    });
  });

  it('persists a meal via log_meal and returns a reply; loop terminates', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .set(auth(token))
      .send({ message: 'Log an apple snack, 95 calories' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Logged Apple for you.');
    expect(sendMessage.mock.calls.length).toBe(2);
    expect(sendMessage.mock.calls.length).toBeLessThanOrEqual(6);

    const meals = await request(app).get('/api/meals').set(auth(token));
    expect(meals.body.data.some((m: { foodName: string }) => m.foodName === 'Apple')).toBe(true);
  });

  it('GET /history returns a pagination envelope', async () => {
    const res = await request(app).get('/api/chat/history?page=1&limit=10').set(auth(token));
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
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
  });

  it('returns a non-empty reply after a read-style function call then a text summary', async () => {
    let hop = 0;
    sendMessage.mockReset();
    sendMessage.mockImplementation(async () => {
      hop += 1;
      if (hop === 1) {
        return {
          response: {
            functionCalls: () => [{ name: 'list_meals', args: {} }],
            text: () => '',
          },
        };
      }
      return {
        response: {
          functionCalls: () => [],
          text: () => 'You have logged 95 kcal today.',
        },
      };
    });

    const res = await request(app)
      .post('/api/chat/message')
      .set(auth(token))
      .send({ message: 'how many calories have I logged today?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBeTruthy();
    expect(res.body.reply).toBe('You have logged 95 kcal today.');
    expect(sendMessage.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(sendMessage.mock.calls.length).toBeLessThanOrEqual(6);
  });

  it('synthesizes a calorie sentence when the model replies Done after list_meals', async () => {
    let hop = 0;
    sendMessage.mockReset();
    sendMessage.mockImplementation(async () => {
      hop += 1;
      if (hop === 1) {
        return {
          response: {
            functionCalls: () => [{ name: 'list_meals', args: {} }],
            text: () => '',
          },
        };
      }
      return {
        response: {
          functionCalls: () => [],
          text: () => 'Done.',
        },
      };
    });

    const res = await request(app)
      .post('/api/chat/message')
      .set(auth(token))
      .send({ message: 'how many calories have I logged today?' });

    expect(res.status).toBe(200);
    expect(res.body.reply).not.toMatch(/^Done\.?$/i);
    expect(res.body.reply).toMatch(/\d/);
    expect(res.body.reply.toLowerCase()).toMatch(/calor/);
  });
});
