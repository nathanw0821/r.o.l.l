import events from "@/data/truth/events.json";
import { easternToUtc } from "@/lib/discord/vault-intel";

/**
 * Season calendar from the truth pack (`src/data/truth/events.json`, transcribed from Bethesda's
 * official community calendar). Event days run from daily reset to daily reset, noon Eastern,
 * so an entry "Sep 24 – Sep 28" is live from Sep 24 12:00 ET until Sep 29 12:00 ET. Everything
 * here is pure so the page, the `.ics` feed and the tests share one clock.
 */
export type EventKind = keyof typeof events.kinds;

export type CalendarEntry = {
  id: string;
  /** Inclusive calendar days, ISO `YYYY-MM-DD`, Eastern time. */
  start: string;
  end: string;
  kind: EventKind;
  name: string;
  note: string;
};

export type EntryStatus = "past" | "active" | "upcoming";

export const EVENT_KIND_LABEL: Record<EventKind, string> = events.kinds;
export const CALENDAR_TITLE = events.title;
export const CALENDAR_SOURCE = events.source;
export const CALENDAR_ENTRIES: CalendarEntry[] = (events.entries as CalendarEntry[])
  .slice()
  .sort((a, b) => (a.start === b.start ? a.end.localeCompare(b.end) : a.start.localeCompare(b.start)));

const RESET_HOUR_ET = Number.parseInt(events.resetEastern.split(":")[0] ?? "12", 10);

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  return [y, m, d];
}

/** The instant the entry starts (reset on its first day) and ends (reset after its last day). */
export function entryWindowUtc(entry: Pick<CalendarEntry, "start" | "end">): { startUtc: Date; endUtc: Date } {
  const [sy, sm, sd] = parts(entry.start);
  const [ey, em, ed] = parts(entry.end);
  const dayAfterEnd = new Date(Date.UTC(ey, em - 1, ed + 1));
  return {
    startUtc: easternToUtc(sy, sm, sd, RESET_HOUR_ET),
    endUtc: easternToUtc(dayAfterEnd.getUTCFullYear(), dayAfterEnd.getUTCMonth() + 1, dayAfterEnd.getUTCDate(), RESET_HOUR_ET),
  };
}

export function entryStatus(entry: Pick<CalendarEntry, "start" | "end">, now: Date): EntryStatus {
  const { startUtc, endUtc } = entryWindowUtc(entry);
  if (now.getTime() < startUtc.getTime()) return "upcoming";
  if (now.getTime() >= endUtc.getTime()) return "past";
  return "active";
}

export function activeEntries(now: Date, entries: CalendarEntry[] = CALENDAR_ENTRIES): CalendarEntry[] {
  return entries.filter((e) => entryStatus(e, now) === "active");
}

export type CalendarMonth = {
  /** `YYYY-MM` */
  key: string;
  label: string;
  /** ISO dates of every Tuesday in the month (weekly update day). */
  tuesdays: string[];
  entries: CalendarEntry[];
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function tuesdaysInMonth(year: number, month: number): string[] {
  const out: string[] = [];
  const first = new Date(Date.UTC(year, month - 1, 1));
  for (let d = new Date(first); d.getUTCMonth() === month - 1; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 2) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Entries grouped by the month they start in, in calendar order. */
export function calendarMonths(entries: CalendarEntry[] = CALENDAR_ENTRIES): CalendarMonth[] {
  const byKey = new Map<string, CalendarMonth>();
  for (const e of entries) {
    const key = e.start.slice(0, 7);
    if (!byKey.has(key)) {
      const [y, m] = parts(`${key}-01`);
      byKey.set(key, { key, label: `${MONTH_NAMES[m - 1]} ${y}`, tuesdays: tuesdaysInMonth(y, m), entries: [] });
    }
    byKey.get(key)!.entries.push(e);
  }
  return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function icsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** RFC 5545 line folding at 75 octets (we fold at 70 characters, safe for ASCII-heavy text). */
function foldLine(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 70) {
    out.push(rest.slice(0, 70));
    rest = " " + rest.slice(70);
  }
  out.push(rest);
  return out.join("\r\n");
}

/**
 * iCalendar feed of the season: one timed VEVENT per entry (reset to reset, UTC instants), so
 * subscribers see the real start and end in their own time zone.
 */
export function buildIcs(
  entries: CalendarEntry[] = CALENDAR_ENTRIES,
  opts: { siteUrl?: string; generatedAt?: Date } = {},
): string {
  const site = opts.siteUrl?.replace(/\/$/, "") ?? "https://fallout76.wiki";
  const stamp = icsStamp(opts.generatedAt ?? new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//R.O.L.L.//Fallout 76 season calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText(`Fallout 76 · ${CALENDAR_TITLE}`)}`,
    "X-WR-TIMEZONE:America/New_York",
  ];
  for (const e of entries) {
    const { startUtc, endUtc } = entryWindowUtc(e);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}-s${events.season}@fallout76.wiki`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsStamp(startUtc)}`,
      `DTEND:${icsStamp(endUtc)}`,
      `SUMMARY:${icsText(`${e.name} (Fallout 76)`)}`,
      `DESCRIPTION:${icsText(`${e.note}\nDays run from reset to reset, noon Eastern. Source: ${CALENDAR_SOURCE.label}.`)}`,
      `CATEGORIES:${icsText(EVENT_KIND_LABEL[e.kind])}`,
      `URL:${site}/calendar#${e.id}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
