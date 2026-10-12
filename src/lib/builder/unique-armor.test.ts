import { describe, expect, it } from "vitest";
import { ARMOR_SET_ROWS, getArmorSetRow } from "@/lib/builder/armor-sets";
import { getArmorSetBonusTags } from "@/lib/builder/armor-set-bonuses";
import { getBaseGearPiece } from "@/lib/builder/base-gear";
import { calculateCombatFirepower } from "@/lib/builder/combat-firepower-engine";
import { aggregateEffectMath, listEquippedModsInBenchOrder } from "@/lib/builder/compatibility";
import { INITIAL_BUILDER_MODS } from "@/lib/builder/legendary-mod-catalog-seeds";
import {
  applyChassisSelection,
  applyRegularSnapshot,
  snapshotRegularLoadout,
} from "@/lib/builder/loadout-mode";
import { defaultPayload, normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import { calculateDamageTaken, calculateDefensiveProfile } from "@/lib/builder/perk-defensive-layer";
import { sharePayloadSchema } from "@/lib/builder/share-payload-schema";
import type { BuilderPayload } from "@/lib/builder/types";
import {
  UNIQUE_ARMOR_PIECES,
  activeRageStacks,
  applyUniqueArmorLocks,
  armorSlotLocks,
  effectiveArmorPieceSetKeys,
  rageDamageTakenPct,
  sanitizeUniqueArmorConditions,
  setUniqueArmorPiece,
  standFastDrBonus,
  stripFixedUniqueArmorStars,
  uniqueArmorEffectLayer,
  uniqueArmorPiecesForSlot,
} from "@/lib/builder/unique-armor";

const civil = getBaseGearPiece("armor-set-civil-engineer")!;
const settler = getBaseGearPiece("armor-set-secret-settler")!;
const t65 = getBaseGearPiece("t65-torso")!;

/** Regular-armor payload on the Civil Engineer set with a rolled 4th star on the chest. */
function civilPayload(): BuilderPayload {
  const base = applyChassisSelection(defaultPayload(), civil);
  const grid = base.armorLegendaryModIds.map((row) => [...row]);
  grid[0] = ["seed-unyielding", "seed-strength-2", "seed-sentinels", "seed-tankys"];
  grid[1] = ["seed-unyielding", null, null, null];
  return { ...base, armorLegendaryModIds: grid };
}

const seedBySlug = new Map(INITIAL_BUILDER_MODS.map((m) => [m.slug, m]));

describe("unique armor data", () => {
  it("offers the seven chests and Road Kill on the left arm", () => {
    expect(uniqueArmorPiecesForSlot("chest").map((p) => p.id).sort()).toEqual(
      ["bulwark", "last-bastion", "last-stand", "rage", "silver-lining", "stand-fast", "trail-warden"].sort(),
    );
    expect(uniqueArmorPiecesForSlot("leftArm").map((p) => p.id)).toEqual(["road-kill"]);
    expect(UNIQUE_ARMOR_PIECES).toHaveLength(8);
  });

  it("every fixed star is a catalog armor mod of that star rank with the pack's name", () => {
    for (const piece of UNIQUE_ARMOR_PIECES) {
      expect(getArmorSetRow(piece.baseSetKey), piece.id).toBeDefined();
      piece.legendaryModSlugs.forEach((slug, star) => {
        const mod = seedBySlug.get(slug);
        expect(mod, `${piece.id} ${slug}`).toBeDefined();
        expect(mod!.starRank, `${piece.id} ${slug}`).toBe(star + 1);
        expect(mod!.allowedOnArmor, `${piece.id} ${slug}`).toBe(true);
        expect(mod!.name, piece.id).toBe(piece.legendaryModNames[star]);
      });
    }
    const settlerRow = ARMOR_SET_ROWS.find((r) => r.key === "secret-settler")!;
    expect(settlerRow.unique!.legendaryModSlugs.map((slug) => [seedBySlug.get(slug)?.name, seedBySlug.get(slug)?.starRank])).toEqual([
      ["Bolstering", 1],
      ["Hardy", 2],
      ["Adamantium", 3],
      ["Sawbones's", 4],
    ]);
  });

  it("Stand Fast carries the client-data curve, not the old +50 at 150%", () => {
    const standFast = UNIQUE_ARMOR_PIECES.find((p) => p.id === "stand-fast")!;
    expect(standFast.model).toMatchObject({ kind: "dr-per-move-speed", value: 100, minSpeedPct: 100, maxSpeedPct: 200 });
    expect(standFast.innateEffect).not.toContain("150%");
    expect(standFastDrBonus(100)).toBe(0);
    expect(standFastDrBonus(150)).toBe(50);
    expect(standFastDrBonus(200)).toBe(100);
    expect(standFastDrBonus(260)).toBe(100);
    expect(standFastDrBonus(80)).toBe(0);
  });
});

describe("per-slot unique choice and locked stars", () => {
  it("wearing a unique chest writes its fixed stars and keeps the rolled 4th star and other slots", () => {
    const next = setUniqueArmorPiece(civilPayload(), "chest", "bulwark");
    expect(next.uniqueArmorPieceIds).toEqual({ chest: "bulwark" });
    expect(next.armorLegendaryModIds[0]).toEqual(["assassins", "elementalist", "adamantium", "seed-tankys"]);
    expect(next.armorLegendaryModIds[1]).toEqual(["seed-unyielding", null, null, null]);
    expect(armorSlotLocks(next).map((lock) => lock?.id ?? null)).toEqual(["bulwark", null, null, null, null]);
  });

  it("swapping or removing the unique releases its stars", () => {
    const bulwark = setUniqueArmorPiece(civilPayload(), "chest", "bulwark");
    const rage = setUniqueArmorPiece(bulwark, "chest", "rage");
    expect(rage.armorLegendaryModIds[0]).toEqual(["auto-stim", "pain-killer", "burning", "seed-tankys"]);
    const none = setUniqueArmorPiece(rage, "chest", null);
    expect(none.uniqueArmorPieceIds).toBeUndefined();
    expect(none.armorLegendaryModIds[0]).toEqual([null, null, null, "seed-tankys"]);
  });

  it("refuses a unique in the wrong slot", () => {
    expect(setUniqueArmorPiece(civilPayload(), "chest", "road-kill").uniqueArmorPieceIds).toBeUndefined();
    const arm = setUniqueArmorPiece(civilPayload(), "leftArm", "road-kill");
    expect(arm.armorLegendaryModIds[1]).toEqual(["overeaters", "glutton", "thru-hikers", null]);
  });

  it("re-asserts fixed stars after another edit and is a no-op when they hold", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "last-stand");
    expect(applyUniqueArmorLocks(worn)).toBe(worn);
    const cleared = { ...worn, armorLegendaryModIds: worn.armorLegendaryModIds.map(() => [null, null, null, null]) };
    expect(applyUniqueArmorLocks(cleared).armorLegendaryModIds[0]).toEqual(["zealots", "agility-2", "reflex", null]);
  });

  it("the Secret Settler set locks all five pieces at four stars and releases them on a set change", () => {
    const worn = applyChassisSelection(civilPayload(), settler);
    for (const row of worn.armorLegendaryModIds) {
      expect(row).toEqual(["bolstering", "hardy", "adamantium", "sawboness"]);
    }
    expect(getArmorSetBonusTags(worn.armorPieceSetKeys)).toEqual([
      "Secret Settler set: 25% of damage received is returned to the attacker",
    ]);
    const back = applyChassisSelection(worn, civil);
    for (const row of back.armorLegendaryModIds) expect(row).toEqual([null, null, null, null]);
  });

  it("power armor takes the unique off; the regular snapshot brings it back", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "bulwark");
    const snap = snapshotRegularLoadout(worn, civil.id);
    const pa = applyChassisSelection(worn, t65);
    expect(pa.uniqueArmorPieceIds).toBeUndefined();
    expect(armorSlotLocks(pa).every((lock) => lock === null)).toBe(true);
    const restored = applyRegularSnapshot(pa, snap);
    expect(restored.uniqueArmorPieceIds).toEqual({ chest: "bulwark" });
    expect(restored.armorLegendaryModIds[0]!.slice(0, 3)).toEqual(["assassins", "elementalist", "adamantium"]);
  });

  it("the shopping list sees only rolled stars", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "bulwark");
    const stripped = stripFixedUniqueArmorStars(worn);
    expect(stripped.armorLegendaryModIds[0]).toEqual([null, null, null, "seed-tankys"]);
    expect(stripped.armorLegendaryModIds[1]).toEqual(worn.armorLegendaryModIds[1]);
  });
});

