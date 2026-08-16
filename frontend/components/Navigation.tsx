"use client";

import { BrandLockup } from "@/components/BrandLockup";
import { useAuth } from "@/lib/auth";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Scale,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/weight", label: "Weight", icon: Scale },
  { href: "/reports", label: "Reports", icon: ChartNoAxesCombined },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-9 items-center gap-2 rounded-[8px] px-2 text-[13px] ${
        compact ? "h-12 flex-col justify-center gap-0.5 px-1 text-[10px] leading-tight" : ""
      } ${active ? "bg-inset font-medium text-ink" : "text-muted hover:bg-inset hover:text-ink"}`}
    >
      <Icon className="shrink-0 text-current" size={compact ? 16 : 16} strokeWidth={1.75} />
      <span className={compact ? "max-w-full text-center leading-tight" : ""}>{label}</span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <aside className="hidden w-52 shrink-0 border-r border-line bg-surface md:flex md:min-h-screen md:flex-col">
        <div className="border-b border-line px-4 py-4">
          <BrandLockup href="/dashboard" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
          {links.map((l) => (
            <NavLink key={l.href} {...l} active={pathname === l.href} />
          ))}
        </nav>
        <div className="border-t border-line px-3 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-inset text-[11px] font-medium text-ink">
              {(user?.name?.trim()?.[0] || user?.email?.[0] || "P").toUpperCase()}
            </span>
            <p className="truncate text-[12px] text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-2 inline-flex h-9 items-center gap-2 text-[13px] text-muted hover:text-ink"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2 md:hidden">
        <BrandLockup href="/dashboard" size="sm" />
        <button type="button" onClick={logout} className="h-9 text-[13px] text-muted" aria-label="Log out">
          <LogOut size={16} strokeWidth={1.75} />
        </button>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface md:hidden">
        <div className="grid grid-cols-6 gap-0 px-1 py-1">
          {links.map((l) => (
            <NavLink key={l.href} {...l} active={pathname === l.href} compact />
          ))}
        </div>
      </nav>
    </>
  );
}
