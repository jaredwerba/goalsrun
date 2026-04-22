import { Resend } from "resend";
import { buildIcs } from "./ics";
import { PARTNERSHIPS_EMAIL, RUNNER_NAME } from "./content";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Goals Lopes <bookings@jwerba.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "gersonlopes7@gmail.com";
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

/** Sent when a user submits a booking request (status = pending).
 *  User gets "request received"; admin gets notified to review. */
export async function sendBookingRequestEmails(p: BookingEmailPayload): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping request emails");
    return;
  }

  const when = formatWhen(p.startsAt);

  const userHtml = `
    <p>Hi ${p.userName},</p>
    <p>Your run request for <strong>${when}</strong> at ${p.location} has been received.</p>
    <p>Goals will review and confirm shortly. You'll get another email once it's accepted.</p>
    <p>— ${RUNNER_NAME}</p>
  `;

  const adminHtml = `
    <p><strong>New run request — pending your review.</strong></p>
    <ul>
      <li><strong>Who:</strong> ${p.userName} &lt;${p.userEmail}&gt;</li>
      <li><strong>When:</strong> ${when}</li>
      <li><strong>Where:</strong> ${p.location}</li>
      <li><strong>Notes:</strong> ${p.notes ?? "—"}</li>
    </ul>
    <p>Sign in at <a href="https://goalslopes.run/admin">goalslopes.run/admin</a> to accept or cancel.</p>
  `;

  const results = await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: p.userEmail,
      subject: `Run request received — ${when}`,
      html: userHtml,
    }),
    resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New request: ${p.userName} — ${when}`,
      html: adminHtml,
    }),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
    else if (r.value && "error" in r.value && r.value.error)
      console.error("[email] resend error:", r.value.error);
  }
}

/** Sent when admin accepts a booking. User gets confirmation + .ics. */
export async function sendBookingAcceptedEmail(p: BookingEmailPayload): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping accepted email");
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
    <p>You're confirmed for <strong>${when}</strong> at ${p.location}.</p>
    <p>The attached <code>.ics</code> will drop it onto your calendar.
    Bring water, something to run in, and whatever question you want answered on the move.</p>
    <p>See you out there,<br/>— ${RUNNER_NAME}</p>
  `;

  const res = await resend.emails.send({
    from: FROM_EMAIL,
    to: p.userEmail,
    subject: `Confirmed: your run with ${RUNNER_NAME} — ${when}`,
    html: userHtml,
    attachments: [icsAttachment],
  });
  if (res && "error" in res && res.error)
    console.error("[email] accepted email error:", res.error);
}

export async function sendMagicLinkEmail(
  email: string,
  url: string,
): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping magic link");
    return;
  }

  const html = `
    <p>Hi,</p>
    <p>Click the link below to sign in to your account with ${RUNNER_NAME}.
    The link expires in 5 minutes and can only be used once.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px">Sign in</a></p>
    <p style="color:#6b7280;font-size:12px">Or paste this URL into your browser:<br/>${url}</p>
    <p style="color:#6b7280;font-size:12px">If you didn't request this, ignore this email — no sign-in will happen.</p>
  `;

  const res = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your sign-in link for ${RUNNER_NAME}`,
    html,
  });
  if (res && "error" in res && res.error) {
    console.error("[email] magic link resend error:", res.error);
    throw new Error("Could not send sign-in email.");
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
