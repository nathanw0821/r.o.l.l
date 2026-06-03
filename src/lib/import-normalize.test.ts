import { describe, it, expect } from "vitest";
import { normalizeDisplayNotes, extractOriginsFromNotes } from "./import-normalize";

describe("import-normalize display notes", () => {
  it("should extract correct origins from notes", () => {
    expect(extractOriginsFromNotes("Infestations")).toEqual(["Infestations"]);
    expect(extractOriginsFromNotes("RAID: Gleaming Depths (only Stage 3) • Bigfoot")).toEqual(["Bigfoot", "Gleaming Depths"]);
    expect(extractOriginsFromNotes("Burning Springs • Bounties • Bounty Hunting: Head Hunt & Grunt Hunt")).toEqual(["Bounties", "Burning Springs", "Head Hunt & Grunt Hunt"]);
  });

  it("should normalize display notes and strip origins correctly", () => {
    // For Aegis: origins are "Bigfoot" and "Gleaming Depths"
    expect(
      normalizeDisplayNotes(
        "RAID: Gleaming Depths (only Stage 3) • Bigfoot",
        ["Bigfoot", "Gleaming Depths"]
      )
    ).toBe("RAID: (only Stage 3)");

    // For Bounty Hunting: origin includes Bounties, Burning Springs and Head Hunt & Grunt Hunt
    expect(
      normalizeDisplayNotes(
        "Burning Springs • Bounties • Bounty Hunting: Head Hunt & Grunt Hunt",
        ["Bounties", "Burning Springs", "Head Hunt & Grunt Hunt"]
      )
    ).toBe("Bounty Hunting");
  });

  it("should fall back to original note if note would otherwise be completely stripped", () => {
    // For Hauler's: note is "Infestations", origin is "Infestations"
    expect(
      normalizeDisplayNotes("Infestations", ["Infestations"])
    ).toBe("Infestations");

    // Multiple origins that are stripped should still fall back if they make up the entire note
    expect(
      normalizeDisplayNotes("Burning Springs • Head Hunt & Grunt Hunt", [
        "Burning Springs",
        "Head Hunt & Grunt Hunt",
      ])
    ).toBe("Burning Springs • Head Hunt & Grunt Hunt");
  });
});
