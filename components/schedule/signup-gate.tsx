"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "signin";

// The password column in better-auth is required, so we still generate one at
// signup — it's just never surfaced to the user. The passkey is the only way
// in. If a passkey ever dies (lost device, rpID change), a magic-link recovery
// flow is the path back in. Tracked separately.
function randomPassword() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function SignupGate() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setBusy(true);
    try {
      const signUp = await authClient.signUp.email({
        email: email.trim(),
        name: name.trim(),
        password: randomPassword(),
      });
      if (signUp?.error) {
        toast.error(
          signUp.error.message ||
            "Sign-up failed. If you already have an account, sign in instead.",
        );
        return;
      }
      // Account is active (autoSignIn). Register a passkey so the user has a
      // way back in next time. If registration fails or is canceled, the
      // account still exists — we nudge them to retry.
      try {
        const pk = await authClient.passkey.addPasskey({ name: "Primary" });
        if (pk && "error" in pk && pk.error) {
          toast.error(
            pk.error.message ||
              "Account created, but the passkey wasn't saved. Sign out and try again.",
          );
          return;
        }
      } catch {
        toast.error(
          "Account created, but the passkey wasn't saved. Sign out and try again.",
        );
        return;
      }
      toast.success("You're in. Pick a slot below.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function signInWithPasskey(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        toast.error(
          res.error.message ||
            "No passkey found on this device. Create an account first.",
        );
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="rounded-xl border bg-card p-8 sm:p-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Private schedule
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
        {isSignup
          ? "Create an account to see open slots"
          : "Sign in to see open slots"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-prose">
        No passwords. Face ID or your device passkey. Ten seconds.
      </p>

      <form
        onSubmit={isSignup ? createAccount : signInWithPasskey}
        className="mt-6 space-y-4 max-w-md"
      >
        {isSignup && (
          <div className="grid gap-2">
            <Label htmlFor="gate-name">Name</Label>
            <Input
              id="gate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="gate-email">Email</Label>
          <Input
            id="gate-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={isSignup ? "email" : "username webauthn"}
            required={isSignup}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {isSignup ? "Create account with Face ID" : "Sign in with Face ID"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
          disabled={busy}
          className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
