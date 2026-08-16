"use client";

import type { Pagination } from "@/lib/types";
import { Button } from "./ui/Button";

export function PaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1 && pagination.total === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
      <p className="font-mono tabular-nums">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={!pagination.hasPrev}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={!pagination.hasNext}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
