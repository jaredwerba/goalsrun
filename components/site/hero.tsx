import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RUNNER_NAME, TAGLINE } from "@/lib/content";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 sm:pt-24">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Boston, MA
      </p>
      <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
        {RUNNER_NAME}
      </h1>
      <p className="mt-6 text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-snug">
        {TAGLINE}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/book">Book a Castle Island run</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#press">Brand & press</Link>
        </Button>
      </div>
    </section>
  );
}
