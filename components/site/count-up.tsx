"use client";

import { useEffect, useRef, useState } from "react";

function useInViewCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        if (reduced) {
          setValue(target);
          return;
        }

        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min((now - t0) / durationMs, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setValue(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
          else setValue(target);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs]);

  return { ref, value };
}

export function CountUpTime({
  targetSeconds,
  className,
}: {
  targetSeconds: number;
  className?: string;
}) {
  const { ref, value } = useInViewCountUp(targetSeconds);
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  return (
    <span ref={ref} className={className}>
      {h}:{m.toString().padStart(2, "0")}
    </span>
  );
}

export function CountUpNumber({
  target,
  className,
  durationMs,
}: {
  target: number;
  className?: string;
  durationMs?: number;
}) {
  const { ref, value } = useInViewCountUp(target, durationMs);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
