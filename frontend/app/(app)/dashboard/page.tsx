"use client";

import { NutritionFacts } from "@/components/Progress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MealTypeBadge } from "@/components/ui/Badge";
import { CountUp } from "@/components/CountUp";
import { MealGroupHeader, MealMacros, groupMealsByType } from "@/components/MealList";
import api, { apiErrorMessage } from "@/lib/api";
import { endOfDayIso, startOfDayIso } from "@/lib/dates";
import { MEAL_TYPE_LABEL, type Goal, type Meal, type Paginated } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Flame, LayoutDashboard, Salad, UtensilsCrossed, Wheat } from "lucide-react";
import Link from "next/link";

function StatTile({
  label,
  value,
  hint,
  tone: _tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "emerald" | "protein" | "carbs" | "fat";
  icon: typeof Flame;
}) {
  return (
    <div className="min-w-0 rounded-[12px] border border-line bg-surface px-4 py-3">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className="text-muted" strokeWidth={1.75} />
        <p className="truncate text-[12px] text-muted">{label}</p>
      </div>
      <p className="mt-2 font-mono text-[24px] leading-none tabular-nums text-ink">
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      {hint ? <p className="mt-1 truncate text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}

function localDayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loggingStreak(meals: Meal[]) {
  const days = new Set(meals.map((m) => localDayKey(m.date)));
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (!days.has(key(cur))) cur.setDate(cur.getDate() - 1);
  while (days.has(key(cur))) {
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export default function DashboardPage() {
  const goalQuery = useQuery({
    queryKey: ["goals", "current"],
    queryFn: async () => {
      try {
        const { data } = await api.get<Goal>("/api/goals/current");
        return data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  const mealsQuery = useQuery({
    queryKey: ["meals", "today"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Meal>>("/api/meals", {
        params: { page: 1, limit: 100, startDate: startOfDayIso(), endDate: endOfDayIso() },
      });
      return data;
    },
  });

  const recentQuery = useQuery({
    queryKey: ["meals", "streak"],
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - 21);
      start.setHours(0, 0, 0, 0);
      const { data } = await api.get<Paginated<Meal>>("/api/meals", {
        params: { page: 1, limit: 100, startDate: start.toISOString(), endDate: endOfDayIso() },
      });
      return data.data;
    },
  });

  const meals = mealsQuery.data?.data ?? [];
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + (m.protein ?? 0),
      carbs: acc.carbs + (m.carbs ?? 0),
      fat: acc.fat + (m.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const goal = goalQuery.data;
  const calLeft = goal ? Math.max(0, Math.round(goal.dailyCalories - totals.calories)) : null;
  const proteinLeft = goal?.dailyProtein != null ? Math.max(0, Math.round(goal.dailyProtein - totals.protein)) : null;
  const streak = loggingStreak(recentQuery.data ?? meals);

  return (
    <div className="stagger">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle icon={LayoutDashboard}>Today</PageTitle>
        <div className="flex gap-2">
          <Link href="/meals">
            <Button type="button">Log meal</Button>
          </Link>
          <Link href="/chat">
            <Button type="button" variant="ghost">
              Chat
            </Button>
          </Link>
        </div>
      </div>

      {goalQuery.isLoading || mealsQuery.isLoading ? <LoadingState variant="page" /> : null}
      {goalQuery.isError ? <ErrorState message={apiErrorMessage(goalQuery.error)} /> : null}
      {mealsQuery.isError ? <ErrorState message={apiErrorMessage(mealsQuery.error)} /> : null}

      {!goalQuery.isLoading && !mealsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Calories left"
            value={calLeft ?? "—"}
            hint={goal ? "vs daily goal" : "Set a goal"}
            tone="emerald"
            icon={Flame}
          />
          <StatTile
            label="Protein left"
            value={proteinLeft ?? "—"}
            hint={proteinLeft != null ? "grams" : "Set a goal"}
            tone="protein"
            icon={Salad}
          />
          <StatTile label="Streak" value={streak} hint="days logged" tone="carbs" icon={Wheat} />
          <StatTile label="Meals today" value={meals.length} hint="entries" tone="fat" icon={UtensilsCrossed} />
        </div>
      ) : null}

      {!goalQuery.isLoading && !mealsQuery.isLoading ? (
        <NutritionFacts
          showRing={Boolean(goal)}
          calories={totals.calories}
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          calorieGoal={goal?.dailyCalories}
          proteinGoal={goal?.dailyProtein}
          carbsGoal={goal?.dailyCarbs}
          fatGoal={goal?.dailyFat}
        />
      ) : null}

      {!goal && !goalQuery.isLoading && !goalQuery.isError ? (
        <EmptyState
          title="No active goal"
          hint="Set a daily calorie goal to see percent of goal."
          action={
            <Link href="/goals">
              <Button type="button">Save goal</Button>
            </Link>
          }
        />
      ) : null}

      <Card>
        <SectionHeading eyebrow="Log" title="Today's meals" />
        {meals.length === 0 ? (
          <EmptyState
            title="No meals yet today. Log your first one."
            action={
              <Link href="/meals">
                <Button type="button">Log meal</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4 text-[14px]">
            {groupMealsByType(meals).map((g) => (
              <li key={g.type}>
                <MealGroupHeader type={g.type} items={g.items} />
                <ul className="divide-y divide-line">
                  {g.items.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-2 hover:bg-inset"
                    >
                      <span className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                        <span className="truncate font-medium">{m.foodName}</span>
                        <MealTypeBadge type={m.mealType} label={MEAL_TYPE_LABEL[m.mealType]} />
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                        <MealMacros meal={m} />
                        <span className="font-mono tabular-nums text-muted">{Math.round(m.calories)} kcal</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
