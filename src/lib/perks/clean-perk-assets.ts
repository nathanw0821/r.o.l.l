// Official Bethesda 1:1 In-Game Extracted Assets & Theme Registry
import { SpecialCategory } from "./catalog";

export const OFFICIAL_SPECIAL_COLORS: Record<SpecialCategory, string> = {
  S: "#749B85", // Strength Muted Sage Green
  P: "#877B56", // Perception Muted Olive Brown
  E: "#4A8FA1", // Endurance Steel Blue
  C: "#C89053", // Charisma Warm Amber / Ochre Gold
  I: "#7E8B75", // Intelligence Muted Military Green
  A: "#C88F7F", // Agility Terracotta Coral
  L: "#928BA8", // Luck Soft Lavender Violet
  LEGENDARY: "#F59E0B", // Legendary Warm Amber Gold
};

export const OFFICIAL_SPECIAL_NAMES: Record<SpecialCategory, string> = {
  S: "STRENGTH",
  P: "PERCEPTION",
  E: "ENDURANCE",
  C: "CHARISMA",
  I: "INTELLIGENCE",
  A: "AGILITY",
  L: "LUCK",
  LEGENDARY: "LEGENDARY",
};

export const OFFICIAL_SPECIAL_PLAQUES: Record<Exclude<SpecialCategory, "LEGENDARY">, string> = {
  S: "/images/clean_perk_assets/plaques/strength_plaque.png",
  P: "/images/clean_perk_assets/plaques/perception_plaque.png",
  E: "/images/clean_perk_assets/plaques/endurance_plaque.png",
  C: "/images/clean_perk_assets/plaques/charisma_plaque.png",
  I: "/images/clean_perk_assets/plaques/intelligence_plaque.png",
  A: "/images/clean_perk_assets/plaques/agility_plaque.png",
  L: "/images/clean_perk_assets/plaques/luck_plaque.png",
};

export const CLEAN_FOREGROUND_ASSETS: Record<string, string> = {
  "action-boy": "/images/clean_perk_assets/foregrounds/action_boy.png",
  "action-girl": "/images/clean_perk_assets/foregrounds/action_boy.png",
  "ammo-factory": "/images/clean_perk_assets/foregrounds/ammo_factory.png",
  "batteries-included": "/images/clean_perk_assets/foregrounds/batteries_included.png",
  "bloody-mess": "/images/clean_perk_assets/foregrounds/bloody_mess.png",
  "concentrated-fire": "/images/clean_perk_assets/foregrounds/concentrated_fire.png",
  "heavy-gunner": "/images/clean_perk_assets/foregrounds/heavy_gunner.png",
  "ironclad": "/images/clean_perk_assets/foregrounds/ironclad.png",
  "lead-belly": "/images/clean_perk_assets/foregrounds/lead_belly.png",
  "lone-wanderer": "/images/clean_perk_assets/foregrounds/lone_wanderer.png",
  "nerd-rage": "/images/clean_perk_assets/foregrounds/nerd_rage.png",
};

export const CLEAN_TEXTURES = {
  cardGrunge: "/images/clean_perk_assets/textures/card_grunge.png",
  legendaryFrame: "/images/clean_perk_assets/legendary/legendary_frame_cropped.png",
  rankRibbon: "/images/clean_perk_assets/textures/rank_ribbon.png",
  starsRack: "/images/clean_perk_assets/textures/stars_rack.png",
};

export function getCleanPerkForeground(cardIdOrName?: string): string | null {
  if (!cardIdOrName) return null;
  const key = cardIdOrName.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
  return CLEAN_FOREGROUND_ASSETS[key] || null;
}

export function isCleanPerkAssetAvailable(cardIdOrName?: string): boolean {
  return getCleanPerkForeground(cardIdOrName) !== null;
}

export function getLegendaryRankStarSprite(rank: number): string {
  const safeRank = Math.min(4, Math.max(1, rank));
  return `/images/clean_perk_assets/legendary/lgn_stars_rank_${safeRank}.png`;
}

export function getGhoulPerkCardImage(cardIdOrName?: string, rank: number = 1): string | null {
  if (!cardIdOrName) return null;
  const key = cardIdOrName.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (key === "action-ghoul") {
    const safeRank = Math.min(3, Math.max(1, rank));
    return `/images/in_game_cards/action_ghoul_r${safeRank}.png`;
  }
  return null;
}

