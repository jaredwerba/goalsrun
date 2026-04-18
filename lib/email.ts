import { Resend } from "resend";
import { buildIcs } from "./ics";
import { RUNNER_NAME } from "./content";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Goals Lopes <bookings@jwerba.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "jwerba@gmail.com";

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
