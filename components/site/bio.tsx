import Image from "next/image";
import { BIO, RUNNER_FIRST_NAME, RUNNER_NAME } from "@/lib/content";

export function Bio() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-16 border-t">
      <h2 className="text-3xl font-semibold tracking-tight mb-8">
        About {RUNNER_FIRST_NAME}
      </h2>
      <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-start">
        <div className="relative aspect-[3/4] w-full max-w-[320px] md:max-w-none overflow-hidden rounded-xl bg-muted">
          <Image
            src="/images/IMG_2049.JPG"
            alt={`${RUNNER_NAME} mid-run, smiling`}
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-cover"
          />
        </div>
        <div className="prose prose-neutral dark:prose-invert max-w-prose text-lg leading-relaxed whitespace-pre-line text-foreground/90">
          {BIO}
        </div>
      </div>
    </section>
  );
}
