import { describe, expect, it } from "vitest";
import { perkPickerCards, perkPickerMatchesQuery } from "@/components/perks/perk-picker-dialog";
import { getPerkCardById } from "./catalog";

describe("scoped perk picker search", () => {
  it("matches the S.P.E.C.I.A.L. a Legendary S.P.E.C.I.A.L. card raises", () => {
    const luck = getPerkCardById("legendary-luck");
    const agility = getPerkCardById("legendary-agility");
    expect(luck && perkPickerMatchesQuery(luck, "luck")).toBe(true);
    expect(agility && perkPickerMatchesQuery(agility, "luck")).toBe(false);
    const hits = perkPickerCards("LEGENDARY").filter((c) => perkPickerMatchesQuery(c, "luck"));
    expect(hits.map((c) => c.id)).toContain("legendary-luck");
  });

  it("still matches names and rank-1 effect text, and an empty query matches all", () => {
    const blocker = getPerkCardById("blocker");
    expect(blocker && perkPickerMatchesQuery(blocker, "block")).toBe(true);
    expect(blocker && perkPickerMatchesQuery(blocker, "  ")).toBe(true);
    expect(blocker && perkPickerMatchesQuery(blocker, "strength")).toBe(true);
    expect(blocker && perkPickerMatchesQuery(blocker, "zzzz")).toBe(false);
  });
});
