"use client";

import api, { apiErrorMessage } from "@/lib/api";
import type { ChatMessage, Paginated } from "@/lib/types";
import { Button } from "./ui/Button";
import { EmptyState, ErrorState, LoadingState } from "./ui/EmptyState";
import { Textarea } from "./ui/Input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export function ChatInterface() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | undefined>();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["chat"],
    queryFn: async () => {
      const { data } = await api.get<Paginated<ChatMessage>>("/api/chat/history", { params: { page: 1, limit: 100 } });
      return data;
    },
  });

  const send = useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post<{ reply: string }>("/api/chat/message", { message: text });
      return data;
    },
    onSuccess: () => {
      setMessage("");
      void qc.invalidateQueries({ queryKey: ["chat"] });
      void qc.invalidateQueries({ queryKey: ["meals"] });
      void qc.invalidateQueries({ queryKey: ["goals"] });
      void qc.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const clear = useMutation({
    mutationFn: async () => api.delete("/api/chat/history"),
    onSuccess: () => {
      toast.success("Chat cleared");
      void qc.invalidateQueries({ queryKey: ["chat"] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const items = [...(history.data?.data ?? [])].reverse();

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    const pin = () => {
      if (el) el.scrollTop = el.scrollHeight;
      bottomRef.current?.scrollIntoView({ block: "end" });
    };
    pin();
    const frame = requestAnimationFrame(pin);
    const t = window.setTimeout(pin, 50);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
    };
  }, [items, send.isPending, history.status, history.dataUpdatedAt]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" variant="ghost" disabled={clear.isPending} onClick={() => clear.mutate()}>
          Clear chat
        </Button>
      </div>
      {history.isLoading ? <LoadingState variant="list" /> : null}
      {history.isError ? <ErrorState message={apiErrorMessage(history.error)} /> : null}
      {history.data && items.length === 0 ? (
        <EmptyState title="No messages yet" hint="Ask to log a meal, set a goal, or summarize your week." />
      ) : null}
      {items.length > 0 ? (
        <div
          ref={scrollerRef}
          className="h-[min(70vh,36rem)] min-h-[16rem] overflow-y-auto overflow-x-hidden rounded-[8px] border border-line bg-inset p-4"
        >
          <div className="flex min-h-full flex-col justify-end gap-2">
            {items.map((m) => (
              <div
                key={m.id}
                className={`max-w-2xl rounded-[8px] px-3 py-2 text-[14px] [overflow-anchor:none] ${
                  m.role === "user" ? "ml-auto bg-emerald text-white" : "border border-line bg-surface text-ink"
                }`}
              >
                <p className="mb-1 text-[12px] text-current/70">{m.role === "user" ? "You" : "Plate"}</p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
            {send.isPending ? (
              <div className="max-w-2xl rounded-[8px] border border-line bg-surface px-3 py-2 text-[14px] text-muted">Plate is typing…</div>
            ) : null}
            <div ref={bottomRef} className="h-px w-full shrink-0" />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. Log a banana snack, 105 calories"
        />
        {error ? <p className="text-[12px] text-protein">{error}</p> : null}
        <Button
          type="button"
          disabled={send.isPending}
          onClick={() => {
            if (!message.trim()) {
              setError("Enter a message.");
              return;
            }
            setError(undefined);
            send.mutate(message.trim());
          }}
        >
          {send.isPending ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
