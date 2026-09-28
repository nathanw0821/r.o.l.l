import { describe, expect, it } from "vitest";
import truth from "@/data/truth/weapon-stats-wiki.json";
import { WEAPON_COMBAT_BASE_CATALOG } from "@/lib/builder/combat-firepower-catalog";

/**
 * `src/data/truth/weapon-stats-wiki.json` records, per catalog row that carried a
 * `secondaryDamage`, whether fallout.wiki prints a second damage line. The catalog may only
 * carry a secondary for rows whose verdict is `split-verified`; a dropped or unverified
 * secondary must stay off until the truth file says otherwise.
 */
type Entry = (typeof truth.weapons)[keyof typeof truth.weapons];
const entries = truth.weapons as Record<string, Entry>;
const WIKI = /^https:\/\/fallout\.wiki\/wiki\//;

describe("weapon-stats-wiki truth file", () => {
  it("every entry names a catalog row, a fallout.wiki page and a fetch date", () => {
    expect(Object.keys(entries).length).toBeGreaterThan(0);
    for (const [id, entry] of Object.entries(entries)) {
      expect(WEAPON_COMBAT_BASE_CATALOG[id], id).toBeDefined();
      expect(entry.source, id).toMatch(WIKI);
      expect(entry.fetchedAt, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.verdict, id).toMatch(/^(split-verified|official-p70|secondary-mod-only|unverified)$/);
      expect(entry.note.length, id).toBeGreaterThan(0);
    }
  });

  it("every catalog row with a secondary has a split-verified or official-p70 entry, and only those keep one", () => {
    for (const weapon of Object.values(WEAPON_COMBAT_BASE_CATALOG)) {
      const hasSecondary = (weapon.secondaryDamage ?? 0) > 0;
      const entry = entries[weapon.id];
      if (hasSecondary) {
        expect(entry, `${weapon.id} carries secondaryDamage without a wiki check`).toBeDefined();
        expect(entry.verdict, weapon.id).toMatch(/^(split-verified|official-p70)$/);
        expect(entry.secondaryKept, weapon.id).toBe(true);
        if (entry.verdict === "split-verified") expect(entry.components.length, weapon.id).toBeGreaterThanOrEqual(2);
        else expect((entry as { officialSource?: { patch: number } }).officialSource?.patch, weapon.id).toBe(70);
        expect(weapon.secondaryDamageType, weapon.id).toBeDefined();
      } else if (entry) {
        expect(entry.secondaryKept, weapon.id).toBe(false);
        expect(entry.verdict, weapon.id).not.toBe("split-verified");
        expect(weapon.secondaryDamageType, weapon.id).toBeUndefined();
      }
    }
  });

  it("the recorded catalog values are the catalog's (a value change must update the record)", () => {
    for (const [id, entry] of Object.entries(entries)) {
      const weapon = WEAPON_COMBAT_BASE_CATALOG[id];
      expect(weapon.baseDamage, id).toBe(entry.catalog.baseDamage);
      expect(weapon.damageType, id).toBe(entry.catalog.damageType);
      if (entry.secondaryKept) {
        expect(weapon.secondaryDamage, id).toBe(entry.catalog.secondaryDamage);
        expect(weapon.secondaryDamageType, id).toBe(entry.catalog.secondaryDamageType);
      }
    }
  });

  it("split-verified entries print two damage lines; the plasma family is one of them", () => {
    for (const [id, entry] of Object.entries(entries)) {
      if (entry.verdict !== "split-verified") continue;
      const types = new Set(entry.components.map((c) => c.type));
      expect(types.size, id).toBeGreaterThanOrEqual(2);
      expect(entry.printed, id).toMatch(/Damage .*;.*Damage/);
    }
    for (const id of ["plasma-gun", "plasma-caster", "gatling-plasma", "enclave-plasma", "enclave-plasma-rifle", "plasma-flamer"]) {
      expect(entries[id].verdict, id).toBe("split-verified");
      expect(WEAPON_COMBAT_BASE_CATALOG[id].secondaryDamageType, id).toBe("energy");
    }
    // The Plasma Gun row equals the printed level-45 halves: baseDamage is one component, not a total.
    expect(entries["plasma-gun"].components).toEqual([
      { value: 42, type: "physical" },
      { value: 42, type: "energy" },
    ]);
    expect(WEAPON_COMBAT_BASE_CATALOG["plasma-gun"].baseDamage).toBe(42);
    expect(WEAPON_COMBAT_BASE_CATALOG["plasma-gun"].secondaryDamage).toBe(42);
  });

  it("the two mod-only secondaries are off; the two Patch 70 reworked uniques keep theirs from the official notes", () => {
    for (const id of ["the-kabloom", "v63-shock-baton"]) {
      expect(entries[id].verdict, id).toBe("official-p70");
      expect(WEAPON_COMBAT_BASE_CATALOG[id].secondaryDamage, id).toBeGreaterThan(0);
    }
    expect(truth.rule.noOlderSources).toMatch(/never|only to a source at least as new/i);
    for (const id of ["gauss-minigun", "gamma-gun"]) {
      expect(entries[id].secondaryKept, id).toBe(false);
      expect(WEAPON_COMBAT_BASE_CATALOG[id].secondaryDamage, id).toBeUndefined();
      expect(WEAPON_COMBAT_BASE_CATALOG[id].secondaryDamageType, id).toBeUndefined();
    }
  });

  it("inherited entries copy their chassis page and components", () => {
    for (const [id, entry] of Object.entries(entries)) {
      if (!("inheritedFrom" in entry) || !entry.inheritedFrom) continue;
      const chassis = entries[entry.inheritedFrom];
      expect(chassis, `${id} → ${entry.inheritedFrom}`).toBeDefined();
      expect(entry.source, id).toBe(chassis.source);
      expect(entry.components, id).toEqual(chassis.components);
    }
  });
});
