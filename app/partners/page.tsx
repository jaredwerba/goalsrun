import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Stack } from "@/components/site/stack";
import { PartnerContactForm } from "@/components/partners/contact-form";
import { BRAND_PITCHES } from "@/lib/brand-pitches";
import {
  AGE,
  AUDIENCE,
  DELIVERABLES,
  MARATHONS,
  PARTNERS_PITCH,
  PARTNERSHIPS_EMAIL,
  PARTNERSHIP_TYPES,
  PHYSIOLOGY,
  RUNNER_FIRST_NAME,
  RUNNER_NAME,
} from "@/lib/content";

export const metadata: Metadata = {
  title: `Partner with ${RUNNER_NAME}`,
  description: `Masters-elite marathoner, ${AGE}. VO2 max ${PHYSIOLOGY.vo2Max}, ${PHYSIOLOGY.marathonPR} PR. Media kit, audience, stack, and how to pitch.`,
};

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tabular-nums leading-none">
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </p>
    </div>
  );
}

function formatFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-20">
      <header className="space-y-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Media kit
        </p>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          Partner with {RUNNER_FIRST_NAME}.
        </h1>
        <p className="text-lg text-muted-foreground max-w-prose">
          {AGE}. {PHYSIOLOGY.marathonPR} marathoner. VO<sub>2</sub> max{" "}
          {PHYSIOLOGY.vo2Max}. Castle Island, Boston.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
          <a href="#pitch" className="hover:underline underline-offset-4">
            The pitch
          </a>
          <a href="#numbers" className="hover:underline underline-offset-4">
            Numbers
          </a>
          <a href="#audience" className="hover:underline underline-offset-4">
            Audience
          </a>
          <a href="#oncourse" className="hover:underline underline-offset-4">
            On course
          </a>
          <a href="#stack" className="hover:underline underline-offset-4">
            Stack
          </a>
          <a href="#brands" className="hover:underline underline-offset-4">
            By brand
          </a>
          <a href="#deliver" className="hover:underline underline-offset-4">
            What I deliver
          </a>
          <a href="#work" className="hover:underline underline-offset-4">
            Work together
          </a>
        </nav>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 -mt-8">
        {[
          {
            src: "/images/IMG_6906.jpeg",
            alt: `${RUNNER_NAME} racing the Berlin Marathon`,
          },
          {
            src: "/images/IMG_2590.JPG",
            alt: `${RUNNER_NAME} crossing the Boston Marathon finish line`,
          },
          {
            src: "/images/IMG_2054.JPG",
            alt: `${RUNNER_NAME} mid-stride on a training run`,
          },
        ].map((p) => (
          <div
            key={p.src}
            className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 33vw, 240px"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <section id="pitch" className="space-y-5">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          The pitch
        </h2>
        <p className="text-xl leading-relaxed max-w-prose">
          {PARTNERS_PITCH}
        </p>
      </section>

      <section id="numbers" className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Numbers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
          <Stat label="Age" value={String(AGE)} />
          <Stat
            label="VO\u2082 max"
            value={String(PHYSIOLOGY.vo2Max)}
            suffix="mL/kg·min"
          />
          <Stat
            label="Resting HR"
            value={String(PHYSIOLOGY.restingHR)}
            suffix="bpm"
          />
          <Stat
            label="Weekly mileage"
            value={String(PHYSIOLOGY.weeklyMileage)}
            suffix="mi"
          />
          <Stat
            label="Years running"
            value={String(PHYSIOLOGY.yearsRunning)}
          />
          <Stat
            label="Body fat"
            value={String(PHYSIOLOGY.bodyFatPct)}
            suffix="%"
          />
          <Stat label="Marathon PR" value={PHYSIOLOGY.marathonPR} />
          <Stat label="Masters PR" value={PHYSIOLOGY.mastersPR} />
        </div>

        <div className="pt-6">
          <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Race record
          </h3>
          <ul className="mt-4 divide-y border-y">
            {MARATHONS.map((m) => (
              <li
                key={m.slug}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  {m.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {m.subtitle}
                    </p>
                  )}
                </div>
                <p className="font-mono tabular-nums text-lg">{m.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="audience" className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Audience</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <a
            href={AUDIENCE.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Instagram
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {formatFollowers(AUDIENCE.instagram.followers)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {AUDIENCE.instagram.handle}
            </p>
          </a>
          <a
            href={AUDIENCE.strava.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border bg-card p-6 hover:bg-muted/50 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Strava
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {formatFollowers(AUDIENCE.strava.followers)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {AUDIENCE.strava.handle}
            </p>
          </a>
          <div className="rounded-xl border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Local scene
            </p>
            <p className="mt-2 text-3xl font-semibold">Boston</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Castle Island regular. B.A.A. network.
            </p>
          </div>
        </div>
      </section>

      <section id="oncourse" className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            On course
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Race-ready, every weekend.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Training and racing footage from the last 18 months — Boston,
            Berlin, Chicago, the locals.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            {
              src: "/images/IMG_2049.JPG",
              alt: `${RUNNER_NAME} training in winter kit`,
            },
            {
              src: "/images/IMG_2076.JPG",
              alt: `${RUNNER_NAME} in profile mid-stride`,
            },
            {
              src: "/images/IMG_2495.jpeg",
              alt: `${RUNNER_NAME} pre-race at the Boston Marathon`,
            },
            {
              src: "/images/IMG_4430.jpeg",
              alt: `${RUNNER_NAME} with an age-group award`,
            },
            {
              src: "/images/IMG_6897.JPG",
              alt: `${RUNNER_NAME} approaching the Victory Column in Berlin`,
            },
            {
              src: "/images/IMG_7211.jpeg",
              alt: `${RUNNER_NAME} at the Newport Marathon`,
            },
          ].map((p) => (
            <div
              key={p.src}
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <div id="stack">
        <Stack />
      </div>

      <section id="brands" className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            By brand
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            A specific pitch, written for you.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Ten brands I'd work with tomorrow. Each page is a written pitch —
            why the brand, why me, why now, and why this should be the first
            partnership for both of us.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRAND_PITCHES.map((p) => (
            <Link
              key={p.slug}
              href={`/partners/${p.slug}`}
              className="group relative overflow-hidden rounded-xl border bg-card hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-stretch">
                <div className="relative w-28 shrink-0 bg-muted">
                  <Image
                    src={p.heroImage.src}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4 space-y-2">
                  <p className="text-lg font-semibold tracking-tight">
                    {p.brand}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.tagline}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground/80 group-hover:text-foreground transition-colors">
                    Read the pitch →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="deliver" className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          What I can deliver
        </h2>
        <ul className="space-y-3 text-lg max-w-prose">
          {DELIVERABLES.map((d) => (
            <li key={d} className="flex gap-3">
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <div className="pt-4">
          <h3 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Partnership types I'm open to
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {PARTNERSHIP_TYPES.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border px-3 py-1 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Pitch
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Work together.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Send a short note. {RUNNER_FIRST_NAME} reads and replies
            personally — usually within the week.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 sm:p-8">
          <PartnerContactForm />
        </div>
        <p className="text-sm text-muted-foreground">
          Prefer email?{" "}
          <Link
            href={`mailto:${PARTNERSHIPS_EMAIL}`}
            className="underline underline-offset-4"
          >
            {PARTNERSHIPS_EMAIL}
          </Link>
        </p>
      </section>
    </div>
  );
}
