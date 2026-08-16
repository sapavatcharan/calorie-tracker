"use client";

import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Input";
import { useState } from "react";

export function WeightForm({
  onSubmit,
  busy,
}: {
  onSubmit: (data: { weight: number; date?: string }) => Promise<unknown> | void;
  busy?: boolean;
}) {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Weight" error={error}>
        <Input type="number" min={0.1} step="any" value={weight} onChange={(e) => setWeight(e.target.value)} />
      </Field>
      <Field label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Button
        type="button"
        disabled={busy}
        onClick={() => {
          if (!weight || Number(weight) <= 0) {
            setError("Enter a weight.");
            return;
          }
          setError(undefined);
          void onSubmit({
            weight: Number(weight),
            date: date ? new Date(`${date}T12:00:00`).toISOString() : undefined,
          });
        }}
      >
        Add weight
      </Button>
    </div>
  );
}
