import { describe, expect, it } from "vitest";
import { sharePayloadSchema } from "./share-payload-schema";

const row = { materialModId: "none", miscModId: "none" };
const stars = [null, null, null, null];

/** The smallest v5 build the publish route accepts. */
const minimal = {
  version: 5 as const,
  basePieceId: "the-fixer",
  equipmentKind: "weapon" as const,
  weaponSub: "ranged" as const,
  legendaryModIds: stars,
  armorLegendaryModIds: [stars, stars, stars, stars, stars],
  armorPieceCrafting: [row, row, row, row, row],
  ghoul: false,
  underarmor: { shellId: "none", liningId: null, styleId: null }
};

describe("sharePayloadSchema", () => {
  it("keeps everything the builder round-trips, not just the gear", () => {
    const switchboardState = {
      healthPct: 100,
      activeFood: "plant-blight-soup",
      activeFoods: { crit_damage: "plant-blight-soup", int: "plant-brain-bombs" },
      activeDrug: "chem-psychotats",
      combatStance: { isSneaking: true, hitLocation: "weakSpot" }
    };
    const parsed = sharePayloadSchema.parse({
      ...minimal,
      activeWeaponPieceId: "the-fixer",
      weaponCrafting: { receiverId: "hardened", barrelId: "long" },
      equippedPerkCards: [
        { cardId: "commando", rank: 3 },
        { cardId: "tank-killer", rank: 1 }
      ],
      switchboardState,
      hasStrangeInNumbers: true
    });

    // Until 2026-10-11 every key below was stripped at publish time (zod drops unlisted keys).
    expect(parsed.switchboardState).toEqual(switchboardState);
    expect(parsed.equippedPerkCards).toEqual([
      { cardId: "commando", rank: 3 },
      { cardId: "tank-killer", rank: 1 }
    ]);
    expect(parsed.activeWeaponPieceId).toBe("the-fixer");
    expect(parsed.weaponCrafting).toEqual({ receiverId: "hardened", barrelId: "long" });
    expect(parsed.hasStrangeInNumbers).toBe(true);
  });

  it("still drops keys the builder never sends", () => {
    const parsed = sharePayloadSchema.parse({
      ...minimal,
      redirectUrl: "https://example.invalid",
      _editTokenHash: "forged"
    }) as Record<string, unknown>;
    expect(parsed).not.toHaveProperty("redirectUrl");
    expect(parsed).not.toHaveProperty("_editTokenHash");
  });

  it("rejects a malformed perk card or switchboard", () => {
    expect(
      sharePayloadSchema.safeParse({ ...minimal, equippedPerkCards: [{ cardId: "", rank: 3 }] }).success
    ).toBe(false);
    expect(
      sharePayloadSchema.safeParse({ ...minimal, equippedPerkCards: [{ cardId: "commando", rank: 1.5 }] }).success
    ).toBe(false);
    expect(sharePayloadSchema.safeParse({ ...minimal, switchboardState: ["not", "a", "board"] }).success).toBe(false);
  });

  it("fills the server-side defaults as before", () => {
    const parsed = sharePayloadSchema.parse(minimal);
    expect(parsed.powerArmorHelmetId).toBeNull();
    expect(parsed.powerArmorHelmetCrafting).toEqual(row);
    expect(parsed.mutationIds).toEqual([]);
    expect(parsed.ignoreMutationPenalties).toBe(false);
    expect(parsed.baseSpecial).toEqual({});
    expect(parsed.legendaryPerkIds).toEqual([]);
    expect(parsed.switchboardState).toBeUndefined();
  });
});
