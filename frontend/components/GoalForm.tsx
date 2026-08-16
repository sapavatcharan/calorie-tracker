"use client";

import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Input";
import type { Goal, GoalInput } from "@/lib/types";
import { useEffect, useState } from "react";

export function GoalForm({
  initial,
  onSubmit,
  busy,
}: {
  initial?: Goal | null;
  onSubmit: (data: GoalInput) => Promise<unknown> | void;
  busy?: boolean;
}) {
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [error, setError] = useState<string | undefined>();
  const [dailyProtein, setDailyProtein] = useState<string>("");
  const [dailyCarbs, setDailyCarbs] = useState<string>("");
  const [dailyFat, setDailyFat] = useState<string>("");
  const [weightGoal, setWeightGoal] = useState<string>("");

  useEffect(() => {
    if (!initial) return;
    setDailyCalories(initial.dailyCalories);
    setDailyProtein(initial.dailyProtein?.toString() ?? "");
    setDailyCarbs(initial.dailyCarbs?.toString() ?? "");
    setDailyFat(initial.dailyFat?.toString() ?? "");
    setWeightGoal(initial.weightGoal?.toString() ?? "");
  }, [initial]);

  function opt(v: string) {
    if (v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  return (
    <div className="space-y-0">
      <div className="grid gap-4 pb-4 sm:grid-cols-2">
        <Field label="Daily calories" error={error}>
          <Input type="number" min={1} value={dailyCalories} onChange={(e) => setDailyCalories(Number(e.target.value))} />
        </Field>
        <Field label="Weight goal">
          <Input type="number" min={0} step="any" value={weightGoal} onChange={(e) => setWeightGoal(e.target.value)} />
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="grid gap-4 py-4 sm:grid-cols-3">
        <Field label="Protein (g)">
          <Input type="number" min={0} value={dailyProtein} onChange={(e) => setDailyProtein(e.target.value)} />
        </Field>
        <Field label="Carbs (g)">
          <Input type="number" min={0} value={dailyCarbs} onChange={(e) => setDailyCarbs(e.target.value)} />
        </Field>
        <Field label="Fat (g)">
          <Input type="number" min={0} value={dailyFat} onChange={(e) => setDailyFat(e.target.value)} />
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="pt-4">
        <Button
          type="button"
          disabled={busy}
          onClick={() => {
            if (!dailyCalories || dailyCalories < 1) {
              setError("Enter daily calories.");
              return;
            }
            setError(undefined);
            void onSubmit({
              dailyCalories,
              dailyProtein: opt(dailyProtein),
              dailyCarbs: opt(dailyCarbs),
              dailyFat: opt(dailyFat),
              weightGoal: opt(weightGoal),
            });
          }}
        >
          Save goal
        </Button>
      </div>
    </div>
  );
}
