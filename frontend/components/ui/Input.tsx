import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[12px] text-protein">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full h-9 min-h-9 rounded-[8px] border border-line bg-surface px-3 text-[14px] text-ink outline-none transition-colors focus:border-emerald focus:ring-1 focus:ring-emerald/20 focus:outline-none";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const numeric = props.type === "number";
  const file = props.type === "file";
  return (
    <input
      {...props}
      className={`${file ? inputClass.replace("h-9 min-h-9", "h-9 min-h-9 py-1") : inputClass} ${numeric ? "tabular font-mono [appearance:textfield]" : ""} ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} h-auto min-h-16 py-2 ${props.className ?? ""}`} />;
}
