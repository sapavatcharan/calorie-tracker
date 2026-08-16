"use client";

import { GoalForm } from "@/components/GoalForm";
import { PaginationControls } from "@/components/PaginationControls";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import type { Goal, GoalInput, Paginated } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Target } from "lucide-react";
import toast from "react-hot-toast";

export default function GoalsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const current = useQuery({
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

  const history = useQuery({
    queryKey: ["goals", "list", page],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Goal>>("/api/goals", { params: { page, limit: 10 } });
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (body: GoalInput) => api.post("/api/goals", body),
    onSuccess: () => {
      toast.success("Goal saved");
      void qc.invalidateQueries({ queryKey: ["goals"] });
      void qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div className="stagger">
      <PageTitle icon={Target}>Goals</PageTitle>
      <Card className="space-y-3">
        <SectionHeading eyebrow="Target" title="Set a new goal" />
        <p className="text-[13px] text-muted">Saving a new goal deactivates the previous one.</p>
        {current.isLoading ? <LoadingState /> : null}
        {current.isError ? <ErrorState message={apiErrorMessage(current.error)} /> : null}
        <GoalForm initial={current.data} busy={save.isPending} onSubmit={(body) => save.mutateAsync(body)} />
      </Card>
      <Card>
        <SectionHeading eyebrow="Past" title="History" />
        {history.isError ? <ErrorState message={apiErrorMessage(history.error)} /> : null}
        {history.data?.data.length === 0 ? (
          <EmptyState title="No goals yet" hint="Save a daily calorie target to get started." />
        ) : null}
        {history.data && history.data.data.length > 0 ? (
          <ul className="divide-y divide-line text-[14px]">
            {history.data.data.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-2 hover:bg-inset">
                <span>
                  <span className="font-mono tabular-nums">{g.dailyCalories}</span>
                  <span className="text-muted"> kcal</span>
                  {g.isActive ? (
                    <span className="ml-2 text-[12px] font-medium text-muted">Active</span>
                  ) : null}
                </span>
                <span className="text-[12px] tabular-nums text-muted">{formatDate(g.createdAt)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {history.data ? <PaginationControls pagination={history.data.pagination} onPageChange={setPage} /> : null}
      </Card>
    </div>
  );
}