export const IN_GAME_STRAIGHT_CARDS: Record<string, string> = {
  // Standard & Reworked Perks (Official Bethesda Live Mechanics)
  "action-boy": "action_boy",
  "action-girl": "action_girl",
  "aquaboy": "aquaboy",
  "aquagirl": "aquagirl",
  "party-boy": "party_boy",
  "party-girl": "party_girl",
  "action-ghoul": "action_ghoul",
  "bullet-storm": "bullet_storm",
  "heavy-gunner": "bullet_storm",
  "tightly-wound": "tightly_wound",
  "expert-heavy-gunner": "tightly_wound",
  "bringing-the-big-guns": "bringing_the_big_guns",
  "master-heavy-gunner": "bringing_the_big_guns",
  "heavy-hitter": "heavy_hitter",
  "master-slugger": "heavy_hitter",
  "knee-capper": "knee_capper",
  "expert-slugger": "knee_capper",
  "slugger": "slugger",
  "concentrated-fire": "concentrated_fire",
  "lead-belly": "lead_belly",
  "lone-wanderer": "lone_wanderer",
  "batteries-included": "batteries_included",
  "bloody-mess": "bloody_mess",

  // Bidirectional Word-Order Aliases (Expert / Master prefix vs suffix)
  "expert-guerrilla": "guerrilla_expert",
  "guerrilla-expert": "guerrilla_expert",
  "master-guerrilla": "guerrilla_master",
  "guerrilla-master": "guerrilla_master",
  "expert-gunslinger": "gunslinger_expert",
  "gunslinger-expert": "gunslinger_expert",
  "master-gunslinger": "gunslinger_master",
  "gunslinger-master": "gunslinger_master",
  "expert-hacker": "hacker_expert",
  "hacker-expert": "hacker_expert",
  "master-hacker": "hacker_master",
  "hacker-master": "hacker_master",
  "expert-picklock": "picklock_expert",
  "picklock-expert": "picklock_expert",
  "master-picklock": "picklock_master",
  "picklock-master": "picklock_master",
  "grim-reaper-s-sprint": "grim_reaper_s_sprint",
  "grim-reapers-sprint": "grim_reaper_s_sprint",

  // 1:1 In-Game Bitmapped Legendary Cards
  "ammo-factory": "ammo_factory",
  "blood-sacrifice": "blood_sacrifice",
  "brawling-chemist": "brawling_chemist",
  "collateral-damage": "collateral_damage",
  "detonation-contagion": "detonation_contagion",
  "electric-absorption": "electric_absorption",
  "exploding-palm": "exploding_palm",
  "far-flung-fireworks": "far_flung_fireworks",
  "follow-through": "follow_through",
  "funky-duds": "funky_duds",
  "hack-and-slash": "hack_and_slash",
  "master-infiltrator": "master_infiltrator",
  "power-armor-reboot": "power_armor_reboot",
  "power-sprinter": "power_sprinter",
  "retribution": "retribution",
  "sizzling-style": "sizzling_style",
  "survival-shortcut": "survival_shortcut",
  "taking-one-for-the-team": "taking_one_for_the_team",
  "what-rads": "what_rads",
  "legendary-strength": "legendary_strength",
  "legendary-perception": "legendary_perception",
  "legendary-endurance": "legendary_endurance",
  "legendary-charisma": "legendary_charisma",
  "legendary-intelligence": "legendary_intelligence",
  "legendary-agility": "legendary_agility",
  "legendary-luck": "legendary_luck",
  "action-diet": "action_diet",
  "feral-rage": "feral_rage",
};

export function getInGamePerkCardImage(
  cardIdOrName?: string,
  rank: number = 1,
  isFemale?: boolean
): string | null {
  if (!cardIdOrName) return null;
  const key = cardIdOrName.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
  let baseName = IN_GAME_STRAIGHT_CARDS[key] || key.replace(/-/g, "_");

  // Dynamic gender swapping between Vault Boy and Vault Girl profiles
  if (isFemale === true) {
    if (key === "action-boy" || key === "action-girl" || key === "actionboy" || key === "actiongirl") {
      baseName = "action_girl";
    } else if (key === "aquaboy" || key === "aquagirl" || key === "aqua-boy" || key === "aqua-girl" || key === "aquaboy-aquagirl") {
      baseName = "aquagirl";
    } else if (key === "party-boy" || key === "party-girl" || key === "partyboy" || key === "partygirl") {
      baseName = "party_girl";
    }
  } else if (isFemale === false) {
    if (key === "action-boy" || key === "action-girl" || key === "actionboy" || key === "actiongirl") {
      baseName = "action_boy";
    } else if (key === "aquaboy" || key === "aquagirl" || key === "aqua-boy" || key === "aqua-girl" || key === "aquaboy-aquagirl") {
      baseName = "aquaboy";
    } else if (key === "party-boy" || key === "party-girl" || key === "partyboy" || key === "partygirl") {
      baseName = "party_boy";
    }
  }

  const safeRank = Math.max(1, rank);
  return `/images/in_game_cards/${baseName}_r${safeRank}.png`;
}

