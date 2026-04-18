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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { bookSlot } from "@/app/actions";
import { formatSlotRange } from "@/lib/tz";
import type { Slot } from "@/lib/db/schema";

function randomPassword() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function BookDialog({
  slot,
  onClose,
}: {
  slot: Slot | null;
  onClose: () => void;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<"choose" | "create">("choose");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!slot) {
      setMode("choose");
      setEmail("");
      setName("");
      setNotes("");
    }
  }, [slot]);

  async function doBook() {
    if (!slot) return;
    const res = await bookSlot(slot.id, notes.trim() || undefined);
    if (res.ok) {
      toast.success("Slot booked. See you out there.");
      onClose();
    } else {
      toast.error(res.error);
    }
  }

  async function signInWithPasskey() {
    setBusy(true);
    try {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        toast.error(res.error.message || "Passkey sign-in failed.");
        return;
      }
      await doBook();
    } finally {
      setBusy(false);
    }
  }

  async function createAccountAndBook() {
    if (!email || !name) {
      toast.error("Name and email are required.");
      return;
    }
    setBusy(true);
    try {
      const signUp = await authClient.signUp.email({
        email,
        name,
        password: randomPassword(),
      });
      if (signUp?.error) {
        toast.error(signUp.error.message || "Sign-up failed.");
        return;
      }
      const pk = await authClient.passkey.addPasskey({ name: "Primary" });
      if (pk && "error" in pk && pk.error) {
        toast.error(
          pk.error.message ||
            "Passkey registration failed. You can still book, but you won't be able to sign in again without your email.",
        );
      }
      await doBook();
    } finally {
      setBusy(false);
    }
  }

  const isAuthed = !!session?.user;

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

        {isPending ? (
          <p className="text-sm text-muted-foreground">Checking session…</p>
        ) : isAuthed ? (
          <>
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
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={doBook} disabled={busy}>
                Confirm booking
              </Button>
            </DialogFooter>
          </>
        ) : mode === "choose" ? (
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={signInWithPasskey}
              disabled={busy}
            >
              Sign in with passkey
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              <span>or</span>
              <Separator className="flex-1" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode("create")}
              disabled={busy}
            >
              First time — create account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You&apos;ll be prompted to register a passkey so future bookings
              are one tap.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={busy}
              >
                Back
              </Button>
              <Button onClick={createAccountAndBook} disabled={busy}>
                Create & book
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
