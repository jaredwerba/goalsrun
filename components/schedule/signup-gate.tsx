"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "signin" | "recover";

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

  async function requestMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email you signed up with.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: "/book?recovered=1",
        // Plugin appends ?error=<CODE> (INVALID_TOKEN / EXPIRED_TOKEN / ...)
        // on failure — pass the bare path and detect any error= in the banner.
        errorCallbackURL: "/book",
      });
      if (res?.error) {
        // Don't leak existence — collapse "user not found" into the generic
        // "check your email" message.
        if (res.error.code === "USER_NOT_FOUND") {
          toast.success("If that email has an account, a sign-in link is on its way.");
          return;
        }
        toast.error(res.error.message || "Could not send sign-in link.");
        return;
      }
      toast.success("Sign-in link sent. Check your email.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";
  const isSignin = mode === "signin";
  const isRecover = mode === "recover";

  const heading = isSignup
    ? "Create an account to see open slots"
    : isSignin
      ? "Sign in to see open slots"
      : "Get a sign-in link";

  const subhead = isRecover
    ? "Lost your passkey? We'll email you a one-time sign-in link. Valid for 10 minutes."
    : "No passwords. Face ID or your device passkey. Ten seconds.";

  const submitLabel = isSignup
    ? "Create account with Face ID"
    : isSignin
      ? "Sign in with Face ID"
      : "Send sign-in link";

  const onSubmit = isSignup
    ? createAccount
    : isSignin
      ? signInWithPasskey
      : requestMagicLink;

  return (
    <div className="rounded-xl border bg-card p-8 sm:p-10">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Private schedule
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{heading}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-prose">
        {subhead}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 max-w-md">
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
            autoComplete={isSignup || isRecover ? "email" : "username webauthn"}
            required={isSignup || isRecover}
          />
        </div>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {isSignup && (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              disabled={busy}
              className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
            >
              Sign in
            </button>
          </p>
        )}
        {isSignin && (
          <>
            <p>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                disabled={busy}
                className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
              >
                Create an account
              </button>
            </p>
            <p>
              Can't sign in?{" "}
              <button
                type="button"
                onClick={() => setMode("recover")}
                disabled={busy}
                className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
              >
                Email me a sign-in link
              </button>
            </p>
          </>
        )}
        {isRecover && (
          <p>
            <button
              type="button"
              onClick={() => setMode("signin")}
              disabled={busy}
              className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
