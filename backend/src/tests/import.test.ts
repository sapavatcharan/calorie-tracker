import { beforeAll, describe, expect, it, vi } from 'vitest';

const generateContent = vi.fn();

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent };
    }
  },
}));

vi.mock('pdf-parse', () => ({
  PDFParse: class {
    async getText() {
      return { text: 'Oats 300 kcal; Chicken 400 kcal' };
    }
    async destroy() {}
  },
}));

import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

const previewMeals = [
  { foodName: 'Oats', mealType: 'BREAKFAST', quantity: 1, calories: 300, protein: 10, carbs: 50, fat: 5 },
  { foodName: 'Chicken', mealType: 'DINNER', quantity: 1, calories: 400, protein: 40, carbs: 0, fat: 12 },
];

describe('PDF import', () => {
  let token: string;

  beforeAll(async () => {
    token = await makeUser();
    generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(previewMeals) },
    });
  });

  it('returns a 2-meal preview without saving', async () => {
    const res = await request(app)
      .post('/api/import/pdf')
      .set(auth(token))
      .attach('pdf', Buffer.from('%PDF-1.4 dummy'), { filename: 'meals.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(200);
    expect(res.body.preview).toHaveLength(2);
    expect(res.body.preview[0].foodName).toBe('Oats');

    const meals = await request(app).get('/api/meals').set(auth(token));
    expect(meals.body.pagination.total).toBe(0);
  });

  it('confirms and saves 2 meals', async () => {
    const res = await request(app)
      .post('/api/import/pdf/confirm')
      .set(auth(token))
      .send({ meals: previewMeals });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ imported: 2 });

    const meals = await request(app).get('/api/meals').set(auth(token));
    expect(meals.body.pagination.total).toBe(2);
  });
});
