/**
 * The Biometrics switchboard stores consumables by their catalog ids (`chem-psychotats`,
 * `bobble-small-guns`, `mag-gb3`, `brew-ballistic-bock`), while the firepower engine matches the
 * short names its tests and golden fixtures use (`psychotats`, `small-guns`, `guns-and-bullets-3`,
 * `ballistic-bock`). Until 2026-09-28 nothing translated between the two, so the chem, bobblehead,
 * magazine and alcohol damage bonuses never applied to a live build. The engine now normalises
 * its `activeBuffs` through this map; both spellings are accepted.
 */
const EXACT: Record<string, string> = {
  "mag-gb3": "guns-and-bullets-3",
  "mag-ts7": "tesla-science-7",
  "mag-ts8": "tesla-science-8",
  "bobble-energy": "energy-weapons",
};

const PREFIXES = ["chem-", "bobble-", "brew-", "mag-", "food-", "meat-", "plant-", "nuka-"];

export function normalizeBuffId(id: string | null | undefined): string | null {
  if (!id) return null;
  const trimmed = id.trim().toLowerCase();
  if (EXACT[trimmed]) return EXACT[trimmed];
  for (const prefix of PREFIXES) {
    if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
  }
  return trimmed;
}

export type NormalizedActiveBuffs = {
  activeDrug?: string | null;
  activeFood?: string | null;
  activeFoods?: string[];
  activeBobblehead?: string | null;
  activeMagazine?: string | null;
  activeAlcohol?: string | null;
  activeMutations?: string[];
};

export function normalizeActiveBuffs<T extends NormalizedActiveBuffs>(buffs: T | undefined): T | undefined {
  if (!buffs) return buffs;
  return {
    ...buffs,
    activeDrug: normalizeBuffId(buffs.activeDrug),
    activeFood: normalizeBuffId(buffs.activeFood),
    activeFoods: buffs.activeFoods?.map((f) => normalizeBuffId(f)).filter((f): f is string => Boolean(f)),
    activeBobblehead: normalizeBuffId(buffs.activeBobblehead),
    activeMagazine: normalizeBuffId(buffs.activeMagazine),
    activeAlcohol: normalizeBuffId(buffs.activeAlcohol),
  };
}
