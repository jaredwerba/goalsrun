import { RACES } from "@/lib/content";

export function Results() {
  return (
    <section id="results" className="mx-auto max-w-5xl px-6 py-16 border-t">
      <h2 className="text-3xl font-semibold tracking-tight mb-8">
        Recent results
      </h2>
      <ul className="divide-y divide-border">
        {RACES.map((r) => (
          <li
            key={r.name + r.date}
            className="py-4 flex flex-wrap items-baseline justify-between gap-2"
          >
            <div>
              <p className="font-medium text-lg">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.date}</p>
            </div>
            <p className="font-mono text-lg tabular-nums">{r.result}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
