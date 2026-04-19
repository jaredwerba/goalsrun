import { MARATHONS, type Marathon } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { CountUpTime } from "./count-up";
import { RouteMap } from "./route-map";

function MarathonCard({ m }: { m: Marathon }) {
  const route = ROUTES[m.slug];
  return (
    <article className="group rounded-xl border border-white/10 overflow-hidden bg-neutral-950">
      <div className="relative aspect-[16/9] overflow-hidden">
        {route && <RouteMap route={route} slug={m.slug} />}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60">
          {m.subtitle ?? m.name}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
          {m.name}
        </h3>
        <p className="mt-3 font-mono text-5xl font-semibold tabular-nums leading-none text-white">
          <CountUpTime targetSeconds={m.totalSeconds} />
        </p>
      </div>
    </article>
  );
}

export function MarathonCards() {
  return (
    <section id="results" className="bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight mb-2">
          Personal bests
        </h2>
        <p className="text-white/60 mb-8">
          Chip times. Routes to scale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {MARATHONS.map((m) => (
            <MarathonCard key={m.slug} m={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
