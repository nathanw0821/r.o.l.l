import { SpecialCategory } from "@/lib/perks/catalog";
import { toHighResImageUrl } from "@/lib/utils/clean-formatting";

// Official Fallout 76 Vault Boy Perk Art CDN Mapping (High-Resolution Wikia / Bethesda Assets)
export const SPECIAL_VAULT_BOY_ARTWORK: Record<SpecialCategory, string> = {
  S: "/images/perks/vaultboy_s.svg",
  P: "/images/perks/vaultboy_p.svg",
  E: "/images/perks/vaultboy_e.svg",
  C: "/images/perks/vaultboy_c.svg",
  I: "/images/perks/vaultboy_i.svg",
  A: "/images/perks/vaultboy_a.svg",
  L: "/images/perks/vaultboy_l.svg",
  LEGENDARY: "/images/perks/vaultboy_legendary.svg",
};

// Specific High-Res Vault Boy Perk Card Artworks for Top FO76 Cards
export const SPECIFIC_PERK_CARD_ARTWORK: Record<string, string> = {
  "bloody-mess": "https://static.wikia.nocookie.net/fallout/images/f/f3/Bloody_Mess_FO76_perk.png",
  "starched-genes": "https://static.wikia.nocookie.net/fallout/images/a/a3/Starched_Genes_perk.png",
  "class-freak": "https://static.wikia.nocookie.net/fallout/images/5/54/Class_Freak_perk.png",
  "nerd-rage": "https://static.wikia.nocookie.net/fallout/images/9/91/Nerd_Rage%21_FO76_perk.png",
  "adrenaline": "https://static.wikia.nocookie.net/fallout/images/8/87/Adrenaline_perk.png",
  "tenderizer": "https://static.wikia.nocookie.net/fallout/images/d/d4/Tenderizer_perk.png",
  "strange-in-numbers": "https://static.wikia.nocookie.net/fallout/images/e/e8/Strange_in_Numbers_perk.png",
  "fireproof": "https://static.wikia.nocookie.net/fallout/images/3/36/Fireproof_perk.png",
  "action-boy": "https://static.wikia.nocookie.net/fallout/images/7/75/Action_Boy_FO76_perk.png",
  "gunsmith": "https://static.wikia.nocookie.net/fallout/images/c/c5/Gunsmith_perk.png",
  "concentrated-fire": "https://static.wikia.nocookie.net/fallout/images/1/1a/Concentrated_Fire_FO76_perk.png",
  "heavy-gunner": "https://static.wikia.nocookie.net/fallout/images/b/b5/Heavy_Gunner_perk.png",
  "commando": "https://static.wikia.nocookie.net/fallout/images/8/8e/Commando_FO76_perk.png",
  "rifleman": "https://static.wikia.nocookie.net/fallout/images/b/b3/Rifleman_FO76_perk.png",
  "iron-fist": "https://static.wikia.nocookie.net/fallout/images/2/2a/Iron_Fist_FO76_perk.png",
};

import exactArtMap from "./exact-268-art-map.json";
import wikiArtMap from "./wiki-268-art-map.json";

export function getPerkCardArtworkUrl(cardId: string, special: SpecialCategory, isFemale = false): string {
  if (!cardId) return SPECIAL_VAULT_BOY_ARTWORK[special] || SPECIAL_VAULT_BOY_ARTWORK.S;
  
  let raw = cardId.toLowerCase().trim();

  // Female Vault Girl Card Variant Swapping
  if (isFemale) {
    if (raw === "action-boy" || raw === "action boy") raw = "action-girl";
    else if (raw === "party-boy" || raw === "party boy") raw = "party-girl";
    else if (raw === "lady-killer" || raw === "lady killer") raw = "black-widow";
  }

  const kebab = raw.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const clean = raw.replace(/[^a-z0-9]/g, "");

  // 1. Primary Check: 1:1 In-Game Texture Map
  const wikiLookup = (wikiArtMap as Record<string, string>)[kebab] || (wikiArtMap as Record<string, string>)[raw] || (wikiArtMap as Record<string, string>)[clean];
  if (wikiLookup) {
    return wikiLookup;
  }

  const exactLookup = (exactArtMap as Record<string, string>)[kebab] || (exactArtMap as Record<string, string>)[raw] || (exactArtMap as Record<string, string>)[clean];
  if (exactLookup) {
    return exactLookup;
  }

  // 2. Official SVG Asset Fallback (Covers Legendary Perks & Datamined Vectors)
  if (clean) {
    return `/images/perks_official/${clean}.svg`;
  }

  return SPECIAL_VAULT_BOY_ARTWORK[special] || SPECIAL_VAULT_BOY_ARTWORK.S;
}
