"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PARTNERSHIP_BUDGETS,
  PARTNERSHIP_TYPES,
} from "@/lib/content";
import { submitPartnerInquiry } from "@/app/partners/actions";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive";

const textareaClass =
  "min-h-[120px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive";

export function PartnerContactForm() {
  const [brand, setBrand] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [partnershipType, setPartnershipType] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await submitPartnerInquiry({
        brand,
        contactName,
        contactEmail,
        partnershipType,
        budget,
        message,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Pitch sent. Goals will reply personally.");
      setBrand("");
      setContactName("");
      setContactEmail("");
      setPartnershipType("");
      setBudget("");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="p-brand">Brand / company</Label>
          <Input
            id="p-brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            autoComplete="organization"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-name">Your name</Label>
          <Input
            id="p-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="p-email">Email</Label>
        <Input
          id="p-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="p-type">Partnership type</Label>
          <select
            id="p-type"
            value={partnershipType}
            onChange={(e) => setPartnershipType(e.target.value)}
            className={selectClass}
            required
          >
            <option value="" disabled>
              Pick one…
            </option>
            {PARTNERSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p-budget">Budget (optional)</Label>
          <select
            id="p-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={selectClass}
          >
            <option value="">—</option>
            {PARTNERSHIP_BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="p-message">What you have in mind</Label>
        <textarea
          id="p-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={textareaClass}
          placeholder="Campaign idea, timing, product, anything else we should know."
          required
          minLength={10}
          maxLength={4000}
        />
      </div>

      <Button type="submit" disabled={busy} size="lg">
        {busy ? "Sending…" : "Send pitch"}
      </Button>
    </form>
  );
}
