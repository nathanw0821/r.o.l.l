import { describe, expect, it } from "vitest";
import reloadTruth from "@/data/truth/weapon-reload.json";
import perkCards from "@/data/perk-cards.json";
import { WEAPON_ALIASES, WEAPON_COMBAT_BASE_CATALOG } from "@/lib/builder/combat-firepower-catalog";
import { UNIQUE_ITEMS } from "@/lib/truth/unique-items";
import {
  RELOAD_PERKS,
  WEAPON_RELOAD_TABLE,
  getWeaponReloadEntry,
  getWeaponReloadSeconds,
  sustainedDps,
} from "./weapon-reload";

const catalogIds = Object.keys(WEAPON_COMBAT_BASE_CATALOG);

describe("weapon-reload truth file", () => {
  it("has exactly one entry per catalog weapon id", () => {
    expect(Object.keys(WEAPON_RELOAD_TABLE).sort()).toEqual([...catalogIds].sort());
  });

  it("every entry is a sourced number or an explained null", () => {
    for (const id of catalogIds) {
      const entry = WEAPON_RELOAD_TABLE[id];
      expect(entry, id).toBeDefined();
      if (entry.reloadSeconds === null) {
        expect(entry.note, id).toMatch(/^(not published|melee|not fetched yet)$/);
        if (entry.note === "not published") expect(entry.source, id).toMatch(/^https:\/\/fallout\.wiki\/wiki\//);
      } else {
        expect(entry.reloadSeconds, id).toBeGreaterThan(0);
        expect(entry.source, id).toMatch(/^https:\/\/fallout\.wiki\/wiki\//);
        expect(entry.quote, id).toContain(`Reload ${String(entry.reloadSeconds)}`);
        expect(entry.confidence, id).toMatch(/^(verified|approximate)$/);
      }
    }
  });

  it("melee and unarmed weapons are null with note melee, ranged weapons never are", () => {
    for (const weapon of Object.values(WEAPON_COMBAT_BASE_CATALOG)) {
      const entry = WEAPON_RELOAD_TABLE[weapon.id];
      const isMelee = weapon.weaponClass === "melee" || weapon.weaponClass === "unarmed";
      expect(entry.note === "melee", weapon.id).toBe(isMelee);
    }
  });

  it("uniques and aliases inherit their chassis entry", () => {
    for (const [id, entry] of Object.entries(WEAPON_RELOAD_TABLE)) {
      if (!entry.inheritedFrom) continue;
      const chassis = WEAPON_RELOAD_TABLE[entry.inheritedFrom];
      expect(chassis, `${id} → ${entry.inheritedFrom}`).toBeDefined();
      expect(entry.reloadSeconds, id).toBe(chassis.reloadSeconds);
      expect(entry.source, id).toBe(chassis.source);
    }
    for (const [alias, target] of Object.entries(WEAPON_ALIASES)) {
      if (WEAPON_RELOAD_TABLE[alias].note === "melee") continue;
      expect(WEAPON_RELOAD_TABLE[alias].inheritedFrom, alias).toBe(target);
    }
    expect(getWeaponReloadSeconds("holy-fire")).toBe(getWeaponReloadSeconds("flamer"));
    expect(getWeaponReloadSeconds("the-action-hero")).toBe(getWeaponReloadSeconds("cal50"));
    expect(getWeaponReloadSeconds("doctors-orders")).toBe(getWeaponReloadSeconds("hunting-rifle"));
  });

  it("resolves aliases and non-catalog uniques through baseItemId", () => {
    expect(getWeaponReloadSeconds("the-fixer")).toBe(3.2);
    expect(getWeaponReloadSeconds("fixer")).toBe(3.2);
    expect(getWeaponReloadSeconds("50-cal-machine-gun")).toBe(5);
    const licketySplit = UNIQUE_ITEMS.find((item) => item.id === "lickety-split");
    expect(licketySplit?.baseItemId).toBe("railway");
    expect(getWeaponReloadSeconds("lickety-split")).toBe(getWeaponReloadSeconds("railway"));
    expect(getWeaponReloadEntry("lickety-split")?.source).toContain("Railway_Rifle");
    expect(getWeaponReloadSeconds("chainsaw")).toBeNull();
    expect(getWeaponReloadSeconds("no-such-weapon")).toBeNull();
    expect(getWeaponReloadEntry("no-such-weapon")).toBeNull();
  });

  it("golden fixture weapons have a fetched reload time", () => {
    for (const id of ["the-fixer", "hunting-rifle", "holy-fire", "red-terror", "cremator", "combat-shotgun", "western-revolver", "compound-bow"]) {
      expect(getWeaponReloadSeconds(id), id).toBeGreaterThan(0);
    }
    for (const id of ["chainsaw", "deathclaw-gauntlet"]) expect(getWeaponReloadSeconds(id), id).toBeNull();
  });
});

describe("RELOAD_PERKS match the Patch 70 card texts", () => {
  const cardById = new Map((perkCards as Array<{ id: string; ranks: Array<{ description: string }> }>).map((c) => [c.id, c]));

  it("records every reload card with source 'card text'", () => {
    expect(Object.keys(RELOAD_PERKS).sort()).toEqual(
      ["fast-fighter", "ground-pounder", "guerrilla-expert", "gun-tricks", "lock-and-load", "quick-hands", "wild-west-hands"],
    );
    for (const [id, perk] of Object.entries(RELOAD_PERKS)) {
      expect(perk.source, id).toBe("card text");
      expect(cardById.has(id), id).toBe(true);
    }
  });

  it("ranked percentages are the numbers printed on each rank", () => {
    const pctOf = (id: string, pattern: RegExp) =>
      cardById.get(id)!.ranks.map((rank) => Number(rank.description.match(pattern)![1]) / 100);
    expect(RELOAD_PERKS["gun-tricks"].byRank).toEqual(pctOf("gun-tricks", /reload weapons (\d+)% faster/));
    expect(RELOAD_PERKS["ground-pounder"].byRank).toEqual(pctOf("ground-pounder", /reload (\d+)% faster/));
    expect(RELOAD_PERKS["quick-hands"].byRank).toEqual(pctOf("quick-hands", /(\d+)% chance to instantly reload/));
    expect(RELOAD_PERKS["wild-west-hands"].byRank).toEqual(pctOf("wild-west-hands", /(\d+)% chance to instantly reload/));
    expect(RELOAD_PERKS["gun-tricks"].byRank).toEqual([0.1, 0.2, 0.3]);
    expect(RELOAD_PERKS["quick-hands"].byRank).toEqual([0.06, 0.12, 0.18]);
    expect(RELOAD_PERKS["wild-west-hands"].byRank).toEqual([0.12, 0.24, 0.36]);
    expect(RELOAD_PERKS["lock-and-load"]).toMatchObject({ perStack: 0.01, stackSource: "bullet-storm", keepsHalfStacksOnReload: true });
    expect(RELOAD_PERKS["guerrilla-expert"]).toMatchObject({ perStack: 0.01, stackSource: "onslaught", bonusMaxStacks: 3 });
    expect(RELOAD_PERKS["fast-fighter"]).toMatchObject({ fractionOfBonusMoveSpeed: 0.5 });
    expect(reloadTruth.perks["fast-fighter"].cardText).toBe(cardById.get("fast-fighter")!.ranks[0].description);
  });
});

describe("sustainedDps", () => {
  it("10-round pistol: 12 dmg, 3 rps, 3.33 s reload", () => {
    // fire time 10/3 = 3.333 s, cycle 6.667 s, 120 damage → 18.0 dps (burst 36)
    const dps = sustainedDps({ damagePerShot: 12, rps: 3, magazine: 10, reloadSeconds: 3.33 });
    expect(dps).toBeCloseTo(120 / (10 / 3 + 3.33), 6);
    expect(dps).toBeLessThan(36);
    // Gun Tricks 3 (30% faster) and Quick Hands 3 (18% instant) shorten the expected reload
    const perked = sustainedDps({ damagePerShot: 12, rps: 3, magazine: 10, reloadSeconds: 3.33, reloadSpeedPct: 0.3, instantReloadChance: 0.18 });
    expect(perked).toBeCloseTo(120 / (10 / 3 + (3.33 / 1.3) * 0.82), 6);
    expect(perked).toBeGreaterThan(dps);
  });

  it("500-round heavy gun: 20 dmg, 18.2 rps, 6.83 s reload barely dents burst dps", () => {
    const burst = 20 * 18.2;
    const dps = sustainedDps({ damagePerShot: 20, rps: 18.2, magazine: 500, reloadSeconds: 6.83 });
    expect(dps).toBeCloseTo((20 * 500) / (500 / 18.2 + 6.83), 6);
    expect(dps / burst).toBeGreaterThan(0.79);
    expect(dps / burst).toBeLessThan(0.81);
  });

  it("melee weapon (no reload) returns burst dps unchanged", () => {
    expect(sustainedDps({ damagePerShot: 90, rps: 1.2, magazine: 1, reloadSeconds: null })).toBe(108);
    expect(sustainedDps({ damagePerShot: 90, rps: 1.2, magazine: 1, reloadSeconds: 0 })).toBe(108);
  });

  it("clamps: a 100% instant-reload chance is burst dps, bad rps is 0", () => {
    expect(sustainedDps({ damagePerShot: 12, rps: 3, magazine: 10, reloadSeconds: 3.33, instantReloadChance: 1 })).toBeCloseTo(36, 9);
    expect(sustainedDps({ damagePerShot: 12, rps: 0, magazine: 10, reloadSeconds: 3.33 })).toBe(0);
  });
});
