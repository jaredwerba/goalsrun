import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { MARATHONS, type Marathon } from "@/lib/content";
import { CountUpTime } from "./count-up";

function hasRouteImage(slug: string): string | null {
  const exts = ["jpg", "jpeg", "png", "webp", "avif"];
  for (const ext of exts) {
    const rel = `images/routes/${slug}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) {
      return `/${rel}`;
    }
  }
  return null;
}

function initials(m: Marathon): string {
  return m.name
    .replace(/marathon/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "GL";
}

function MarathonCard({ m }: { m: Marathon }) {
  const src = hasRouteImage(m.slug);
  return (
    <article className="group rounded-xl border overflow-hidden bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {src ? (
          <Image
            src={src}
            alt={`${m.name} route`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,theme(colors.neutral.300)_0%,theme(colors.neutral.100)_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,theme(colors.neutral.700)_0%,theme(colors.neutral.900)_60%)]">
            <span className="text-6xl font-semibold tracking-tight text-foreground/30 font-mono">
              {initials(m)}
            </span>
            <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              drop {m.slug}.jpg in /public/images/routes/
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {m.subtitle ?? m.name}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight">{m.name}</h3>
        <p className="mt-3 font-mono text-5xl font-semibold tabular-nums leading-none">
          <CountUpTime targetSeconds={m.totalSeconds} />
        </p>
      </div>
    </article>
  );
}

export function MarathonCards() {
  return (
    <section
      id="results"
      className="mx-auto max-w-5xl px-6 py-16 border-t"
    >
      <h2 className="text-3xl font-semibold tracking-tight mb-2">
        Personal bests
      </h2>
      <p className="text-muted-foreground mb-8">
        Chip times. Hover for the route.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {MARATHONS.map((m) => (
          <MarathonCard key={m.slug} m={m} />
        ))}
      </div>
    </section>
  );
}
