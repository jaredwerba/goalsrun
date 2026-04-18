"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookDialog } from "./book-dialog";
import { dayKey, formatDayHeader, formatSlotRange } from "@/lib/tz";
import type { Slot } from "@/lib/db/schema";

export function SlotGrid({ openSlots }: { openSlots: Slot[] }) {
  const [selected, setSelected] = useState<Slot | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of openSlots) {
      const k = dayKey(new Date(s.startsAt));
      const arr = map.get(k) ?? [];
      arr.push(s);
      map.set(k, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [openSlots]);

  if (openSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No open slots right now. Check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {groups.map(([k, daySlots]) => (
          <div key={k}>
            <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
              {formatDayHeader(new Date(daySlots[0].startsAt))}
            </h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {daySlots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {formatSlotRange(
                        new Date(s.startsAt),
                        new Date(s.endsAt),
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {s.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Open</Badge>
                    <Button size="sm" onClick={() => setSelected(s)}>
                      Book
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <BookDialog
        slot={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
