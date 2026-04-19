import { Resend } from "resend";
import { buildIcs } from "./ics";
import { PARTNERSHIPS_EMAIL, RUNNER_NAME } from "./content";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Goals Lopes <bookings@jwerba.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "jwerba@gmail.com";
const PARTNER_TO_EMAIL = PARTNERSHIPS_EMAIL ?? ADMIN_EMAIL;

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export type BookingEmailPayload = {
  bookingId: string;
  userName: string;
  userEmail: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  notes: string | null;
};

function formatWhen(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
}

export async function sendBookingEmails(p: BookingEmailPayload): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping booking emails");
    return;
  }

  const ics = buildIcs({
    uid: `booking-${p.bookingId}@goalsrun`,
    start: p.startsAt,
    end: p.endsAt,
    summary: `Run with ${RUNNER_NAME}`,
    description: `1:1 coached run at ${p.location}.${p.notes ? `\nNotes: ${p.notes}` : ""}`,
    location: p.location,
    organizerName: RUNNER_NAME,
    organizerEmail: ADMIN_EMAIL,
  });

  const icsAttachment = {
    filename: "run-with-goals.ics",
    content: Buffer.from(ics).toString("base64"),
  };

  const when = formatWhen(p.startsAt);

  const userHtml = `
    <p>Hi ${p.userName},</p>
    <p>You're on for <strong>${when}</strong> at ${p.location}.</p>
    <p>The attached <code>.ics</code> will drop it onto your calendar.
    Bring water, something you can run in, and whatever question you want answered on the move.</p>
    <p>See you out there,<br/>— ${RUNNER_NAME}</p>
  `;

  const adminHtml = `
    <p><strong>New booking.</strong></p>
    <ul>
      <li><strong>Who:</strong> ${p.userName} &lt;${p.userEmail}&gt;</li>
      <li><strong>When:</strong> ${when}</li>
      <li><strong>Where:</strong> ${p.location}</li>
      <li><strong>Notes:</strong> ${p.notes ? p.notes : "—"}</li>
    </ul>
    <p>Calendar invite attached.</p>
  `;

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: p.userEmail,
      subject: `Your run with ${RUNNER_NAME} is confirmed — ${when}`,
      html: userHtml,
      attachments: [icsAttachment],
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New booking: ${p.userName} — ${when}`,
      html: adminHtml,
      attachments: [icsAttachment],
    }),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] send failed:", r.reason);
    } else if (r.value && "error" in r.value && r.value.error) {
      console.error("[email] resend error:", r.value.error);
    }
  }
}

export type PartnerInquiryPayload = {
  brand: string;
  contactName: string;
  contactEmail: string;
  partnershipType: string;
  budget: string;
  message: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPartnerInquiry(
  p: PartnerInquiryPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping partner inquiry");
    return { ok: false, error: "Email is not configured." };
  }

  const body = p.message.trim();
  const html = `
    <p><strong>New partnership inquiry.</strong></p>
    <ul>
      <li><strong>Brand:</strong> ${escapeHtml(p.brand)}</li>
      <li><strong>Contact:</strong> ${escapeHtml(p.contactName)} &lt;${escapeHtml(p.contactEmail)}&gt;</li>
      <li><strong>Type:</strong> ${escapeHtml(p.partnershipType)}</li>
      <li><strong>Budget:</strong> ${escapeHtml(p.budget || "—")}</li>
    </ul>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(body)}</p>
    <hr/>
    <p style="color:#6b7280;font-size:12px">
      Reply directly to this email to respond to ${escapeHtml(p.contactName)} at ${escapeHtml(p.brand)}.
    </p>
  `;

  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to: PARTNER_TO_EMAIL,
      replyTo: p.contactEmail,
      subject: `[Partnership] ${p.brand} — ${p.partnershipType}`,
      html,
    });
    if (res && "error" in res && res.error) {
      console.error("[email] partner inquiry resend error:", res.error);
      return { ok: false, error: "Mail service rejected the request." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] partner inquiry failed:", err);
    return { ok: false, error: "Could not send right now." };
  }
}
