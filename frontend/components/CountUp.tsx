"use client";

import { useEffect, useState } from "react";

export function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(value);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(value);
      return;
    }
    const from = n;
    const start = performance.now();
    const duration = 500;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(from + (value - from) * p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last displayed value
  }, [value]);

  return <span className="tabular font-mono">{Math.round(n)}</span>;
}
