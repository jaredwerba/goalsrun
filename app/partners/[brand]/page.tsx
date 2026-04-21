import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BRAND_PITCHES, findBrandPitch } from "@/lib/brand-pitches";
import {
  AGE,
  PHYSIOLOGY,
  RUNNER_FIRST_NAME,
  RUNNER_NAME,
} from "@/lib/content";

type RouteParams = { brand: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return BRAND_PITCHES.map((p) => ({ brand: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { brand } = await params;
  const pitch = findBrandPitch(brand);
  if (!pitch) return { title: "Not found" };
  return {
    title: `${pitch.brand} × ${RUNNER_NAME}`,
    description: pitch.tagline,
    openGraph: {
      title: `${pitch.brand} × ${RUNNER_NAME}`,
      description: pitch.tagline,
      type: "article",
      images: [{ url: pitch.heroImage.src, alt: pitch.heroImage.alt }],
    },
  };
}

function WhyBlock({
  label,
  heading,
  body,
}: {
  label: string;
  heading: string;
  body: string;
}) {
  return (
    <section className="space-y-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight">{heading}</h2>
      <p className="text-lg leading-relaxed text-foreground/90 max-w-prose">
        {body}
      </p>
    </section>
  );
}

export default async function BrandPitchPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { brand } = await params;
  const pitch = findBrandPitch(brand);
  if (!pitch) notFound();

  const mailtoSubject = encodeURIComponent(
    `${pitch.brand} × ${RUNNER_NAME} — first partnership`,
  );
  const formHref = `/partners?brand=${encodeURIComponent(pitch.brand)}#work`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 space-y-20">
      <header className="space-y-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <Link
            href="/partners"
            className="hover:text-foreground transition-colors"
          >
            Partners
          </Link>
          <span aria-hidden>·</span>
          <span>{pitch.brand}</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          {pitch.brand} × {RUNNER_FIRST_NAME}.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-prose">
          {pitch.tagline}
        </p>
      </header>

      <div className="relative aspect-[4/5] sm:aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={pitch.heroImage.src}
          alt={pitch.heroImage.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Age
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{AGE}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Marathon PR
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {PHYSIOLOGY.marathonPR}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            VO₂ max
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {PHYSIOLOGY.vo2Max}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Weekly
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {PHYSIOLOGY.weeklyMileage}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              mi
            </span>
          </p>
        </div>
      </div>

      <WhyBlock
        label={`Why ${pitch.brand}`}
        heading={`Why ${pitch.brand}.`}
        body={pitch.whyBrand}
      />

      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
        <Image
          src={pitch.supportImages[0].src}
          alt={pitch.supportImages[0].alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <WhyBlock
        label={`Why ${RUNNER_FIRST_NAME}`}
        heading={`Why ${RUNNER_FIRST_NAME}.`}
        body={pitch.whyGoals}
      />

      <WhyBlock label="Why now" heading="Why now." body={pitch.whyNow} />

      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
        <Image
          src={pitch.supportImages[1].src}
          alt={pitch.supportImages[1].alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <WhyBlock
        label="Why first partnership"
        heading="Why this should be the first."
        body={pitch.whyFirst}
      />

      <section className="space-y-6 rounded-2xl border bg-card p-8 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Make it official
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            First partnership, starting here.
          </h2>
          <p className="text-muted-foreground max-w-prose">
            {RUNNER_FIRST_NAME} reads and replies personally — usually within
            the week. Small deal, product trial, one-off campaign — pick your
            starting point.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={formHref}>Send {pitch.brand} pitch</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href={`mailto:gersonlopes7@gmail.com?subject=${mailtoSubject}`}
            >
              Email {RUNNER_FIRST_NAME} directly
            </a>
          </Button>
        </div>
      </section>

      <nav className="border-t pt-10 space-y-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Other brands
        </p>
        <div className="flex flex-wrap gap-2">
          {BRAND_PITCHES.filter((p) => p.slug !== pitch.slug).map((p) => (
            <Link
              key={p.slug}
              href={`/partners/${p.slug}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-sm hover:bg-muted transition-colors"
            >
              {p.brand}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
