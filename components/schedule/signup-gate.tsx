"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function randomPassword() {
  const a = new Uint8Array(18);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function SignupGate() {
  const router = useRouter();
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
        toast.error(signUp.error.message || "Sign-up failed.");
        return;
      }
      const pk = await authClient.passkey.addPasskey({ name: "Primary" });
      if (pk && "error" in pk && pk.error) {
        toast.error(
          pk.error.message ||
            "Passkey registration failed. You can still book, but future sign-ins will need a reset.",
        );
      } else {
        toast.success("Account ready. Pick a slot below.");
      }
      router.refresh();
    } finally {
      setBusy(false);
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
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border bg-card p-8 sm:p-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Private schedule
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
        Create an account to see open slots
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-prose">
        Passkey-based — no passwords. Takes ten seconds. Your first run with
        Goals is free.
      </p>

      <form onSubmit={createAccount} className="mt-6 space-y-4 max-w-md">
        <div className="grid gap-2">
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          Create account with passkey
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={signInWithPasskey}
          disabled={busy}
          className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          Sign in with passkey
        </button>
      </p>
    </div>
  );
}
