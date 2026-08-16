"use client";

import api, { apiErrorMessage } from "@/lib/api";
import type { NutritionExtract } from "@/lib/types";
import { Button } from "./ui/Button";
import { Field, Input } from "./ui/Input";
import { useState } from "react";
import toast from "react-hot-toast";

export function AIExtractionForm({ onExtracted }: { onExtracted: (data: NutritionExtract) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | undefined>();

  async function extractFromUrl(url: string) {
    const { data } = await api.post<NutritionExtract>("/api/ai/extract-nutrition", { imageUrl: url });
    onExtracted(data);
    toast.success("Nutrition extracted — review and save");
  }

  async function runUpload() {
    if (!file) {
      setFileError("Choose an image first.");
      return;
    }
    setFileError(undefined);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post<NutritionExtract>("/api/upload/image", fd);
      onExtracted(data);
      toast.success("Nutrition extracted — review and save");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function runUrl() {
    if (!imageUrl) {
      toast.error("Paste an image URL");
      return;
    }
    setBusy(true);
    try {
      await extractFromUrl(imageUrl);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Upload a photo" error={fileError}>
        <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Field>
      <div className="flex items-end">
        <Button type="button" disabled={busy} onClick={() => void runUpload()}>
          {busy ? "Extracting…" : "Upload & extract"}
        </Button>
      </div>
      <Field label="Or image URL">
        <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        <p className="mt-1 text-[12px] text-muted">If the URL is blocked, or upload a file.</p>
      </Field>
      <div className="flex items-end">
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void runUrl()}>
          Extract from URL
        </Button>
      </div>
    </div>
  );
}
