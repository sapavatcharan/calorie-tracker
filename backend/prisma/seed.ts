import 'dotenv/config';
import bcrypt from 'bcrypt';
import { MealType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMAIL = (process.env.SEED_EMAIL ?? 'demo@plate.app').toLowerCase();
const PASSWORD = process.env.SEED_PASSWORD ?? 'DemoPass123!';

const SEED_FOODS = [
  'Overnight oats',
  'Scrambled eggs',
  'Chicken rice bowl',
  'Apple',
  'Salmon and vegetables',
  'Greek yogurt',
] as const;

type DayMeal = {
  foodName: (typeof SEED_FOODS)[number];
  mealType: MealType;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  hour: number;
  micronutrients?: Record<string, number>;
};

const DAY: DayMeal[] = [
  {
    foodName: 'Overnight oats',
    mealType: 'BREAKFAST',
    quantity: 1,
    calories: 340,
    protein: 12,
    carbs: 54,
    fat: 8,
    hour: 8,
    micronutrients: { iron: 2, vitaminC: 4 },
  },
  {
    foodName: 'Scrambled eggs',
    mealType: 'BREAKFAST',
    quantity: 2,
    calories: 220,
    protein: 16,
    carbs: 2,
    fat: 16,
    hour: 8,
  },
  {
    foodName: 'Chicken rice bowl',
    mealType: 'LUNCH',
    quantity: 1,
    calories: 620,
    protein: 42,
    carbs: 68,
    fat: 16,
    hour: 13,
    micronutrients: { iron: 3 },
  },
  {
    foodName: 'Apple',
    mealType: 'SNACKS',
    quantity: 1,
    calories: 95,
    protein: 0,
    carbs: 25,
    fat: 0,
    hour: 16,
    micronutrients: { vitaminC: 8 },
  },
  {
    foodName: 'Salmon and vegetables',
    mealType: 'DINNER',
    quantity: 1,
    calories: 520,
    protein: 38,
    carbs: 28,
    fat: 24,
    hour: 19,
    micronutrients: { vitaminD: 12 },
  },
  {
    foodName: 'Greek yogurt',
    mealType: 'SNACKS',
    quantity: 1,
    calories: 150,
    protein: 14,
    carbs: 12,
    fat: 4,
    hour: 21,
    micronutrients: { calcium: 180 },
  },
];

function atDay(daysAgo: number, hour: number) {
  const d = new Date();
  d.setUTCHours(hour, 15, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

async function main() {
  const password = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { name: 'Demo' },
    create: { email: EMAIL, password, name: 'Demo' },
  });

  await prisma.mealEntry.deleteMany({ where: { userId: user.id, foodName: { in: [...SEED_FOODS] } } });
  await prisma.weightEntry.deleteMany({
    where: { userId: user.id, weight: { in: [72.4, 72.8, 73.1, 73.5, 73.8] } },
  });
  await prisma.goal.updateMany({ where: { userId: user.id }, data: { isActive: false } });

  await prisma.goal.create({
    data: {
      userId: user.id,
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 250,
      dailyFat: 65,
      weightGoal: 70,
      isActive: true,
    },
  });

  const meals = [];
  for (let daysAgo = 0; daysAgo < 7; daysAgo += 1) {
    for (const m of DAY) {
      meals.push({
        userId: user.id,
        foodName: m.foodName,
        mealType: m.mealType,
        quantity: m.quantity,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        micronutrients: m.micronutrients ?? undefined,
        date: atDay(daysAgo, m.hour),
      });
    }
  }
  await prisma.mealEntry.createMany({ data: meals });

  const weights = [0, 3, 7, 10, 14].map((daysAgo, i) => ({
    userId: user.id,
    weight: [72.4, 72.8, 73.1, 73.5, 73.8][i],
    date: atDay(daysAgo, 7),
  }));
  await prisma.weightEntry.createMany({ data: weights });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
