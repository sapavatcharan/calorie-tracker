import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import { auth, makeUser } from './helpers';

describe('reports', () => {
  let token: string;

  beforeAll(async () => {
    token = await makeUser();
    const goal = await request(app)
      .post('/api/goals')
      .set(auth(token))
      .send({ dailyCalories: 2000, dailyProtein: 150, dailyCarbs: 200, dailyFat: 70 });
    expect(goal.status).toBe(201);

    const meals = [
      {
        foodName: 'Oats',
        mealType: 'BREAKFAST',
        quantity: 1,
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 5,
        micronutrients: { iron: 2, vitaminC: 1 },
        date: '2026-08-10T08:00:00.000Z',
      },
      {
        foodName: 'Rice',
        mealType: 'LUNCH',
        quantity: 1,
        calories: 200,
        protein: 5,
        carbs: 40,
        fat: 2,
        micronutrients: { iron: 1 },
        date: '2026-08-10T12:00:00.000Z',
      },
      {
        foodName: 'Chicken',
        mealType: 'DINNER',
        quantity: 1,
        calories: 400,
        protein: 40,
        carbs: 0,
        fat: 12,
        micronutrients: { vitaminC: 3 },
        date: '2026-08-11T19:00:00.000Z',
      },
    ];

    for (const meal of meals) {
      const res = await request(app).post('/api/meals').set(auth(token)).send(meal);
      expect(res.status).toBe(201);
    }
  });

  it('sums weekly-trend calories by day for the fixture', async () => {
    const res = await request(app)
      .get('/api/reports/weekly-trend')
      .query({ startDate: '2026-08-10T00:00:00.000Z', endDate: '2026-08-11T23:59:59.000Z' })
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      { date: '2026-08-10', calories: 500 },
      { date: '2026-08-11', calories: 400 },
    ]);
  });

  it('scales goal-comparison by inclusive window days', async () => {
    const res = await request(app)
      .get('/api/reports/goal-comparison')
      .query({ startDate: '2026-08-10T00:00:00.000Z', endDate: '2026-08-11T23:59:59.000Z' })
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.days).toBe(2);
    expect(res.body.goal).toEqual({ calories: 4000, protein: 300, carbs: 400, fat: 140 });
    expect(res.body.actual).toEqual({ calories: 900, protein: 55, carbs: 90, fat: 19 });
    const byName = Object.fromEntries(res.body.perNutrient.map((n: { name: string }) => [n.name, n]));
    expect(byName.calories).toMatchObject({ goal: 4000, actual: 900, pct: (900 / 4000) * 100 });
  });

  it('sums micronutrients with a finite-number guard', async () => {
    const res = await request(app)
      .get('/api/reports/micronutrients')
      .query({ startDate: '2026-08-10T00:00:00.000Z', endDate: '2026-08-11T23:59:59.000Z' })
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ iron: 3, vitaminC: 4 });
  });

  it('includes later-same-day meals when endDate is date-only', async () => {
    const res = await request(app)
      .get('/api/reports/weekly-trend')
      .query({ startDate: '2026-08-11', endDate: '2026-08-11' })
      .set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ date: '2026-08-11', calories: 400 }]);
  });

  it('reads ~100% when each of 7 days hits the daily goal', async () => {
    const atGoal = await makeUser();
    const goal = await request(app)
      .post('/api/goals')
      .set(auth(atGoal))
      .send({ dailyCalories: 2000, dailyProtein: 150, dailyCarbs: 250, dailyFat: 65 });
    expect(goal.status).toBe(201);

    for (let i = 0; i < 7; i += 1) {
      const day = String(10 + i).padStart(2, '0');
      const res = await request(app)
        .post('/api/meals')
        .set(auth(atGoal))
        .send({
          foodName: `Day ${i + 1} plate`,
          mealType: 'LUNCH',
          quantity: 1,
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 65,
          date: `2026-08-${day}T12:00:00.000Z`,
        });
      expect(res.status).toBe(201);
    }

    const res = await request(app)
      .get('/api/reports/goal-comparison')
      .query({ startDate: '2026-08-10', endDate: '2026-08-16' })
      .set(auth(atGoal));
    expect(res.status).toBe(200);
    expect(res.body.days).toBe(7);
    expect(res.body.goal).toEqual({ calories: 14000, protein: 1050, carbs: 1750, fat: 455 });
    expect(res.body.actual).toEqual({ calories: 14000, protein: 1050, carbs: 1750, fat: 455 });
    const byName = Object.fromEntries(res.body.perNutrient.map((n: { name: string }) => [n.name, n]));
    expect(byName.calories.pct).toBe(100);
    expect(byName.protein.pct).toBe(100);
    expect(byName.carbs.pct).toBe(100);
    expect(byName.fat.pct).toBe(100);
  });
});
