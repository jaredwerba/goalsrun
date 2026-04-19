"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BLUR_MASK =
  "linear-gradient(to bottom, black 0%, black 35%, transparent 80%)";

export function HeroBackdrop() {
  const [scrollY, setScrollY] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current !== null) return;
      raf.current = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf.current = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const blur = Math.min(20, scrollY / 28);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/hero.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 will-change-[backdrop-filter]"
        style={{
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: BLUR_MASK,
          WebkitMaskImage: BLUR_MASK,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/80" />
    </div>
  );
}
