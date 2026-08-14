import { SpecialCategory } from "@/lib/perks/catalog";
import wikiArtMap from "./wiki-268-art-map.json";

// 100% 1:1 Official In-Game WebP Artwork Loader for all 268 Perk Cards
export function getPerkCardArtworkUrl(cardId: string, special: SpecialCategory, isFemale = false): string {
  if (!cardId) {
    return `/images/perks_official_wiki/fo76-perk-bloody-mess.webp`;
  }
  
  let raw = cardId.toLowerCase().trim();

  // Female Vault Girl Card Variant Swapping
  if (isFemale) {
    if (raw === "action-boy" || raw === "action boy" || raw === "actionboy") raw = "action-girl";
    else if (raw === "party-boy" || raw === "party boy" || raw === "partyboy") raw = "party-girl";
    else if (raw === "lady-killer" || raw === "lady killer" || raw === "ladykiller") raw = "black-widow";
    else if (raw === "aquaboy" || raw === "aqua-boy" || raw === "aquaboy-aquagirl" || raw === "aquaticconcealment") raw = "aquagirl";
  }

  const kebab = raw.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const clean = raw.replace(/[^a-z0-9]/g, "");

  // 1. Direct WebP texture lookup from 268-card WebP map
  const map = wikiArtMap as Record<string, string>;
  const webpLookup = map[raw] || map[kebab] || map[clean] || map[kebab.replace("-s-", "s-")];

  if (webpLookup) {
    return webpLookup;
  }

  // 2. Direct WebP path construction fallback
  return `/images/perks_official_wiki/fo76-perk-${kebab}.webp`;
}
