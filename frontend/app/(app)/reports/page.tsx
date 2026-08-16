"use client";

import { GoalComparisonChart } from "@/components/charts/GoalComparisonChart";
import { MacroChart } from "@/components/charts/MacroChart";
import { MicronutrientChart } from "@/components/charts/MicronutrientChart";
import { WeeklyTrendChart } from "@/components/charts/WeeklyTrendChart";
import { NutritionFacts } from "@/components/Progress";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import api, { apiErrorMessage } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";
import { useState } from "react";

type NutrientRow = { name: string; goal: number; actual: number; pct: number };

type GoalComparison = {
  days: number;
  goal: { calories: number; protein: number; carbs: number; fat: number };
  actual: { calories: number; protein: number; carbs: number; fat: number };
  perNutrient: NutrientRow[];
};

export default function ReportsPage() {
  const [groupBy, setGroupBy] = useState<"day" | "week">("day");

  const weekly = useQuery({
    queryKey: ["reports", "weekly"],
    queryFn: async () => {
      const { data } = await api.get<{ data: { date: string; calories: number }[] }>("/api/reports/weekly-trend");
      return data.data;
    },
  });

  const macros = useQuery({
    queryKey: ["reports", "macros", groupBy],
    queryFn: async () => {
      const { data } = await api.get<{ data: { period: string; protein: number; carbs: number; fat: number }[] }>(
        "/api/reports/macros",
        { params: { groupBy } },
      );
      return data.data;
    },
  });

  const micros = useQuery({
    queryKey: ["reports", "micros"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Record<string, number> }>("/api/reports/micronutrients");
      return data.data;
    },
  });

  const comparison = useQuery({
    queryKey: ["reports", "comparison"],
    queryFn: async () => {
      try {
        const { data } = await api.get<GoalComparison>("/api/reports/goal-comparison");
        return data;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
  });

  const days = comparison.data?.days ?? 0;
  const actual = comparison.data?.actual;
  const goal = comparison.data?.goal;

  return (
    <div className="stagger">
      <PageTitle icon={ChartNoAxesCombined}>Reports</PageTitle>

      {comparison.isLoading ? (
        <LoadingState />
      ) : actual && goal ? (
        <NutritionFacts
          title="Nutrition Facts"
          caption={`Window total · ${days} day${days === 1 ? "" : "s"}`}
          calories={actual.calories}
          protein={actual.protein}
          carbs={actual.carbs}
          fat={actual.fat}
          calorieGoal={goal.calories}
          proteinGoal={goal.protein}
          carbsGoal={goal.carbs}
          fatGoal={goal.fat}
          goalDenomLabel={`for ${days} day${days === 1 ? "" : "s"}`}
        />
      ) : !comparison.isLoading && comparison.data === null ? (
        <NutritionFacts
          title="Nutrition Facts"
          caption="Window total"
          calories={weekly.data?.reduce((s, d) => s + d.calories, 0) ?? 0}
          protein={0}
          carbs={0}
          fat={0}
        />
      ) : (
        <LoadingState />
      )}

      <Card>
        <SectionHeading eyebrow="Trend" title="Calories" />
        {weekly.isLoading ? <LoadingState variant="chart" /> : null}
        {weekly.isError ? <ErrorState message={apiErrorMessage(weekly.error)} /> : null}
        {weekly.data && weekly.data.length > 0 ? (
          <WeeklyTrendChart data={weekly.data} />
        ) : (
          <EmptyState
            title="No meals in this window"
            action={
              <Link href="/meals">
                <Button type="button">Log meal</Button>
              </Link>
            }
          />
        )}
      </Card>

      <Card>
        <SectionHeading
          eyebrow="Breakdown"
          title="Macros"
          actions={
            <>
              <Button
                type="button"
                variant="ghost"
                className={groupBy === "day" ? "bg-inset text-ink" : ""}
                onClick={() => setGroupBy("day")}
              >
                Day
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={groupBy === "week" ? "bg-inset text-ink" : ""}
                onClick={() => setGroupBy("week")}
              >
                Week
              </Button>
            </>
          }
        />
        {macros.isLoading ? <LoadingState variant="chart" /> : null}
        {macros.isError ? <ErrorState message={apiErrorMessage(macros.error)} /> : null}
        {macros.data && macros.data.length > 0 ? (
          <MacroChart data={macros.data} />
        ) : (
          <EmptyState title="No macro data yet" />
        )}
      </Card>

      <Card>
        <SectionHeading eyebrow="Micros" title="Micronutrients" />
        {micros.isError ? <ErrorState message={apiErrorMessage(micros.error)} /> : null}
        {micros.data && Object.keys(micros.data).length > 0 ? (
          <MicronutrientChart data={micros.data} />
        ) : (
          <EmptyState title="No micronutrient data" hint="Add micros when logging meals to see this chart." />
        )}
      </Card>

      <Card>
        <SectionHeading eyebrow={days ? `${days}-day window` : "Window"} title="Goal vs actual" />
        {comparison.isLoading ? <LoadingState variant="chart" /> : null}
        {comparison.isError ? <ErrorState message={apiErrorMessage(comparison.error)} /> : null}
        {comparison.data === null ? (
          <EmptyState
            title="No active goal"
            hint="Set a goal to compare against your intake."
            action={
              <Link href="/goals">
                <Button type="button">Save goal</Button>
              </Link>
            }
          />
        ) : comparison.data && comparison.data.perNutrient.length > 0 ? (
          <GoalComparisonChart data={comparison.data.perNutrient} />
        ) : (
          <EmptyState title="Nothing to compare yet" />
        )}
      </Card>
    </div>
  );
}
