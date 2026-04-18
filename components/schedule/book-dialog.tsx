"use client";

import { useEffect, useState } from "react";
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

export function BookDialog({
  slot,
  onClose,
}: {
  slot: Slot | null;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slot) setNotes("");
  }, [slot]);

  async function doBook() {
    if (!slot) return;
    setBusy(true);
    try {
      const res = await bookSlot(slot.id, notes.trim() || undefined);
      if (res.ok) {
        toast.success("Slot booked. See you out there.");
        onClose();
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
              <br />
              <span className="text-muted-foreground">{slot.location}</span>
            </DialogDescription>
          )}
        </DialogHeader>

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
