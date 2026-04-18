import { PRESS_EMAIL, RUNNER_FIRST_NAME } from "@/lib/content";

export function PressCta() {
  return (
    <section id="press" className="mx-auto max-w-5xl px-6 py-16 border-t">
      <h2 className="text-3xl font-semibold tracking-tight mb-4">
        Brand partnerships & press
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        For sponsorships, interviews, appearances, or collaborations —{" "}
        {RUNNER_FIRST_NAME} responds personally.
      </p>
      <a
        href={`mailto:${PRESS_EMAIL}`}
        className="mt-6 inline-block font-mono text-lg underline underline-offset-4 hover:opacity-80"
      >
        {PRESS_EMAIL}
      </a>
    </section>
  );
}
