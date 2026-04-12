/** Bust with `revalidateTag` when the active legendary catalog (effect tiers) changes. */
export const ROLL_CATALOG_CACHE_TAG = "roll-catalog";

/** Guest-only progress summary cache (totals). */
export const GUEST_PROGRESS_SUMMARY_TAG = "guest-progress-summary";

/** Curated builder mod list (`LegendaryMod` full table — bust after catalog seed/migrations). */
export const BUILDER_MODS_CACHE_TAG = "builder-mods-catalog";

export function sharedBuildTagForSlug(slug: string) {
  return `shared-build:${slug}`;
}
