/**
 * Typed loader for `src/data/truth/unique-items.json`: named unique weapons
 * (Patch 70 "The Slasher" innate-effect rework) and the eight Patch 66
 * Backwoods unique armor pieces with fixed legendary mods.
 *
 * `baseItemId` is the unique's own builder row when `base-gear.ts` has one
 * (e.g. `ticket-to-revenge`), otherwise the base chassis id it is built on
 * (e.g. `railway` for Lickety-Split), or `null` when no builder row matches.
 */

import rawUniqueItems from "@/data/truth/unique-items.json";

export type UniqueItemKind = "weapon" | "armor";

export type UniqueItem = {
  id: string;
  name: string;
  kind: UniqueItemKind;
  baseItemId: string | null;
  /** Exact innate-effect text from the release notes / wiki table. */
  innateEffect: string;
  sourceNotes: string;
  moddable: true;
  fourthStar: true;
  /** Patch that introduced the item in its current form (70 = weapon rework, 66 = Backwoods armor). */
  introducedIn: number;
  /** Armor only: body slot the unique occupies. */
  slot?: string;
  /** Armor only: fixed legendary mods the piece ships with. */
  legendaryMods?: string[];
};

export const UNIQUE_ITEMS: readonly UniqueItem[] = rawUniqueItems as UniqueItem[];

const BY_ID = new Map<string, UniqueItem>(UNIQUE_ITEMS.map((item) => [item.id, item]));

/** All unique items, optionally filtered by kind. */
export function getUniqueItems(kind?: UniqueItemKind): UniqueItem[] {
  return kind ? UNIQUE_ITEMS.filter((item) => item.kind === kind) : [...UNIQUE_ITEMS];
}

export function getUniqueItemById(id: string): UniqueItem | undefined {
  return BY_ID.get(id);
}

/**
 * First unique whose `baseItemId` matches the given builder/catalog id.
 * Several uniques can share a chassis (e.g. Camden Whacker and Molerat Bat on
 * `baseball-bat`); use `getUniqueItemsByBaseId` for all of them.
 */
export function getUniqueItemByBaseId(baseItemId: string): UniqueItem | undefined {
  return UNIQUE_ITEMS.find((item) => item.baseItemId === baseItemId);
}

export function getUniqueItemsByBaseId(baseItemId: string): UniqueItem[] {
  return UNIQUE_ITEMS.filter((item) => item.baseItemId === baseItemId);
}

/** True when the builder/catalog id has a unique row of its own (scrip ×10, Vault Steel on craft). */
export function isUniqueBaseItem(baseItemId: string): boolean {
  return UNIQUE_ITEMS.some((item) => item.id === baseItemId && item.baseItemId === baseItemId);
}
