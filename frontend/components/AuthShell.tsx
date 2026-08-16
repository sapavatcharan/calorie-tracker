import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { BrandLockup } from "@/components/BrandLockup";
import type { ReactNode } from "react";

const bullets = ["Log meals and macros", "See progress vs your goal", "Ask chat to log for you"];

function MiniLabel() {
  return (
    <div className="mt-8 max-w-[200px] border border-ink bg-surface p-4 text-ink">
      <p className="font-display text-[16px] leading-none tracking-[-0.03em]">{APP_NAME}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-muted">Per serving</p>
      <div className="mt-2 h-[4px] bg-ink" />
      <div className="flex items-end justify-between pt-2">
        <span className="text-[12px] text-muted">Calories</span>
        <span className="font-mono text-[20px] leading-[1] tabular-nums">2,000</span>
      </div>
      <div className="mt-2 h-px bg-ink" />
      <p className="mt-2 font-mono text-[11px] tabular-nums text-muted">P 150 · C 250 · F 65</p>
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell relative min-h-screen md:grid md:grid-cols-2">
      <div className="border-b border-line px-6 py-8 md:flex md:flex-col md:justify-center md:border-b-0 md:border-r md:px-12">
        <BrandLockup />
        <p className="mt-3 max-w-sm text-[14px] text-muted">{APP_TAGLINE}</p>
        <ul className="mt-6 space-y-2 text-[13px] text-ink">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted" />
              {b}
            </li>
          ))}
        </ul>
        <div className="hidden md:block">
          <MiniLabel />
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10 md:px-8">{children}</div>
    </div>
  );
}
