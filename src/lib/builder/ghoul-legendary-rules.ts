/**
 * Sandbox rules for Ghoul builds in the loadout builder.
 * FO76: Ghouls do not use hunger/thirst the same way — some legendaries have no real benefit.
 */

/** Hidden from the star picker when Ghoul is on (no meaningful benefit in-game for this sandbox). */
export const GHOUL_BLOCKED_LEGENDARY_SLUGS = new Set(["overeaters"]);

/**
 * Still selectable, but sorted last and labeled — low health / low-health SPECIAL lines are awkward
 * on radiation-heavy Ghoul play even if the game still allows the mod.
 */
export const GHOUL_DISCOURAGED_LEGENDARY_SLUGS = new Set(["bloodied", "unyielding"]);

export function isGhoulBlockedLegendarySlug(slug: string): boolean {
  return GHOUL_BLOCKED_LEGENDARY_SLUGS.has(slug);
}

export function isGhoulDiscouragedLegendarySlug(slug: string): boolean {
  return GHOUL_DISCOURAGED_LEGENDARY_SLUGS.has(slug);
}
