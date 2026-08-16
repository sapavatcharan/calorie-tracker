"use client";

import { Button } from "./ui/Button";
import { Field, Input, Select } from "./ui/Input";
import { MEAL_TYPE_LABEL, MEAL_TYPES, type Meal, type MealInput, type MealType } from "@/lib/types";
import { toDateInput } from "@/lib/dates";
import { useEffect, useState } from "react";

const empty: MealInput = {
  foodName: "",
  mealType: "BREAKFAST",
  quantity: 1,
  calories: 0,
};

function formatMicros(m?: Record<string, number> | null) {
  if (!m || Object.keys(m).length === 0) return "";
  return Object.entries(m)
    .map(([k, v]) => `${k}:${v}`)
    .join(", ");
}

function parseMicros(s: string): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const part of s.split(/[,;\n]+/)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx < 1) continue;
    const k = trimmed.slice(0, idx).trim();
    const n = Number(trimmed.slice(idx + 1).trim());
    if (k && Number.isFinite(n)) out[k] = n;
  }
  return Object.keys(out).length ? out : undefined;
}

export function MealForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  busy,
}: {
  initial?: Partial<MealInput> | Meal | null;
  submitLabel: string;
  onSubmit: (data: MealInput) => Promise<unknown> | void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<MealInput>(empty);
  const [microsText, setMicrosText] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!initial) {
      setForm(empty);
      setMicrosText("");
      return;
    }
    setForm({
      foodName: initial.foodName ?? "",
      mealType: (initial.mealType as MealType) ?? "BREAKFAST",
      quantity: initial.quantity ?? 1,
      calories: initial.calories ?? 0,
      protein: initial.protein ?? undefined,
      carbs: initial.carbs ?? undefined,
      fat: initial.fat ?? undefined,
      micronutrients: initial.micronutrients ?? undefined,
      date: initial.date ? toDateInput(initial.date) : undefined,
    });
    setMicrosText(formatMicros(initial.micronutrients));
  }, [initial]);

  function num(v: string) {
    if (v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  return (
    <div className="space-y-0">
      <div className="grid gap-4 pb-4 sm:grid-cols-2">
        <Field label="Food name" error={error}>
          <Input value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} />
        </Field>
        <Field label="Meal type">
          <Select
            value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value as MealType })}
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {MEAL_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <Field label="Quantity">
          <Input
            type="number"
            min={0.01}
            step="any"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          />
        </Field>
        <Field label="Calories">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="grid gap-4 py-4 sm:grid-cols-3">
        <Field label="Protein (g)">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.protein ?? ""}
            onChange={(e) => setForm({ ...form, protein: num(e.target.value) })}
          />
        </Field>
        <Field label="Carbs (g)">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.carbs ?? ""}
            onChange={(e) => setForm({ ...form, carbs: num(e.target.value) })}
          />
        </Field>
        <Field label="Fat (g)">
          <Input
            type="number"
            min={0}
            step="any"
            value={form.fat ?? ""}
            onChange={(e) => setForm({ ...form, fat: num(e.target.value) })}
          />
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="py-4">
        <Field label="Micronutrients (optional)">
          <Input
            value={microsText}
            placeholder="iron:2, vitaminC:8"
            onChange={(e) => setMicrosText(e.target.value)}
          />
        </Field>
      </div>
      <div className="border-t border-line" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2">
        <Field label="Date">
          <Input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!form.foodName.trim()) {
                setError("Enter a food name.");
                return;
              }
              setError(undefined);
              const payload: MealInput = {
                ...form,
                micronutrients: parseMicros(microsText),
                date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : undefined,
              };
              void onSubmit(payload);
            }}
          >
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
