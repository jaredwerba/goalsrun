export type IcsEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  organizerName: string;
  organizerEmail: string;
};

function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

export function buildIcs(e: IcsEvent): string {
  const lines: (string | null)[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Goals Lopes//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${fmtUtc(new Date())}`,
    `DTSTART:${fmtUtc(e.start)}`,
    `DTEND:${fmtUtc(e.end)}`,
    `SUMMARY:${esc(e.summary)}`,
    e.description ? `DESCRIPTION:${esc(e.description)}` : null,
    e.location ? `LOCATION:${esc(e.location)}` : null,
    `ORGANIZER;CN=${esc(e.organizerName)}:mailto:${e.organizerEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines
    .filter((l): l is string => l !== null)
    .map(fold)
    .join("\r\n");
}
