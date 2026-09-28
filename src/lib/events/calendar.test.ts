import { describe, it, expect } from "vitest";
import {
  CALENDAR_ENTRIES,
  activeEntries,
  buildIcs,
  calendarMonths,
  entryStatus,
  entryWindowUtc,
  tuesdaysInMonth,
} from "./calendar";

describe("season calendar", () => {
  it("runs each entry from noon Eastern on its first day to noon Eastern after its last day", () => {
    // Sep 24 – Sep 28: EDT (UTC−4), so noon ET = 16:00Z.
    const w = entryWindowUtc({ start: "2026-09-24", end: "2026-09-28" });
    expect(w.startUtc.toISOString()).toBe("2026-09-24T16:00:00.000Z");
    expect(w.endUtc.toISOString()).toBe("2026-09-29T16:00:00.000Z");
    // Nov 5 – Nov 9 crosses the DST change (Nov 1): noon EST = 17:00Z.
    const late = entryWindowUtc({ start: "2026-11-05", end: "2026-11-09" });
    expect(late.startUtc.toISOString()).toBe("2026-11-05T17:00:00.000Z");
    expect(late.endUtc.toISOString()).toBe("2026-11-10T17:00:00.000Z");
  });

  it("reports upcoming, active and past against a clock", () => {
    const e = { start: "2026-09-24", end: "2026-09-28" };
    expect(entryStatus(e, new Date("2026-09-24T15:59:00Z"))).toBe("upcoming");
    expect(entryStatus(e, new Date("2026-09-24T16:00:00Z"))).toBe("active");
    expect(entryStatus(e, new Date("2026-09-29T15:59:59Z"))).toBe("active");
    expect(entryStatus(e, new Date("2026-09-29T16:00:00Z"))).toBe("past");
  });

  it("knows what is live on a given day from the truth pack", () => {
    const names = activeEntries(new Date("2026-09-26T12:00:00Z")).map((e) => e.name).sort();
    expect(names).toEqual(["Double Mutations", "Seasonal Fish Run", "Treasure Hunter"]);
    expect(activeEntries(new Date("2026-08-01T00:00:00Z"))).toEqual([]);
  });

  it("groups by start month with the month's Tuesdays", () => {
    const months = calendarMonths();
    expect(months.map((m) => m.key)).toEqual(["2026-09", "2026-10", "2026-11", "2026-12"]);
    expect(months[0]!.tuesdays).toEqual(["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29"]);
    expect(tuesdaysInMonth(2026, 10)).toEqual(["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"]);
    expect(CALENDAR_ENTRIES.length).toBe(30);
  });

  it("emits one timed VEVENT per entry with UTC instants and folded lines", () => {
    const ics = buildIcs(CALENDAR_ENTRIES.slice(0, 2), { siteUrl: "https://fallout76.wiki", generatedAt: new Date("2026-09-28T00:00:00Z") });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
    expect(ics).toContain("DTSTART:20260910T160000Z");
    expect(ics).toContain("DTEND:20260915T160000Z");
    expect(ics).toContain("UID:scrip-surplus-sep-s26@fallout76.wiki");
    expect(ics).toContain("URL:https://fallout76.wiki/calendar#scrip-surplus-sep");
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(71);
  });
});