describe("unique armor in the totals", () => {
  it("a unique slot uses its base set; without one the keys pass through unchanged", () => {
    const plain = civilPayload();
    expect(effectiveArmorPieceSetKeys(plain)).toBe(plain.armorPieceSetKeys);
    const worn = setUniqueArmorPiece(plain, "chest", "bulwark");
    expect(effectiveArmorPieceSetKeys(worn)).toEqual([
      "secret-service",
      "civil-engineer",
      "civil-engineer",
      "civil-engineer",
      "civil-engineer",
    ]);
  });

  it("fixed stars flow into the aggregate like rolled ones", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "silver-lining");
    const mods = listEquippedModsInBenchOrder(worn, INITIAL_BUILDER_MODS);
    expect(mods.map((m) => m.name)).toEqual(expect.arrayContaining(["Life Saving", "Endurance", "Belted"]));
    const totals = aggregateEffectMath(mods, { ghoul: false, extraLayers: [], baseSpecial: { end: 1 } });
    // Endurance 2★ (+2 END) from the fixed star; Unyielding is conditional (specialBonus).
    expect(totals.end).toBe(3);
  });

  it("Bulwark adds 35% of its own piece's resistances (one fifth of the Secret Service row)", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "bulwark");
    const ss = getArmorSetRow("secret-service")!.stats;
    const share = (v: number) => Math.round(Math.round(v / 5) * 0.35);
    expect(uniqueArmorEffectLayer(worn)).toEqual({
      dr: share(ss.dr),
      er: share(ss.er),
      fr: share(ss.fr),
      cr: share(ss.cr),
      pr: share(ss.pr),
      rr: share(ss.rr),
    });
  });

  it("Stand Fast adds DR from the movement-speed input", () => {
    const worn = setUniqueArmorPiece(civilPayload(), "chest", "stand-fast");
    expect(uniqueArmorEffectLayer(worn)).toBeNull();
    expect(uniqueArmorEffectLayer({ ...worn, uniqueArmorConditions: { movementSpeedPct: 175 } })).toEqual({ dr: 75 });
  });

  it("Rage stacks count only while Rage is worn, capped at 100", () => {
    const plain = { ...civilPayload(), uniqueArmorConditions: { rageStacks: 40 } };
    expect(activeRageStacks(plain)).toBe(0);
    const worn = setUniqueArmorPiece(plain, "chest", "rage");
    expect(activeRageStacks(worn)).toBe(40);
    expect(rageDamageTakenPct(worn)).toBe(40);
    expect(activeRageStacks({ ...worn, uniqueArmorConditions: { rageStacks: 500 } })).toBe(100);
  });

  it("Rage raises damage dealt in the firepower engine's additive pool", () => {
    const input = {
      weaponId: "fixer",
      equippedMods: [],
      equippedPerks: [],
      playerStats: { agility: 5, luck: 5, strength: 5 },
    };
    const without = calculateCombatFirepower(input);
    const with50 = calculateCombatFirepower({ ...input, playerStats: { ...input.playerStats, rageStacks: 50 } });
    expect(with50.damagePerShot.breakdown).toContainEqual({ source: "Rage (50 stacks)", value: "+50%" });
    expect(with50.damagePerShot.normal).toBeGreaterThan(without.damagePerShot.normal);
  });

  it("Last Stand turns Evade into damage reduction; Rage raises damage taken", () => {
    const profile = calculateDefensiveProfile([], {
      isPowerArmor: false,
      equippedModSlugs: ["reflex", "reflex"],
      uniqueArmorIds: ["last-stand"],
      damageTakenIncreases: [{ id: "rage", label: "Rage (20 stacks)", pct: 20 }],
    });
    expect(profile.evadeChance).toBe(0);
    expect(profile.reducers.find((r) => r.id === "last-stand")?.pct).toBeGreaterThan(0);
    expect(profile.damageTakenIncreasePct).toBe(20);
    const hit = calculateDamageTaken(100, 0, 0, [], "ballistic", 20);
    const plain = calculateDamageTaken(100, 0, 0, [], "ballistic");
    expect(hit.delivered).toBeCloseTo(plain.delivered * 1.2, 2);
  });
});

