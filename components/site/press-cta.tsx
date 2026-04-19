import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RUNNER_FIRST_NAME } from "@/lib/content";

export function PressCta() {
  return (
    <section id="press" className="mx-auto max-w-5xl px-6 py-16 border-t">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        For brands
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
        Partner with {RUNNER_FIRST_NAME}.
      </h2>
      <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
        Masters-elite audience, detailed gear reviews, race-day content, and
        coaching tie-ins. Pitch directly — {RUNNER_FIRST_NAME} responds
        personally.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/partners">See the media kit</Link>
      </Button>
    </section>
  );
}
