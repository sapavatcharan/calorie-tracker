export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACKS";

/** Display order for grouped meal lists; skip empty groups. */
export const MEAL_SECTION_ORDER: readonly MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACKS"];

export const MEAL_TYPES: MealType[] = [...MEAL_SECTION_ORDER];

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Paginated<T> = { data: T[]; pagination: Pagination };

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Meal = {
  id: string;
  userId: string;
  goalId: string | null;
  foodName: string;
  quantity: number;
  mealType: MealType;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  micronutrients: Record<string, number> | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type MealInput = {
  foodName: string;
  mealType: MealType;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  micronutrients?: Record<string, number>;
  date?: string;
};

export type Goal = {
  id: string;
  userId: string;
  dailyCalories: number;
  dailyProtein: number | null;
  dailyCarbs: number | null;
  dailyFat: number | null;
  weightGoal: number | null;
  micronutrients: Record<string, number> | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = {
  dailyCalories: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  weightGoal?: number;
};

export type WeightEntry = {
  id: string;
  userId: string;
  weight: number;
  date: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type NutritionExtract = {
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: number;
  micronutrients: Record<string, number>;
};
