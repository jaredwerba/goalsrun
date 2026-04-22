"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "signin";

export function SignupGate() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8) {
      toast.error("Name, email, and a password (8+ chars) are required.");
      return;
    }
    setBusy(true);
    try {
      const signUp = await authClient.signUp.email({
        email: email.trim(),
        name: name.trim(),
        password,
      });
      if (signUp?.error) {
        toast.error(signUp.error.message || "Sign-up failed.");
        return;
      }
      // Optional passkey. If this fails the account is still fine.
      try {
        await authClient.passkey.addPasskey({ name: "Primary" });
      } catch {
        // Ignore — user can add a passkey later after signing in.
      }
      toast.success("Account ready. Pick a slot below.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (res?.error) {
        toast.error(res.error.message || "Sign-in failed.");
        return;
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
        toast.error(
          res.error.message || "No passkey found. Use email + password.",
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
        {isSignup
          ? "Takes ten seconds. Your first run with Goals is free."
          : "Welcome back. Passkey or password — whichever is handy."}
      </p>

      <form
        onSubmit={isSignup ? createAccount : signInWithPassword}
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
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gate-password">Password</Label>
          <Input
            id="gate-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          {isSignup && (
            <p className="text-xs text-muted-foreground">
              8+ characters. You can add a passkey after signing in.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={busy}>
            {isSignup ? "Create account" : "Sign in"}
          </Button>
          {!isSignup && (
            <Button
              type="button"
              variant="outline"
              onClick={signInWithPasskey}
              disabled={busy}
            >
              Use passkey
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setPassword("");
          }}
          disabled={busy}
          className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}
