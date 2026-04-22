"use client";

import { useEffect, useRef, useState } from "react";

const BLUR_MASK =
  "linear-gradient(to bottom, black 0%, black 35%, transparent 80%)";

export function HeroBackdrop() {
  const [scrollY, setScrollY] = useState(0);
  const raf = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Respect `prefers-reduced-motion` — freeze on the poster frame
  // instead of autoplaying. Watches for the user changing the setting
  // mid-session too (rare but trivial to support).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const v = videoRef.current;
      if (!v) return;
      if (mq.matches) {
        v.pause();
      } else {
        // Mobile Safari / Chrome may still reject .play() if the user
        // hasn't interacted with the page yet; poster stays visible as
        // the fallback, so we just swallow the rejection.
        v.play().catch(() => {});
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const blur = Math.min(20, scrollY / 28);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        src="/images/video.mp4"
        poster="/images/video-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        // `metadata` — don't eat a ~636KB download on page load for
        // users who scroll away before the hero is even in view. The
        // poster stays visible until the first frame decodes.
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
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
