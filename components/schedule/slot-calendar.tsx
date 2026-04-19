"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookDialog } from "./book-dialog";
import { TZ, dayKey, formatDayHeader } from "@/lib/tz";
import type { Slot } from "@/lib/db/schema";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function keyFrom(year: number, month1: number, day: number): string {
  return `${year}-${pad(month1)}-${pad(day)}`;
}

type Cell = { key: string; day: number; inMonth: boolean };

function buildMonthCells(year: number, monthIdx: number): Cell[] {
  const firstDay = new Date(year, monthIdx, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: Cell[] = [];

  const prevMonthDays = new Date(year, monthIdx, 0).getDate();
  const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
  const prevYear = monthIdx === 0 ? year - 1 : year;
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({
      key: keyFrom(prevYear, prevMonthIdx + 1, d),
      day: d,
      inMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: keyFrom(year, monthIdx + 1, d), day: d, inMonth: true });
  }

  const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
  const nextYear = monthIdx === 11 ? year + 1 : year;
  let nd = 1;
  while (cells.length < 42) {
    cells.push({
      key: keyFrom(nextYear, nextMonthIdx + 1, nd),
      day: nd,
      inMonth: false,
    });
    nd++;
  }

  return cells;
}

function monthTitle(year: number, monthIdx: number): string {
  return new Date(year, monthIdx, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function SlotCalendar({ openSlots }: { openSlots: Slot[] }) {
  const slotsByDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of openSlots) {
      const k = dayKey(new Date(s.startsAt));
      const arr = m.get(k) ?? [];
      arr.push(s);
      m.set(k, arr);
    }
    for (const arr of m.values()) {
      arr.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
    }
    return m;
  }, [openSlots]);

  const todayKey = useMemo(() => dayKey(new Date()), []);

  const initial = useMemo(() => {
    const first = openSlots[0];
    const d = first ? new Date(first.startsAt) : new Date();
    return { year: d.getFullYear(), monthIdx: d.getMonth() };
  }, [openSlots]);

  const [cursor, setCursor] = useState(initial);
  const [selectedKey, setSelectedKey] = useState<string | null>(() => {
    const firstSlot = openSlots[0];
    return firstSlot ? dayKey(new Date(firstSlot.startsAt)) : null;
  });
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.monthIdx),
    [cursor],
  );

  const daysSlots = selectedKey ? (slotsByDay.get(selectedKey) ?? []) : [];

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const m = c.monthIdx + delta;
      const y = c.year + Math.floor(m / 12);
      const mi = ((m % 12) + 12) % 12;
      return { year: y, monthIdx: mi };
    });
  }

  if (openSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No open slots right now. Check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              ←
            </Button>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              {monthTitle(cursor.year, cursor.monthIdx)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              →
            </Button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground pb-2">
            {DOW.map((d) => (
              <div key={d}>{d.slice(0, 2)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((c) => {
              const has = slotsByDay.has(c.key);
              const isSelected = c.key === selectedKey;
              const isToday = c.key === todayKey;
              const classes = [
                "relative aspect-square flex items-center justify-center rounded-md text-sm transition",
              ];
              if (!c.inMonth) classes.push("text-muted-foreground/30");
              if (has) {
                classes.push("cursor-pointer hover:bg-accent font-semibold");
              } else {
                classes.push("cursor-not-allowed text-muted-foreground/50");
              }
              if (isSelected)
                classes.push(
                  "bg-foreground text-background hover:bg-foreground",
                );
              if (isToday && !isSelected)
                classes.push("ring-1 ring-foreground/40");
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!has}
                  onClick={() => setSelectedKey(c.key)}
                  className={classes.join(" ")}
                >
                  <span>{c.day}</span>
                  {has && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-foreground/70" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-foreground/40" />
              Today
            </span>
          </div>
        </div>

        <div>
          {selectedKey ? (
            <h3 className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {formatDayHeader(keyToDate(selectedKey))}
            </h3>
          ) : null}
          {daysSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedKey
                ? "No slots this day."
                : "Pick a day to see open times."}
            </p>
          ) : (
            <ul className="space-y-2">
              {daysSlots.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className="w-full flex items-center justify-between gap-3 rounded-lg border p-4 text-left hover:bg-accent transition"
                  >
                    <div>
                      <p className="font-medium">
                        {formatTime(new Date(s.startsAt))} –{" "}
                        {formatTime(new Date(s.endsAt))}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {s.location}
                      </p>
                    </div>
                    <span className="text-sm font-medium">Book →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <BookDialog slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
    </>
  );
}
