"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookSlot } from "@/app/actions";
import { formatSlotRange } from "@/lib/tz";
import type { Slot } from "@/lib/db/schema";

const LOCATIONS = [
  "Sullivans Castle Island",
  "Moakley Park Stadium",
] as const;

type Location = (typeof LOCATIONS)[number];

export function BookDialog({
  slot,
  onClose,
}: {
  slot: Slot | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [location, setLocation] = useState<Location>(LOCATIONS[0]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slot) {
      setNotes("");
      setLocation(LOCATIONS[0]);
    }
  }, [slot]);

  async function doBook() {
    if (!slot) return;
    setBusy(true);
    try {
      const res = await bookSlot(slot.id, location, notes.trim() || undefined);
      if (res.ok) {
        onClose();
        router.push(`/booking/${res.bookingId}`);
      } else {
        toast.error(res.error);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!slot} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book this run</DialogTitle>
          {slot && (
            <DialogDescription className="text-base text-foreground">
              {formatSlotRange(new Date(slot.startsAt), new Date(slot.endsAt))}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Location picker */}
        <div className="grid gap-3">
          <Label>Meeting location</Label>
          <div className="grid gap-2">
            {LOCATIONS.map((loc) => (
              <label
                key={loc}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                  location === loc
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:border-foreground/40"
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={loc}
                  checked={location === loc}
                  onChange={() => setLocation(loc)}
                  className="accent-foreground"
                />
                <span className="font-medium text-sm">{loc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="grid gap-2">
          <Label htmlFor="notes">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pace, anything you want to mention…"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={doBook} disabled={busy}>
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
