"use server";

import {
  PARTNERSHIP_BUDGETS,
  PARTNERSHIP_TYPES,
  type PartnershipBudget,
  type PartnershipType,
} from "@/lib/content";
import { sendPartnerInquiry } from "@/lib/email";

export type PartnerInquiryInput = {
  brand: string;
  contactName: string;
  contactEmail: string;
  partnershipType: string;
  budget: string;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitPartnerInquiry(
  input: PartnerInquiryInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const brand = (input.brand || "").trim();
  const contactName = (input.contactName || "").trim();
  const contactEmail = (input.contactEmail || "").trim();
  const partnershipType = (input.partnershipType || "").trim();
  const budget = (input.budget || "").trim();
  const message = (input.message || "").trim();

  if (!brand) return { ok: false, error: "Brand is required." };
  if (!contactName) return { ok: false, error: "Your name is required." };
  if (!EMAIL_RE.test(contactEmail)) {
    return { ok: false, error: "A valid email is required." };
  }
  if (
    !partnershipType ||
    !(PARTNERSHIP_TYPES as readonly string[]).includes(partnershipType)
  ) {
    return { ok: false, error: "Pick a partnership type." };
  }
  if (
    budget &&
    !(PARTNERSHIP_BUDGETS as readonly string[]).includes(budget)
  ) {
    return { ok: false, error: "Pick a budget option." };
  }
  if (message.length < 10) {
    return { ok: false, error: "Tell us a little more (10+ characters)." };
  }
  if (message.length > 4000) {
    return { ok: false, error: "Message is too long." };
  }

  return sendPartnerInquiry({
    brand,
    contactName,
    contactEmail,
    partnershipType: partnershipType as PartnershipType,
    budget: (budget || "") as PartnershipBudget | "",
    message,
  });
}
