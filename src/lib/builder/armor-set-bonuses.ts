/**
 * Full-set bonuses printed on the armor item card in game (5 matching pieces).
 * Verified 2026-09-18 (item card text). Add sets here as they are confirmed.
 */
export type ArmorSetBonus = { setKey: string; label: string; effects: string[] };

export const ARMOR_SET_BONUSES: ArmorSetBonus[] = [
  {
    setKey: "civil-engineer",
    label: "Civil Engineer set",
    effects: ["Weapons break 35% slower", "10% chance to deal 150 fire damage to melee attackers"],
  },
];

/** Tags for the Biometrics tab when every worn piece belongs to the same set with a known bonus. */
export function getArmorSetBonusTags(armorPieceSetKeys: ReadonlyArray<string | null | undefined> | null | undefined): string[] {
  if (!armorPieceSetKeys || armorPieceSetKeys.length < 5) return [];
  const keys = armorPieceSetKeys.filter((k): k is string => typeof k === "string" && k.length > 0);
  if (keys.length < 5) return [];
  const first = keys[0];
  if (!keys.every((k) => k === first)) return [];
  const bonus = ARMOR_SET_BONUSES.find((b) => b.setKey === first);
  return bonus ? bonus.effects.map((e) => `${bonus.label}: ${e}`) : [];
}
