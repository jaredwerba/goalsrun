import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RUNNER_NAME, TAGLINE } from "@/lib/content";
import { HeroBackdrop } from "./hero-backdrop";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden -mt-[65px]">
      <HeroBackdrop />

      <div className="mx-auto max-w-5xl px-6 min-h-dvh flex flex-col justify-end pt-32 pb-20 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-white/80 mb-5">
          Boston, MA
        </p>
        <h1 className="text-6xl sm:text-8xl leading-[0.95]">
          {RUNNER_NAME}
        </h1>
        <p className="mt-6 text-xl sm:text-2xl text-white/85 max-w-2xl leading-snug">
          {TAGLINE}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-white/90"
          >
            <Link href="/book">Book a Castle Island run</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/partners">Partner with Goals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
