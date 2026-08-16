"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const styles: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-emerald text-white hover:bg-emerald-ink disabled:opacity-50",
  secondary: "bg-transparent text-ink border border-line hover:bg-inset",
  danger: "bg-transparent text-protein border border-line hover:bg-inset",
  ghost: "bg-transparent text-ink border border-line hover:bg-inset",
};

export function Button({ variant = "primary", className = "", disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex h-9 min-h-9 items-center justify-center rounded-[8px] px-3 text-[13px] font-medium transition-colors ${styles[variant]} ${className}`}
    />
  );
}
