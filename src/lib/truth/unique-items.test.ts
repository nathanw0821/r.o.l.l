import { describe, expect, it } from "vitest";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { WEAPON_ALIASES, WEAPON_COMBAT_BASE_CATALOG } from "@/lib/builder/combat-firepower-catalog";
import { UNIQUE_ITEMS, getUniqueItemByBaseId, getUniqueItems, getUniqueItemsByBaseId } from "./unique-items";

describe("unique-items truth pack", () => {
  // The Patch 70 weapon list supplied for this dataset has 83 rows (the release
  // notes headline says 85; two names could not be sourced and were not invented).
  it("has 83 weapons and 8 armor pieces", () => {
    expect(getUniqueItems("weapon")).toHaveLength(83);
    expect(getUniqueItems("armor")).toHaveLength(8);
    expect(UNIQUE_ITEMS).toHaveLength(91);
  });

  it("has unique kebab-case ids and non-empty effects", () => {
    const ids = UNIQUE_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of UNIQUE_ITEMS) {
      expect(item.id, item.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(item.name.trim().length, item.id).toBeGreaterThan(0);
      expect(item.innateEffect.trim().length, item.id).toBeGreaterThan(0);
      expect(item.sourceNotes.trim().length, item.id).toBeGreaterThan(0);
      expect(item.moddable).toBe(true);
      expect(item.fourthStar).toBe(true);
    }
  });

  it("stamps introducedIn 70 on weapons and 66 on armor", () => {
    for (const item of UNIQUE_ITEMS) {
      expect(item.introducedIn, item.id).toBe(item.kind === "weapon" ? 70 : 66);
    }
    for (const armor of getUniqueItems("armor")) {
      expect(armor.legendaryMods, armor.id).toHaveLength(3);
      expect(armor.slot, armor.id).toBeTruthy();
    }
  });

  it("marks the thirteen Patch 70 Daily Ops rare rewards", () => {
    const dailyOps = UNIQUE_ITEMS.filter((item) => item.sourceNotes === "Daily Ops rare reward (Patch 70)");
    expect(dailyOps.map((item) => item.name).sort()).toEqual(
      [
        "Acceptable Overkill", "Commander's Charge", "Crushing Blow", "Kingfisher", "Mind Over Matter", "Night Light",
        "Old Guard", "Resolute Veteran", "Salt of the Earth", "The Action Hero", "The Farmhand", "The Guarantee", "The Quick Fix",
      ].sort()
    );
  });

  it("every non-null baseItemId exists in base-gear or the firepower catalog", () => {
    const known = new Set<string>([
      ...BASE_GEAR_PIECES.map((piece) => piece.id),
      ...Object.keys(WEAPON_COMBAT_BASE_CATALOG),
      ...Object.keys(WEAPON_ALIASES),
    ]);
    for (const item of UNIQUE_ITEMS) {
      if (item.baseItemId === null) continue;
      expect(known.has(item.baseItemId), `${item.id} -> ${item.baseItemId}`).toBe(true);
    }
  });

  it("looks items up by base id", () => {
    expect(getUniqueItemByBaseId("ticket-to-revenge")?.name).toBe("Ticket to Revenge");
    expect(getUniqueItemByBaseId("railway")?.name).toBe("Lickety-Split");
    expect(getUniqueItemsByBaseId("baseball-bat").map((item) => item.name).sort()).toEqual(["Camden Whacker", "Molerat Bat"]);
    expect(getUniqueItemByBaseId("armor-set-secret-service")?.name).toBe("Bulwark");
    expect(getUniqueItemByBaseId("no-such-item")).toBeUndefined();
  });
});
