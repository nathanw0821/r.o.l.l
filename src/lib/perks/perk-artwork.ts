import { SpecialCategory, getGenderedPerkName } from "@/lib/perks/catalog";
import exactArtMap from "./exact-268-art-map.json";

export { getGenderedPerkName };

// Canonical Perk Card Artwork Loader (Scaleform Vector SVG standard)
export function getPerkCardArtworkUrl(cardId: string, special: SpecialCategory, isFemale = false): string {
  return getPerkVectorArtUrl(cardId, special, isFemale);
}

// Official Datamined SVG Vector Asset Loader for Pip-Boy Card Frame
export function getPerkVectorArtUrl(cardId: string, special: SpecialCategory, isFemale = false): string {
  if (!cardId) {
    return `/images/perks_official/bloodymess.svg`;
  }

  const raw = cardId.toLowerCase().trim();

  if (isFemale) {
    if (raw === "action-boy" || raw === "action boy" || raw === "actionboy" || raw === "action-girl" || raw === "action girl" || raw === "actiongirl") return "/images/perks_official/actiongirl.svg";
    if (raw === "aquaboy" || raw === "aqua-boy" || raw === "aquaboy-aquagirl" || raw === "aquaticconcealment" || raw === "aquagirl" || raw === "aqua-girl") return "/images/perks_official/aquaticconcealmentgirl.svg";
    if (raw === "party-boy" || raw === "party boy" || raw === "partyboy" || raw === "party-girl" || raw === "party girl" || raw === "partygirl") return "/images/perks_official/partygirl.svg";
    if (raw === "lady-killer" || raw === "lady killer" || raw === "ladykiller" || raw === "black-widow" || raw === "black widow" || raw === "blackwidow") return "/images/perks_official/blackwidow.svg";
  } else {
    if (raw === "action-boy" || raw === "action boy" || raw === "actionboy" || raw === "action-girl" || raw === "action girl" || raw === "actiongirl") return "/images/perks_official/actionboy.svg";
    if (raw === "aquaboy" || raw === "aqua-boy" || raw === "aquaboy-aquagirl" || raw === "aquaticconcealment" || raw === "aquagirl" || raw === "aqua-girl") return "/images/perks_official/aquaticconcealment.svg";
    if (raw === "party-boy" || raw === "party boy" || raw === "partyboy" || raw === "party-girl" || raw === "party girl" || raw === "partygirl") return "/images/perks_official/partyboy.svg";
    if (raw === "lady-killer" || raw === "lady killer" || raw === "ladykiller" || raw === "black-widow" || raw === "black widow" || raw === "blackwidow") return "/images/perks_official/ladykiller.svg";
  }

  const kebab = raw.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const clean = raw.replace(/[^a-z0-9]/g, "");

  const exactMap = exactArtMap as Record<string, string>;
  const svgLookup = exactMap[raw] || exactMap[kebab] || exactMap[clean];

  if (svgLookup && svgLookup.endsWith(".svg")) {
    return svgLookup;
  }

  return `/images/perks_official/${clean}.svg`;
}
