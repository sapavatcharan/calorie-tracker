"use client";

import { AIExtractionForm } from "@/components/AIExtractionForm";
import { MealForm } from "@/components/MealForm";
import { MealList } from "@/components/MealList";
import { PaginationControls } from "@/components/PaginationControls";
import { PDFImport } from "@/components/PDFImport";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/Input";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { apiErrorMessage } from "@/lib/api";
import { fromDateInput } from "@/lib/dates";
import { MEAL_TYPE_LABEL, MEAL_TYPES, type Meal, type MealInput, type MealType, type NutritionExtract, type Paginated } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";

export default function MealsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mealType, setMealType] = useState<"" | MealType>("");
  const [editing, setEditing] = useState<Meal | null>(null);
  const [prefill, setPrefill] = useState<Partial<MealInput> | null>(null);

  const list = useQuery({
    queryKey: ["meals", page, startDate, endDate, mealType],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Meal>>("/api/meals", {
        params: {
          page,
          limit: 10,
          startDate: fromDateInput(startDate),
          endDate: fromDateInput(endDate, true),
          mealType: mealType || undefined,
        },
      });
      return data;
    },
  });

  function invalidate() {
    void qc.invalidateQueries({ queryKey: ["meals"] });
    void qc.invalidateQueries({ queryKey: ["reports"] });
    void qc.invalidateQueries({ queryKey: ["goals"] });
  }

  const create = useMutation({
    mutationFn: async (body: MealInput) => api.post("/api/meals", body),
    onSuccess: () => {
      toast.success("Meal logged");
      setPrefill(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: MealInput }) => api.patch(`/api/meals/${id}`, body),
    onSuccess: () => {
      toast.success("Meal updated");
      setEditing(null);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/meals/${id}`),
    onSuccess: () => {
      toast.success("Meal deleted");
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  function applyExtract(data: NutritionExtract) {
    setEditing(null);
    setPrefill({
      foodName: data.foodName,
      mealType: "SNACKS",
      quantity: data.quantity ?? 1,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      micronutrients: data.micronutrients,
    });
  }

  return (
    <div className="stagger">
      <PageTitle icon={UtensilsCrossed}>Meals</PageTitle>

      <Card className="space-y-3">
        <SectionHeading eyebrow="Manual" title={editing ? "Edit meal" : "Log meal"} />
        <MealForm
          key={editing?.id ?? JSON.stringify(prefill) ?? "new"}
          initial={editing ?? prefill}
          submitLabel={editing ? "Update meal" : "Log meal"}
          busy={create.isPending || update.isPending}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={(body) => (editing ? update.mutateAsync({ id: editing.id, body }) : create.mutateAsync(body))}
        />
      </Card>

      <Card className="space-y-3">
        <SectionHeading eyebrow="Photo" title="Extract from image" />
        <AIExtractionForm onExtracted={applyExtract} />
      </Card>

      <Card className="space-y-3">
        <SectionHeading eyebrow="File" title="Import PDF" />
        <PDFImport onImported={invalidate} />
      </Card>

      <Card>
        <SectionHeading eyebrow="History" title="Logged meals" />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Field label="From">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(1);
                setStartDate(e.target.value);
              }}
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(1);
                setEndDate(e.target.value);
              }}
            />
          </Field>
          <Field label="Meal type">
            <Select
              value={mealType}
              onChange={(e) => {
                setPage(1);
                setMealType(e.target.value as "" | MealType);
              }}
            >
              <option value="">All</option>
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEAL_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {list.isLoading ? <LoadingState variant="list" /> : null}
        {list.isError ? <ErrorState message={apiErrorMessage(list.error)} /> : null}
        {list.data ? (
          <>
            <MealList meals={list.data.data} onEdit={setEditing} onDelete={(m) => remove.mutate(m.id)} />
            <PaginationControls pagination={list.data.pagination} onPageChange={setPage} />
          </>
        ) : null}
      </Card>
    </div>
  );
}
