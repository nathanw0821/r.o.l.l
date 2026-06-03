import { describe, it, expect } from "vitest";
import { normalizeDisplayNotes, extractOriginsFromNotes } from "./import-normalize";

describe("import-normalize display notes", () => {
  it("should extract correct origins from notes", () => {
    expect(extractOriginsFromNotes("Infestations")).toEqual(["Infestations"]);
    expect(extractOriginsFromNotes("RAID: Gleaming Depths (only Stage 3) & Bigfoot")).toEqual(["Gleaming Depths & Bigfoot"]);
    expect(extractOriginsFromNotes("Burning Springs • Bounty Hunting: Head Hunt & Grunt Hunt")).toEqual(["Burning Springs", "Head Hunt & Grunt Hunt"]);
  });

  it("should normalize display notes and strip origins correctly", () => {
    // For Aegis: origin is "Gleaming Depths & Bigfoot" (non-contiguous in the note due to parentheses, so it remains unstripped)
    expect(
      normalizeDisplayNotes(
        "RAID: Gleaming Depths (only Stage 3) & Bigfoot",
        ["Gleaming Depths & Bigfoot"]
      )
    ).toBe("RAID: Gleaming Depths (only Stage 3) & Bigfoot");

    // For Bounty Hunting: origin includes Burning Springs and Head Hunt & Grunt Hunt
    expect(
      normalizeDisplayNotes(
        "Burning Springs • Bounty Hunting: Head Hunt & Grunt Hunt",
        ["Burning Springs", "Head Hunt & Grunt Hunt"]
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
