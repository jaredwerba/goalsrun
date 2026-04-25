import { AGE, PHYSIOLOGY } from "@/lib/content";

type Stat = { label: string; value: string; suffix?: string };

const STATS: Stat[] = [
  { label: "Age", value: String(AGE) },
  { label: "VO\u2082 max", value: String(PHYSIOLOGY.vo2Max), suffix: "mL/kg·min" },
  { label: "Resting HR", value: String(PHYSIOLOGY.restingHR), suffix: "bpm" },
  { label: "Weekly mileage", value: String(PHYSIOLOGY.weeklyMileage), suffix: "mi" },
  { label: "Years running", value: String(PHYSIOLOGY.yearsRunning) },
  { label: "Body fat", value: String(PHYSIOLOGY.bodyFatPct), suffix: "%" },
  { label: "Marathon PR", value: PHYSIOLOGY.marathonPR },
  { label: "Masters PR", value: PHYSIOLOGY.mastersPR },
];

export function PerformancePanel() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Physiology
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            The numbers at 43.
          </h2>
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {s.label}
            </dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              <span className="text-5xl sm:text-6xl font-semibold tabular-nums leading-none">
                {s.value}
              </span>
              {s.suffix && (
                <span className="text-xs text-muted-foreground">{s.suffix}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-muted-foreground max-w-2xl">
        VO<sub>2</sub> max measured under a treadmill protocol. Weekly volume
        during marathon build. Masters division: 40+.
      </p>
    </section>
  );
}
