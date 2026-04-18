import { VO2_MAX } from "@/lib/content";
import { CountUpNumber } from "./count-up";

export function VO2Max() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Physiology
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            VO<sub className="text-xl">2</sub> Max
          </h2>
        </div>
        <p className="font-mono text-8xl sm:text-9xl font-semibold tabular-nums leading-none">
          <CountUpNumber target={VO2_MAX} />
        </p>
      </div>
      <p className="mt-6 text-muted-foreground max-w-lg">
        mL / kg / min. Measured by treadmill VO<sub>2</sub>‑max protocol — the
        ceiling for aerobic power.
      </p>
    </section>
  );
}
