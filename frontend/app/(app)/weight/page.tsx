"use client";

import { WeightTrendChart } from "@/components/charts/WeightTrendChart";
import { PaginationControls } from "@/components/PaginationControls";
import { WeightForm } from "@/components/WeightForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import api, { apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import type { Paginated, WeightEntry } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Scale } from "lucide-react";
import toast from "react-hot-toast";

export default function WeightPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const list = useQuery({
    queryKey: ["weight", page],
    queryFn: async () => {
      const { data } = await api.get<Paginated<WeightEntry>>("/api/weight", { params: { page, limit: 10 } });
      return data;
    },
  });

  const chart = useQuery({
    queryKey: ["weight", "chart"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<WeightEntry>>("/api/weight", { params: { page: 1, limit: 100 } });
      return data.data;
    },
  });

  const create = useMutation({
    mutationFn: async (body: { weight: number; date?: string }) => api.post("/api/weight", body),
    onSuccess: () => {
      toast.success("Weight logged");
      void qc.invalidateQueries({ queryKey: ["weight"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/weight/${id}`),
    onSuccess: () => {
      toast.success("Weight deleted");
      void qc.invalidateQueries({ queryKey: ["weight"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  return (
    <div className="stagger">
      <PageTitle icon={Scale}>Weight</PageTitle>
      <Card>
        <SectionHeading eyebrow="Log" title="Add weigh-in" />
        <WeightForm busy={create.isPending} onSubmit={(body) => create.mutateAsync(body)} />
      </Card>
      <Card>
        <SectionHeading eyebrow="Chart" title="Trend" />
        {chart.isLoading ? <LoadingState variant="chart" /> : null}
        {chart.data && chart.data.length > 0 ? (
          <WeightTrendChart data={chart.data} />
        ) : (
          <EmptyState title="No weight entries yet" hint="Add a weigh-in to see the trend." />
        )}
      </Card>
      <Card>
        <SectionHeading eyebrow="Entries" title="History" />
        {list.isLoading ? <LoadingState variant="list" /> : null}
        {list.isError ? <ErrorState message={apiErrorMessage(list.error)} /> : null}
        {list.data?.data.length === 0 ? <EmptyState title="Nothing logged" hint="Add weight to start a history." /> : null}
        {list.data && list.data.data.length > 0 ? (
          <ul className="divide-y divide-line text-[14px]">
            {list.data.data.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2 hover:bg-inset">
                <span>
                  <span className="font-mono tabular-nums">{w.weight}</span>
                  <span className="text-[13px] text-muted"> · {formatDate(w.date)}</span>
                </span>
                <Button type="button" variant="ghost" className="text-protein" onClick={() => remove.mutate(w.id)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {list.data ? <PaginationControls pagination={list.data.pagination} onPageChange={setPage} /> : null}
      </Card>
    </div>
  );
}
