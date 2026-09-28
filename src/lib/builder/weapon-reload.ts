/**
 * Typed loader for `src/data/truth/weapon-reload.json`: the base reload time of every
 * weapon in `WEAPON_COMBAT_BASE_CATALOG` (fallout.wiki infobox "Technical → Reload",
 * quoted verbatim in the truth file), the Patch 70 reload perk numbers, and the pure
 * sustained-DPS helper that turns burst DPS into damage over a magazine + reload cycle.
 *
 * Data only: the firepower engine and the switchboard are not wired to this yet
 * (ROLL_BUILDER_UNIFICATION_PLAN_2026-09-28 §2 item 6).
 */

import reloadTruth from "@/data/truth/weapon-reload.json";
import { WEAPON_ALIASES } from "@/lib/builder/combat-firepower-catalog";
import { UNIQUE_ITEMS } from "@/lib/truth/unique-items";

export type ReloadConfidence = "verified" | "approximate";

export type WeaponReloadEntry = {
  label: string;
  /** Base reload in seconds, or `null` when nothing is published / the weapon is melee. */
  reloadSeconds: number | null;
  /** fallout.wiki page the figure was read from (absent for melee and unfetched rows). */
  source?: string;
  /** The infobox Technical row as the page prints it. */
  quote?: string;
  confidence?: ReloadConfidence;
  /** Why `reloadSeconds` is null. */
  note?: "not published" | "melee" | "not fetched yet";
  /** Free-text caveat (odd printed values, chassis/mod caveats). */
  detail?: string;
  /** Chassis id whose entry this unique or alias copies. */
  inheritedFrom?: string;
};

export type ReloadPerkModel =
  | "reload-speed-pct"
  | "instant-reload-chance"
  | "reload-speed-pct-per-stack"
  | "reload-speed-pct-from-move-speed";

export type ReloadPerkEntry = {
  model: ReloadPerkModel;
  /** Fraction per rank for the ranked cards (0.10 = "10% faster"). */
  byRank?: number[];
  /** Fraction per stack for Lock and Load / Guerrilla Expert. */
  perStack?: number;
  stackSource?: "bullet-storm" | "onslaught";
  bonusMaxStacks?: number;
  keepsHalfStacksOnReload?: boolean;
  /** Fast Fighter: share of bonus movement speed granted as reload speed. */
  fractionOfBonusMoveSpeed?: number;
  condition?: string;
  cardText: string;
  confidence: ReloadConfidence;
  source: "card text";
};

const WEAPONS = reloadTruth.weapons as Record<string, WeaponReloadEntry>;

/** Every reload entry keyed by builder weapon id (uniques and aliases included). */
export const WEAPON_RELOAD_TABLE: Readonly<Record<string, WeaponReloadEntry>> = WEAPONS;

/** Reload perks exactly as the Patch 70 card texts state them. */
export const RELOAD_PERKS = reloadTruth.perks as Record<string, ReloadPerkEntry>;

const UNIQUE_BASE_BY_ID: ReadonlyMap<string, string> = new Map(
  UNIQUE_ITEMS.filter((item) => item.kind === "weapon" && item.baseItemId && item.baseItemId !== item.id).map(
    (item) => [item.id, item.baseItemId as string],
  ),
);

/**
 * Resolve a builder weapon id to its reload entry: aliases (`the-fixer` → `fixer`),
 * uniques that are not catalog rows (`lickety-split` → `railway` via `baseItemId`),
 * then `inheritedFrom` chains inside the truth file.
 */
export function getWeaponReloadEntry(weaponId: string): WeaponReloadEntry | null {
  const seen = new Set<string>();
  let id: string | undefined = weaponId;
  while (id && !seen.has(id)) {
    seen.add(id);
    const entry: WeaponReloadEntry | undefined = WEAPONS[id];
    if (entry) {
      if (entry.reloadSeconds === null && entry.inheritedFrom && !seen.has(entry.inheritedFrom)) {
        id = entry.inheritedFrom;
        continue;
      }
      return entry;
    }
    id = WEAPON_ALIASES[id] ?? UNIQUE_BASE_BY_ID.get(id);
  }
  return null;
}

/** Base reload in seconds, or `null` when unknown or the weapon has no reload (melee). */
export function getWeaponReloadSeconds(weaponId: string): number | null {
  return getWeaponReloadEntry(weaponId)?.reloadSeconds ?? null;
}

export type SustainedDpsInput = {
  /** Delivered damage of one shot (after the engine's multipliers and mitigation). */
  damagePerShot: number;
  /** Rounds per second while firing (the catalog `fireRate`). */
  rps: number;
  /** Rounds per magazine; `1` for single-shot weapons. */
  magazine: number;
  /** Base reload time; `null` or `0` means no reload cycle (melee, unknown) and burst DPS is returned. */
  reloadSeconds: number | null;
  /** Summed "reload X% faster" fraction (0.3 = Gun Tricks 3); applied as `reload / (1 + pct)`. */
  reloadSpeedPct?: number;
  /** Chance (0–1) that an empty-magazine reload is instant (Quick Hands / Wild West Hands). */
  instantReloadChance?: number;
};

/**
 * Damage per second over one full magazine-plus-reload cycle.
 *
 *   burstDps    = damagePerShot × rps
 *   fireTime    = magazine / rps
 *   reload      = reloadSeconds / (1 + reloadSpeedPct)
 *   expReload   = reload × (1 − instantReloadChance)
 *   sustained   = damagePerShot × magazine / (fireTime + expReload)
 *
 * "X% faster" is modelled as a speed multiplier (time ÷ (1 + X)), the reading of the
 * card text that keeps 100% faster at half the time rather than zero. The instant-reload
 * chance is treated as an expected-value reduction of the reload time: a p chance of a
 * free reload makes the average reload (1 − p) × reload, which is exact over many
 * cycles but says nothing about any single one. With no reload (melee, `null`, `0`)
 * or a non-positive magazine, the function returns burst DPS unchanged. Non-finite or
 * non-positive rps yields 0.
 */
export function sustainedDps(input: SustainedDpsInput): number {
  const { damagePerShot, rps, magazine, reloadSeconds } = input;
  if (!Number.isFinite(rps) || rps <= 0 || !Number.isFinite(damagePerShot)) return 0;
  const burst = damagePerShot * rps;
  if (!reloadSeconds || reloadSeconds <= 0 || !Number.isFinite(magazine) || magazine <= 0) return burst;
  const speedPct = Math.max(0, input.reloadSpeedPct ?? 0);
  const instant = Math.min(1, Math.max(0, input.instantReloadChance ?? 0));
  const reload = (reloadSeconds / (1 + speedPct)) * (1 - instant);
  const fireTime = magazine / rps;
  return (damagePerShot * magazine) / (fireTime + reload);
}
