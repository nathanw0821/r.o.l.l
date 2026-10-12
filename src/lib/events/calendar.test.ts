import { describe, it, expect } from "vitest";
import {
  CALENDAR_ENTRIES,
  activeEntries,
  buildIcs,
  calendarMonths,
  entryStatus,
  entryWindowUtc,
  tuesdaysInMonth,
  calendarMonthKeys,
  entryDays,
  monthGrid,
  monthKeyFor,
  yearMonthKeys,
  CALENDAR_YEAR,
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
    const aug = activeEntries(new Date("2026-08-01T00:00:00Z")).map((e) => e.name).sort();
    expect(aug).toEqual(["Caps-a-Plenty", "Fasnacht", "Summer Sock Hop Mini Season"]);
    // Jan 20 – 26: Treasure Hunter has reset out and Mothman Equinox has not started.
    expect(activeEntries(new Date("2026-01-22T00:00:00Z"))).toEqual([]);
  });

  it("groups by start month with the month's Tuesdays", () => {
    const months = calendarMonths();
    // Holiday Scorched starts in December 2025 and runs into the year; everything else is 2026.
    const keys = months.map((m) => m.key);
    expect(keys[0]).toBe("2025-12");
    expect(keys.slice(1)).toEqual(["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]);
    expect(months.find((m) => m.key === "2026-09")!.tuesdays).toEqual(["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29"]);
    expect(tuesdaysInMonth(2026, 10)).toEqual(["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"]);
    expect(CALENDAR_ENTRIES.length).toBe(97);
    // Four seasons, every entry tagged with the one it was published under.
    expect(new Set(CALENDAR_ENTRIES.map((e) => e.season))).toEqual(new Set([23, 24, 25, 26]));
    expect(CALENDAR_ENTRIES.filter((e) => e.season === 26).length).toBe(30);
  });

  it("emits one timed VEVENT per entry with UTC instants and folded lines", () => {
    const septemberPair = CALENDAR_ENTRIES.filter((e) => e.id === "scrip-surplus-sep" || e.id === "double-mutations-sep-1");
    const ics = buildIcs(septemberPair, { siteUrl: "https://fallout76.wiki", generatedAt: new Date("2026-09-28T00:00:00Z") });
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

describe("month grid", () => {
  it("names the Eastern month of an instant", () => {
    // 03:00Z on Oct 1 is still 23:00 EDT on Sep 30.
    expect(monthKeyFor(new Date("2026-10-01T03:00:00Z"))).toBe("2026-09");
    expect(monthKeyFor(new Date("2026-10-01T05:00:00Z"))).toBe("2026-10");
  });

  it("spans the whole calendar year, and an empty month still gets a grid", () => {
    expect(CALENDAR_YEAR).toBe(2026);
    const keys = yearMonthKeys();
    expect(keys[0]).toBe("2026-01");
    expect(keys[11]).toBe("2026-12");
    expect(keys.length).toBe(12);
    // January's first row (Sun Dec 28 – Sat Jan 3) carries Holiday Scorched in from December.
    const jan = monthGrid("2026-01");
    expect(jan.weeks.length).toBe(5);
    const carried = jan.weeks[0]!.segments.find((s) => s.entry.id === "holiday-scorched-jan")!;
    expect([carried.startCol, carried.continuesBefore, carried.continuesAfter]).toEqual([0, true, true]);
    // A month outside the data still lays out, with no lanes.
    const empty = monthGrid("2027-02");
    expect(empty.entries).toEqual([]);
    expect(empty.weeks.length).toBeGreaterThanOrEqual(4);
    expect(empty.weeks.every((w) => w.laneCount === 0)).toBe(true);
  });

  it("covers every month from the first start to the last end", () => {
    const all = calendarMonthKeys();
    expect([all[0], all.at(-1), all.length]).toEqual(["2025-12", "2026-12", 13]);
    expect(calendarMonthKeys([{ id: "x", season: 26, start: "2026-11-20", end: "2027-01-02", kind: "seasonal", name: "x", note: "" }])).toEqual(["2026-11", "2026-12", "2027-01"]);
  });

  it("lays September 2026 out Sunday to Saturday with the entries in stable lanes", () => {
    const grid = monthGrid("2026-09");
    expect(grid.label).toBe("September 2026");
    expect(grid.weeks.length).toBe(5);
    expect(grid.weeks[0]!.days.map((d) => d.day)).toEqual([30, 31, 1, 2, 3, 4, 5]);
    expect(grid.weeks[0]!.days[0]!.inMonth).toBe(false);
    expect(grid.weeks[0]!.days[2]!.tuesday).toBe(true);
    // Sep 10 – 14 (Thu to Mon) holds Scrip Surplus and Double Mutations side by side across two rows.
    const w2 = grid.weeks[1]!;
    const scrip = w2.segments.find((s) => s.entry.id === "scrip-surplus-sep")!;
    const dm = w2.segments.find((s) => s.entry.id === "double-mutations-sep-1")!;
    expect([scrip.startCol, scrip.endCol, scrip.continuesAfter, scrip.first]).toEqual([4, 6, true, true]);
    expect(dm.lane).not.toBe(scrip.lane);
    const w3 = grid.weeks[2]!;
    const scrip2 = w3.segments.find((s) => s.entry.id === "scrip-surplus-sep")!;
    expect([scrip2.startCol, scrip2.endCol, scrip2.continuesBefore, scrip2.first, scrip2.lane]).toEqual([0, 1, true, false, scrip.lane]);
    // The Slasher update is a single day: one column.
    const upd = w3.segments.find((s) => s.entry.id === "slasher-update")!;
    expect([upd.startCol, upd.endCol]).toEqual([2, 2]);
  });

  it("carries an entry that straddles two months into both grids", () => {
    const sep = monthGrid("2026-09");
    const oct = monthGrid("2026-10");
    const inSep = sep.weeks.at(-1)!.segments.find((s) => s.entry.id === "mutated-public-events-oct")!;
    const inOct = oct.weeks[0]!.segments.find((s) => s.entry.id === "mutated-public-events-oct")!;
    expect(inSep.continuesAfter).toBe(true);
    // October's first row starts on Sunday Sep 27, so the bar begins on its own day there (Tuesday, column 2).
    expect([inOct.startCol, inOct.continuesBefore, inOct.endCol, inOct.continuesAfter]).toEqual([2, false, 6, true]);
    expect(oct.entries.some((e) => e.id === "mutated-public-events-oct")).toBe(true);
    expect(entryDays({ start: "2026-09-29", end: "2026-10-02" })).toEqual(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"]);
  });
});
