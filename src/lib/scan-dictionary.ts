
/**
 * Dictionaries for S.C.A.N. to recognize broader game data.
 */

export const ARMOR_ABBREVIATIONS: Record<string, string> = {
  "SS": "Secret Service",
  "CE": "Civil Engineer",
  "BOS": "Brotherhood Recon",
  "BOS Recon": "Brotherhood Recon",
  "Brotherhood": "Brotherhood Recon",
  "FSA": "Forest Scout",
  "USA": "Urban Scout",
  "Covert": "Covert Scout",
  "Arctic": "Arctic Marine",
};

export const ARMOR_TYPE_MAP: Record<string, string> = {
  "Secret Service": "armor-set-secret-service",
  "Civil Engineer": "armor-set-civil-engineer",
  "Brotherhood Recon": "armor-set-bos-recon",
  "Covert Scout": "armor-set-covert-scout",
  "Urban Scout": "armor-set-urban-scout",
  "Forest Scout": "armor-set-forest-scout",
  "Marine": "armor-set-marine",
  "Arctic Marine": "armor-set-arctic-marine",
  "Heavy combat": "armor-set-heavy-combat",
  "Sturdy combat": "armor-set-sturdy-combat",
  "Light combat": "armor-set-light-combat",
  "Heavy raider": "armor-set-heavy-raider",
  "Sturdy raider": "armor-set-sturdy-raider",
  "Light raider": "armor-set-light-raider",
  "Botsmith": "armor-set-botsmith",
  "Trapper": "armor-set-trapper",
  "Thorn": "armor-set-thorn",
  "Solar": "armor-set-solar",
  "Wood": "armor-set-wood",
  "Heavy metal": "armor-set-heavy-metal",
  "Sturdy metal": "armor-set-sturdy-metal",
  "Light metal": "armor-set-light-metal",
  "Heavy leather": "armor-set-heavy-leather",
  "Sturdy leather": "armor-set-sturdy-leather",
  "Light leather": "armor-set-light-leather",
  "Heavy robot": "armor-set-heavy-robot",
  "Sturdy robot": "armor-set-sturdy-robot",
  "Light robot": "armor-set-light-robot",
};

export const SPECIAL_KEYWORDS = [
  "STRENGTH", "PERCEPTION", "ENDURANCE", "CHARISMA", "INTELLIGENCE", "AGILITY", "LUCK"
];

export const LEGENDARY_PERK_MAP: Record<string, string> = {
  "Legendary Strength": "legendary-strength",
  "Legendary Perception": "legendary-perception",
  "Legendary Endurance": "legendary-endurance",
  "Legendary Charisma": "legendary-charisma",
  "Legendary Intelligence": "legendary-intelligence",
  "Legendary Agility": "legendary-agility",
  "Legendary Luck": "legendary-luck",
  "Follow Through": "follow-through",
  "Taking One for the Team": "taking-one-for-the-team",
  "Far-Flung Fireworks": "far-flung-fireworks",
  "Funky Duds": "funky-duds",
  "Sizzling Style": "sizzling-style",
  "What Rads?": "what-rads",
  "Electric Absorption": "electric-absorption",
  "Power Armor Reboot": "power-armor-reboot",
  "Ammo Factory": "ammo-factory",
  "Master Infiltrator": "master-infiltrator",
  "Survival Shortcut": "survival-shortcut",
};


/**
 * Common abbreviations for armor pieces often seen in trades/builder screenshots.
 */
export function normalizeArmorName(text: string): string | null {
  const clean = text.trim().toUpperCase();
  
  // Check direct abbreviations
  if (ARMOR_ABBREVIATIONS[clean]) return ARMOR_ABBREVIATIONS[clean];
  
  // Check if it starts with an abbreviation
  for (const [abbr, full] of Object.entries(ARMOR_ABBREVIATIONS)) {
    if (clean.startsWith(abbr)) return full;
  }
  
  // Check fuzzy matches in the type map
  const lower = text.toLowerCase();
  for (const name of Object.keys(ARMOR_TYPE_MAP)) {
    if (lower.includes(name.toLowerCase())) return name;
  }
  
  return null;
}
