import { describe, it, expect } from "vitest";
import { WEAPON_BASE_PIECES, getGroupedWeaponCategories } from "./base-gear";

describe("getGroupedWeaponCategories", () => {
  it("includes every weapon from WEAPON_BASE_PIECES exactly once", () => {
    const categories = getGroupedWeaponCategories();
    const allGroupedIds = categories.flatMap((c) => c.options.map((o) => o.id));

    const weaponBaseIds = WEAPON_BASE_PIECES.map((w) => w.id);
    expect(allGroupedIds.length).toBe(weaponBaseIds.length);

    // No duplicates
    const uniqueIds = new Set(allGroupedIds);
    expect(uniqueIds.size).toBe(allGroupedIds.length);

    // Every weapon is present
    for (const id of weaponBaseIds) {
      expect(uniqueIds.has(id)).toBe(true);
    }
  });

  it("correctly marks shared chassis variants", () => {
    const categories = getGroupedWeaponCategories();
    const heavyCat = categories.find((c) => c.categoryKey === "heavy");
    expect(heavyCat).toBeDefined();

    const flamerBase = heavyCat?.options.find((o) => o.id === "flamer");
    const holyFire = heavyCat?.options.find((o) => o.id === "holy-fire");

    expect(flamerBase).toBeDefined();
    expect(flamerBase?.isVariant).toBe(false);
    expect(flamerBase?.parentChassisId).toBe("flamer");

    expect(holyFire).toBeDefined();
    expect(holyFire?.isVariant).toBe(true);
    expect(holyFire?.parentChassisId).toBe("flamer");
  });

  it("maintains alphanumeric ordering for chassis entries in each category", () => {
    const categories = getGroupedWeaponCategories();
    for (const cat of categories) {
      const parentChassisLabels = cat.options
        .filter((o) => !o.isVariant)
        .map((o) => (o.parentChassisLabel || o.label).toLowerCase());
      
      const sortedLabels = [...parentChassisLabels].sort((a, b) => a.localeCompare(b));
      expect(parentChassisLabels).toEqual(sortedLabels);
    }
  });
});
