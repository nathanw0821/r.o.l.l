/**
 * Sandbox rules for Ghoul builds in the loadout builder.
 *
 * Playable ghouls replace hunger/thirst with the Feral meter, ignore hunger/thirst-based buffs, and
 * interact differently with radiation (immunity to rad damage; healing / Glow instead). See:
 * https://fallout.fandom.com/wiki/Fallout_76_playable_ghoul
 */

/**
 * Hidden from the star picker when Ghoul is on — no meaningful benefit vs human hunger/thirst math
 * (Overeater’s / Gourmand’s), or bench rows that only model hunger/thirst decay.
 */
export const GHOUL_BLOCKED_LEGENDARY_SLUGS = new Set([
  "overeaters",
  "gourmands",
  "nutrition",
  "hydration"
]);

/**
 * Still selectable, but sorted last and labeled — low-health / Unyielding lines are a poor match for
 * rad-healing Ghoul play even though the game may still allow the gear.
 */
export const GHOUL_DISCOURAGED_LEGENDARY_SLUGS = new Set(["bloodied", "unyielding"]);

export function isGhoulBlockedLegendarySlug(slug: string): boolean {
  return GHOUL_BLOCKED_LEGENDARY_SLUGS.has(slug);
}

export function isGhoulDiscouragedLegendarySlug(slug: string): boolean {
  return GHOUL_DISCOURAGED_LEGENDARY_SLUGS.has(slug);
}
