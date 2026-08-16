import { BrandLockup } from "@/components/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { APP_TAGLINE } from "@/lib/brand";
import { Camera, MessageCircle, Target, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Log meals fast",
    copy: "Add breakfast through snacks in a few taps, with calories and macros in one place.",
    icon: UtensilsCrossed,
  },
  {
    title: "See progress vs your goal",
    copy: "Daily totals sit next to your targets so you know what’s left — not just what you ate.",
    icon: Target,
  },
  {
    title: "AI photo extraction",
    copy: "Snap a plate or a label and let Plate pull food names and nutrition for you to confirm.",
    icon: Camera,
  },
  {
    title: "Chat assistant",
    copy: "Ask to log a meal, check remaining calories, or review the week without leaving chat.",
    icon: MessageCircle,
  },
];

const week = [62, 78, 54, 88, 71, 93, 80];

function ExamplePreview() {
  return (
    <div className="relative">
      <p className="mb-2 text-right text-[11px] uppercase tracking-[0.08em] text-muted">Example</p>
      <Card className="space-y-4 shadow-[0_12px_40px_-24px_rgba(36,27,20,0.35)]">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">Today’s summary</p>
          <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">Wednesday</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[12px] border border-line bg-paper px-3 py-3">
            <p className="text-[12px] text-muted">Calories</p>
            <p className="mt-1 font-mono text-[22px] leading-none tabular-nums text-ink">
              1,640
              <span className="ml-1 text-[12px] text-muted">/ 2,000</span>
            </p>
            <div className="mt-2 h-1.5 w-full rounded-[4px] bg-line">
              <div className="h-full w-[82%] rounded-[4px] bg-emerald" />
            </div>
          </div>
          <div className="rounded-[12px] border border-line bg-paper px-3 py-3">
            <p className="text-[12px] text-muted">Protein</p>
            <p className="mt-1 font-mono text-[22px] leading-none tabular-nums text-ink">
              118
              <span className="ml-1 text-[12px] text-muted">g</span>
            </p>
            <div className="mt-2 h-1.5 w-full rounded-[4px] bg-line">
              <div className="h-full w-[79%] rounded-[4px] bg-protein" />
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[12px] text-muted">Weekly trend</p>
          <div className="flex h-16 items-end gap-1.5">
            {week.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-[4px] bg-emerald"
                style={{ height: `${h}%`, opacity: 0.45 + h / 180 }}
                aria-hidden
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-[0.06em] text-muted">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function Landing() {
  return (
    <div className="landing-page min-h-screen text-ink">
      <header className="border-b border-line bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex min-h-14 w-full max-w-[1120px] items-center justify-between gap-2 px-4 py-2 md:px-6">
          <span className="md:hidden">
            <BrandLockup href="/" size="sm" />
          </span>
          <span className="hidden md:inline-flex">
            <BrandLockup href="/" />
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Link href="/login">
              <Button type="button" variant="ghost" className="h-8 min-h-8 px-2 text-[12px] md:h-9 md:min-h-9 md:px-3 md:text-[13px]">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button type="button" className="h-8 min-h-8 px-2 text-[12px] md:h-9 md:min-h-9 md:px-3 md:text-[13px]">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="landing-hero" aria-label="Hero">
        <div className="landing-hero-inner mx-auto w-full max-w-[1120px] px-4 pt-10 md:px-6 md:pt-16">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <h1 className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[40px]">
                {APP_TAGLINE}
              </h1>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                Log meals in seconds, set daily goals, and see your progress — with AI photo logging and a chat
                assistant.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/register">
                  <Button type="button" className="min-w-[8.5rem]">
                    Get started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button type="button" variant="secondary" className="min-w-[8.5rem]">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
            <ExamplePreview />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1120px] px-4 pb-16 md:px-6">
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-emerald-soft text-emerald">
                <f.icon size={16} strokeWidth={1.75} />
              </span>
              <h2 className="mt-3 font-display text-[16px] font-semibold tracking-[-0.02em]">{f.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.copy}</p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-4 py-6 text-[12px] text-muted md:px-6">
          <span>Plate</span>
          <span>Track what’s on your plate.</span>
        </div>
      </footer>
    </div>
  );
}
