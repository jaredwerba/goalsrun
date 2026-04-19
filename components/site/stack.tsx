import { STACK } from "@/lib/content";

function Column({
  title,
  items,
}: {
  title: string;
  items: { brand: string; detail: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {items.map((it, i) => (
          <li key={`${it.brand}-${i}`} className="leading-tight">
            <span className="font-medium">{it.brand}</span>
            <span className="block text-sm text-muted-foreground">
              {it.detail}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Stack() {
  const shoes = STACK.shoes.map((s) => ({ brand: s.brand, detail: s.model }));
  const tech = [
    { brand: STACK.watch.brand, detail: STACK.watch.product },
    ...STACK.tech.map((t) => ({ brand: t.brand, detail: t.product })),
  ];
  const apparel = STACK.apparel.map((a) => ({
    brand: a.brand,
    detail: a.product,
  }));
  const fuel = [
    ...STACK.nutrition.map((n) => ({ brand: n.brand, detail: n.product })),
    ...STACK.recovery.map((r) => ({ brand: r.brand, detail: r.product })),
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Gear
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          The stack.
        </h2>
        <p className="mt-3 text-muted-foreground max-w-prose">
          What I train and race in.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <Column title="Shoes" items={shoes} />
        <Column title="Apparel" items={apparel} />
        <Column title="Tech" items={tech} />
        <Column title="Fuel & recovery" items={fuel} />
      </div>
    </section>
  );
}
