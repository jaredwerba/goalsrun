import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

function listImages(): string[] {
  const dir = path.join(process.cwd(), "public", "images");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .filter((f) => f !== "hero.jpeg")
      .sort()
      .map((f) => `/images/${f}`);
  } catch {
    return [];
  }
}

export function Gallery() {
  const images = listImages();
  if (images.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t">
      <h2 className="text-3xl font-semibold tracking-tight mb-8">Photos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