describe("saved and shared builds round-trip the unique armor fields", () => {
  const worn = (() => {
    const p = setUniqueArmorPiece(setUniqueArmorPiece(civilPayload(), "chest", "rage"), "leftArm", "road-kill");
    return {
      ...p,
      armorPieceSetKeys: ["civil-engineer", "civil-engineer", "botsmith", "civil-engineer", "civil-engineer"],
      uniqueArmorConditions: { rageStacks: 25, movementSpeedPct: 140 },
    };
  })();

  it("normalizeBuilderPayload keeps the per-slot ids, the inputs and the mixed-set keys", () => {
    const back = normalizeBuilderPayload(JSON.parse(JSON.stringify(worn)))!;
    expect(back.uniqueArmorPieceIds).toEqual({ chest: "rage", leftArm: "road-kill" });
    expect(back.uniqueArmorConditions).toEqual({ rageStacks: 25, movementSpeedPct: 140 });
    expect(back.armorPieceSetKeys).toEqual(worn.armorPieceSetKeys);
    expect(back.armorLegendaryModIds).toEqual(worn.armorLegendaryModIds);
  });

  it("drops unknown or misplaced ids, re-asserts fixed stars and clamps the inputs", () => {
    const tampered = {
      ...JSON.parse(JSON.stringify(worn)),
      uniqueArmorPieceIds: { chest: "road-kill", leftArm: "road-kill", rightLeg: "not-a-unique", helmet: "rage" },
      uniqueArmorConditions: { rageStacks: 900, movementSpeedPct: 20 },
      armorLegendaryModIds: worn.armorLegendaryModIds.map(() => ["seed-bolstering", null, null, null]),
    };
    const back = normalizeBuilderPayload(tampered)!;
    expect(back.uniqueArmorPieceIds).toEqual({ leftArm: "road-kill" });
    expect(back.armorLegendaryModIds[1]).toEqual(["overeaters", "glutton", "thru-hikers", null]);
    expect(back.armorLegendaryModIds[0]).toEqual(["seed-bolstering", null, null, null]);
    expect(back.uniqueArmorConditions).toEqual({ rageStacks: 100 });
    expect(sanitizeUniqueArmorConditions({ rageStacks: 0, movementSpeedPct: 100 })).toBeUndefined();
  });

  it("a power armor build carries no unique pieces", () => {
    const pa = normalizeBuilderPayload({
      ...JSON.parse(JSON.stringify(applyChassisSelection(defaultPayload(), t65))),
      uniqueArmorPieceIds: { chest: "bulwark" },
    })!;
    expect(pa.uniqueArmorPieceIds).toBeUndefined();
  });

  it("the publish schema keeps both fields, then normalisation restores the build", () => {
    const parsed = sharePayloadSchema.parse(JSON.parse(JSON.stringify(worn)));
    expect(parsed.uniqueArmorPieceIds).toEqual({ chest: "rage", leftArm: "road-kill" });
    expect(parsed.uniqueArmorConditions).toEqual({ rageStacks: 25, movementSpeedPct: 140 });
    const back = normalizeBuilderPayload(parsed)!;
    expect(back.uniqueArmorPieceIds).toEqual(worn.uniqueArmorPieceIds);
    expect(back.armorLegendaryModIds[0]!.slice(0, 3)).toEqual(["auto-stim", "pain-killer", "burning"]);
  });
});
