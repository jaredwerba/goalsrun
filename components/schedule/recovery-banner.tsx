"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  mode: "recovered" | "error";
};

export function RecoveryBanner({ mode }: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  // If the magic-link verification failed upstream, surface it once then
  // strip the query string so a reload doesn't re-toast.
  useEffect(() => {
    if (mode === "error") {
      toast.error("That sign-in link has expired or already been used.");
      router.replace("/book");
    }
  }, [mode, router]);

  if (mode === "error" || dismissed) return null;

  async function addPasskey() {
    setBusy(true);
    try {
      const res = await authClient.passkey.addPasskey({ name: "Primary" });
      if (res && "error" in res && res.error) {
        toast.error(res.error.message || "Could not add passkey. Try again.");
        return;
      }
      toast.success("Passkey saved. You're all set.");
      setDismissed(true);
      router.replace("/book");
    } catch {
      toast.error("Could not add passkey. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    setDismissed(true);
    router.replace("/book");
  }

  return (
    <div className="rounded-xl border bg-card p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Welcome back
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">
        Add a passkey so you skip email next time
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-prose">
        Uses Face ID or your device's biometrics. Instant sign-in, no more
        magic links.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={addPasskey} disabled={busy}>
          Add passkey
        </Button>
        <Button variant="outline" onClick={dismiss} disabled={busy}>
          Not now
        </Button>
      </div>
    </div>
  );
}
