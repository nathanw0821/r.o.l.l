import { describe, it, expect } from "vitest";
import { WEAPON_BASE_PIECES, getGroupedWeaponCategories } from "./base-gear";
import { ARMOR_SET_ROWS, getArmorSetMaxLevel } from "./armor-sets";
import { POWER_ARMOR_TORSO_PIECES } from "./base-gear";
import { getPowerArmorMaxLevel } from "./power-armor-frame-data";

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

  it("verifies getArmorSetMaxLevel strictly returns 45 or 50 for all canonical armor sets", () => {
    for (const row of ARMOR_SET_ROWS) {
      const maxLvl = getArmorSetMaxLevel(row.key);
      expect([50, 45]).toContain(maxLvl);
    }
    expect(getArmorSetMaxLevel("marine")).toBe(45);
    expect(getArmorSetMaxLevel("arctic-marine")).toBe(45);
    expect(getArmorSetMaxLevel("trapper")).toBe(45);
    expect(getArmorSetMaxLevel("heavy-raider")).toBe(45);
    expect(getArmorSetMaxLevel("wood")).toBe(45);
    expect(getArmorSetMaxLevel("secret-service")).toBe(50);
    expect(getArmorSetMaxLevel("civil-engineer")).toBe(50);
    expect(getArmorSetMaxLevel("bos-recon")).toBe(50);
  });

  it("verifies getPowerArmorMaxLevel strictly returns 45 or 50 for all power armor frames", () => {
    for (const piece of POWER_ARMOR_TORSO_PIECES) {
      const maxLvl = getPowerArmorMaxLevel(piece.id);
      expect([50, 45]).toContain(maxLvl);
    }
    expect(getPowerArmorMaxLevel("raider-pa-torso")).toBe(45);
    expect(getPowerArmorMaxLevel("excavator-torso")).toBe(45);
    expect(getPowerArmorMaxLevel("t45-torso")).toBe(45);
    expect(getPowerArmorMaxLevel("t51-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("t60-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("t65-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("x01-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("ultracite-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("strangler-heart-chest")).toBe(50);
    expect(getPowerArmorMaxLevel("hellcat-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("union-pa-torso")).toBe(50);
    expect(getPowerArmorMaxLevel("vulcan-torso")).toBe(50);
  });
});
