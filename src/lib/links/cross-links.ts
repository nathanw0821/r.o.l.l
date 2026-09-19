/**
 * Links between the site's tools (WS5 "Hyperlinking" item 4): tracker row -> builder, builder mod
 * picker -> tracker, perk modal -> guides. Pure helpers so the hrefs and the builder's `?mod=`
 * handling can be unit tested.
 *
 *   /build?tab=gear&mod=<slug>  opens the legendary mod picker on the Gear tab, searched to that mod
 *                               (fresh load only; never on ?load=/?edit= shared builds)
 *   /all-effects?q=<name>       tracker search (existing deep link)
 *   /wiki?q=<name>              guides search (existing deep link)
 */

import type { ActivePick } from "@/lib/builder/active-pick";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import { filterModsForSlot } from "@/lib/builder/compatibility";
import type { BuilderModDTO } from "@/lib/builder/types";

/** SPECIAL effects exist at 2 and 3 stars under one name; their catalog slug carries the star. */
const SPECIAL_EFFECT_SLUGS: ReadonlySet<string> = new Set([
  "strength",
  "perception",
  "endurance",
  "charisma",
  "intelligence",
  "agility",
  "luck"
]);

/** Catalog-style slug of a mod name: "Pounder's" -> "pounders", "V.A.T.S. Optimized" -> "vats-optimized". */
export function slugifyModName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[’‘']/g, "")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builder catalog slug for a tracker row (name + star), matching `deriveSeedSlug` in the seeds. */
export function builderModSlug(name: string, star?: number | null): string {
  const base = slugifyModName(name);
  return SPECIAL_EFFECT_SLUGS.has(base) && star ? `${base}-${star}` : base;
}

/** Star rank from a tracker tier label ("3 Star", "3★"); null when there is none. */
export function starFromTierLabel(label: string | null | undefined): number | null {
  const digit = label?.match(/[1-5]/)?.[0];
  return digit ? Number(digit) : null;
}

export function builderModHref(name: string, star?: number | null): string {
  return `/build?tab=gear&mod=${encodeURIComponent(builderModSlug(name, star))}`;
}

export function trackerSearchHref(name: string): string {
  return `/all-effects?q=${encodeURIComponent(name)}`;
}

export function guidesSearchHref(name: string): string {
  return `/wiki?q=${encodeURIComponent(name)}`;
}

/**
 * The catalog mod a `?mod=` value names: exact slug first, then the same name slug
 * (a bare "strength" picks the lowest star). Undefined for anything else.
 */
export function resolveModParam(mods: readonly BuilderModDTO[], param: string | null | undefined): BuilderModDTO | undefined {
  const wanted = (param ?? "").trim().toLowerCase();
  if (!wanted || !/^[a-z0-9-]{1,80}$/.test(wanted)) return undefined;
  const exact = mods.find((m) => m.slug.toLowerCase() === wanted);
  if (exact) return exact;
  return mods
    .filter((m) => slugifyModName(m.name) === wanted)
    .sort((a, b) => a.starRank - b.starRank)[0];
}

/**
 * Which picker slot a deep-linked mod opens: the active weapon's star slot if the mod fits it,
 * otherwise the armor chassis (chest, or the Power Armor torso since the helmet has no stars).
 * Null when it fits neither, in which case the builder only shows the Gear tab.
 */
export function modDeepLinkPick(
  mod: BuilderModDTO,
  weapon: BaseGearPiece,
  chassis: BaseGearPiece,
  options: { ghoul?: boolean } = {}
): ActivePick {
  const starIndex = mod.starRank - 1;
  if (starIndex < 0 || starIndex > 3) return null;
  if (filterModsForSlot([mod], weapon, starIndex, options).length > 0) return { scope: "single", starIndex };
  if (filterModsForSlot([mod], chassis, starIndex, options).length > 0) {
    return { scope: "armorSet", pieceIndex: chassis.kind === "powerArmor" ? 1 : 0, starIndex };
  }
  return null;
}
