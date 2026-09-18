import { describe, expect, it } from "vitest";
import { currentEventPhase, isSeasonWindowOpen, resolveSeasonAttribute } from "@/lib/season";

describe("seasonal look (The Slasher / Blood Moon)", () => {
  it("is open from 2026-09-15 through 2026-11-10 inclusive and closed outside", () => {
    expect(isSeasonWindowOpen(new Date("2026-09-14T23:00:00Z"))).toBe(false);
    expect(isSeasonWindowOpen(new Date("2026-09-15T00:00:00Z"))).toBe(true);
    expect(isSeasonWindowOpen(new Date("2026-11-10T23:59:00Z"))).toBe(true);
    expect(isSeasonWindowOpen(new Date("2026-11-11T00:00:00Z"))).toBe(false);
  });
  it("resolves auto/on/off to the html attribute", () => {
    const inWindow = new Date("2026-10-13T12:00:00Z");
    const outside = new Date("2026-12-01T12:00:00Z");
    expect(resolveSeasonAttribute("auto", inWindow)).toBe("blood-moon");
    expect(resolveSeasonAttribute("auto", outside)).toBe("");
    expect(resolveSeasonAttribute("on", outside)).toBe("blood-moon");
    expect(resolveSeasonAttribute("off", inWindow)).toBe("");
  });
  it("reports the current event phase", () => {
    expect(currentEventPhase(new Date("2026-09-18T00:00:00Z"))?.title).toBe("Masked Truth");
    expect(currentEventPhase(new Date("2026-10-14T00:00:00Z"))?.week).toBe(5);
    expect(currentEventPhase(new Date("2026-12-01T00:00:00Z"))).toBeNull();
  });
});
