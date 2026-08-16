"use client";

import api, { apiErrorMessage } from "@/lib/api";
import { MEAL_TYPE_LABEL, type MealInput } from "@/lib/types";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { Field, Input } from "./ui/Input";
import { useState } from "react";
import toast from "react-hot-toast";

export function PDFImport({ onImported }: { onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MealInput[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function runPreview() {
    if (!file) {
      toast.error("Choose a PDF first");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const { data } = await api.post<{ preview: MealInput[] }>("/api/import/pdf", fd);
      setPreview(data.preview);
      toast.success(`Preview ready (${data.preview.length} meals)`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!preview?.length) return;
    setBusy(true);
    try {
      const { data } = await api.post<{ imported: number }>("/api/import/pdf/confirm", { meals: preview });
      toast.success(`Imported ${data.imported} meals`);
      setPreview(null);
      onImported();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="PDF file">
          <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Field>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void runPreview()}>
          {busy ? "Working…" : "Preview"}
        </Button>
      </div>
      {preview ? (
        preview.length === 0 ? (
          <EmptyState title="No meals found in this PDF" />
        ) : (
          <div>
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 text-left text-[12px] font-medium">Food</th>
                  <th className="py-2 text-left text-[12px] font-medium">Type</th>
                  <th className="py-2 text-right text-[12px] font-medium">Cal</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((m, i) => (
                  <tr key={`${m.foodName}-${i}`} className="border-b border-line last:border-0 hover:bg-inset">
                    <td className="py-2">{m.foodName}</td>
                    <td className="py-2 text-muted">{MEAL_TYPE_LABEL[m.mealType]}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{m.calories}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="button" className="mt-3" disabled={busy} onClick={() => void confirm()}>
              Confirm import
            </Button>
          </div>
        )
      ) : null}
    </div>
  );
}
