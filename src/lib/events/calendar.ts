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

/** `YYYY-MM` of the instant in Eastern time, the zone the calendar is written in. */
export function monthKeyFor(now: Date): string {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit" }).formatToParts(now);
  const y = p.find((x) => x.type === "year")?.value ?? "1970";
  const m = p.find((x) => x.type === "month")?.value ?? "01";
  return `${y}-${m}`;
}

export function monthLabel(key: string): string {
  const [y, m] = parts(`${key}-01`);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

/** Every month from the first entry's start to the last entry's end, so a quiet month still has a grid. */
export function calendarMonthKeys(entries: CalendarEntry[] = CALENDAR_ENTRIES): string[] {
  if (entries.length === 0) return [];
  const first = entries.reduce((a, e) => (e.start < a ? e.start : a), entries[0]!.start).slice(0, 7);
  const last = entries.reduce((a, e) => (e.end > a ? e.end : a), entries[0]!.end).slice(0, 7);
  const out: string[] = [];
  let [y, m] = parts(`${first}-01`);
  for (;;) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    out.push(key);
    if (key >= last) break;
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

export type GridDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  /** Weekly update day. */
  tuesday: boolean;
};

/** One entry's run inside one week row: columns 0 (Sunday) to 6 (Saturday), inclusive. */
export type GridSegment = {
  entry: CalendarEntry;
  startCol: number;
  endCol: number;
  /** Row below the day numbers; the same entry keeps its lane for the whole month. */
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  /** First segment of this entry in this month (carries the anchor id and the label). */
  first: boolean;
};

export type GridWeek = { days: GridDay[]; segments: GridSegment[]; laneCount: number };

export type CalendarGrid = { key: string; label: string; weeks: GridWeek[]; entries: CalendarEntry[] };

function isoOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * A regular month grid (Sunday to Saturday rows) with every entry that overlaps the month laid out as
 * bars. Lanes are assigned per month, lowest free lane first, so an entry keeps its row across weeks.
 */
export function monthGrid(key: string, entries: CalendarEntry[] = CALENDAR_ENTRIES): CalendarGrid {
  const [y, m] = parts(`${key}-01`);
  const firstOfMonth = new Date(Date.UTC(y, m - 1, 1));
  const lastOfMonth = new Date(Date.UTC(y, m, 0));
  const monthStart = isoOf(firstOfMonth);
  const monthEnd = isoOf(lastOfMonth);
  const overlapping = entries
    .filter((e) => e.start <= monthEnd && e.end >= monthStart)
    .sort((a, b) => (a.start === b.start ? b.end.localeCompare(a.end) : a.start.localeCompare(b.start)));

  // Lane per entry: the lowest lane with no other entry on any of its days inside this month.
  const laneByDay = new Map<string, Set<number>>();
  const laneOf = new Map<string, number>();
  for (const e of overlapping) {
    const from = e.start < monthStart ? monthStart : e.start;
    const to = e.end > monthEnd ? monthEnd : e.end;
    const days: string[] = [];
    for (let d = new Date(from + "T00:00:00Z"); isoOf(d) <= to; d.setUTCDate(d.getUTCDate() + 1)) days.push(isoOf(d));
    let lane = 0;
    while (days.some((day) => laneByDay.get(day)?.has(lane))) lane += 1;
    for (const day of days) {
      if (!laneByDay.has(day)) laneByDay.set(day, new Set());
      laneByDay.get(day)!.add(lane);
    }
    laneOf.set(e.id, lane);
  }

  const weeks: GridWeek[] = [];
  const cursor = new Date(firstOfMonth);
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());
  const seen = new Set<string>();
  while (cursor <= lastOfMonth) {
    const days: GridDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      const iso = isoOf(cursor);
      days.push({ iso, day: cursor.getUTCDate(), inMonth: cursor.getUTCMonth() === m - 1, tuesday: cursor.getUTCDay() === 2 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    const weekStart = days[0]!.iso;
    const weekEnd = days[6]!.iso;
    const segments: GridSegment[] = [];
    for (const e of overlapping) {
      if (e.start > weekEnd || e.end < weekStart) continue;
      const startCol = e.start <= weekStart ? 0 : days.findIndex((d) => d.iso === e.start);
      const endCol = e.end >= weekEnd ? 6 : days.findIndex((d) => d.iso === e.end);
      const first = !seen.has(e.id);
      seen.add(e.id);
      segments.push({
        entry: e,
        startCol,
        endCol,
        lane: laneOf.get(e.id) ?? 0,
        continuesBefore: e.start < weekStart,
        continuesAfter: e.end > weekEnd,
        first,
      });
    }
    const laneCount = segments.reduce((n, s) => Math.max(n, s.lane + 1), 0);
    weeks.push({ days, segments, laneCount });
  }
  return { key, label: monthLabel(key), weeks, entries: overlapping };
}

/** Every ISO day an entry covers, for highlighting its period in the grid. */
export function entryDays(entry: Pick<CalendarEntry, "start" | "end">): string[] {
  const out: string[] = [];
  for (let d = new Date(entry.start + "T00:00:00Z"); isoOf(d) <= entry.end; d.setUTCDate(d.getUTCDate() + 1)) out.push(isoOf(d));
  return out;
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
