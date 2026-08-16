import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-line bg-inset px-4 py-8 text-center">
      <Inbox className="mx-auto mb-2 h-4 w-4 text-muted" strokeWidth={1.75} />
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {hint ? <p className="mt-1 text-[13px] text-muted">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label: _label = "Loading…",
  variant = "panel",
}: {
  label?: string;
  variant?: "page" | "panel" | "chart" | "list";
}) {
  if (variant === "chart") {
    return <div className="skeleton h-56 w-full rounded-[8px]" />;
  }
  if (variant === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-[8px]" />
        ))}
      </div>
    );
  }
  if (variant === "page") {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-40 rounded-[8px]" />
        <div className="skeleton h-48 w-full rounded-[8px]" />
        <div className="skeleton h-32 w-full rounded-[8px]" />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="skeleton h-4 w-1/3 rounded-[8px]" />
      <div className="skeleton h-20 w-full rounded-[8px]" />
      <div className="skeleton h-4 w-2/3 rounded-[8px]" />
    </div>
  );
}

export function ErrorState({ message: _message }: { message: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line bg-surface px-4 py-3 text-[14px] text-ink">
      <p className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-protein" strokeWidth={1.75} />
        Couldn&apos;t reach the server. Retry.
      </p>
      <button
        type="button"
        className="h-9 rounded-[8px] border border-line bg-surface px-3 text-[13px] font-medium"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}
