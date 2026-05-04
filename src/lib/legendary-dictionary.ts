/**
 * Master dictionary of Fallout 76 Legendary Mods.
 * Used for OCR validation and data mapping.
 */
export const LEGENDARY_MOD_DICTIONARY = {
  "1_STAR": [
    "Adrenal", "Anti-armor", "Aristocrat's", "Assassin's", "Auto Stim", "Berserker's", 
    "Bloodied", "Bolstering", "Chameleon", "Cloaking", "Executioner's", "Exterminator's", 
    "Feral's", "Furious", "Ghoul Slayer's", "Gourmand's", "Hunter's", "Instigating", 
    "Juggernaut's", "Junkie's", "Life Saving", "Lucid", "Medic's", "Mutant Slayer's", 
    "Mutant's", "Nocturnal", "Overeater's", "Quad", "Regenerating", "Sniper's", 
    "Stalker's", "Suppressor's", "Troubleshooter's", "Two Shot", "Unyielding", 
    "Vampire's", "Vanguard's", "Heavyweight", "Zealot's"
  ],
  "2_STAR": [
    "Agility", "Antiseptic", "Basher's", "Charisma", "Crippling", "Elementalist", 
    "Endurance", "Explosive", "Fierce", "Fireproof", "Glutton", "Hardy", "HazMat", 
    "Heavy Hitter's", "Hitman's", "Inertial", "Intelligence", "Last Shot", "Luck", 
    "Pain Killer", "Perception", "Pick Pocketer's", "Poisoner's", "Powered", 
    "Rapid", "Riposting", "Rushing", "Steady", "Strength", "V.A.T.S. Enhanced", 
    "Vital", "Warming"
  ],
  "3_STAR": [
    "Acrobat's", "Active", "Adamantium", "Agility", "Arms Keeper's", "Barbarian", 
    "Belted", "Blocker", "Burning", "Cavalier's", "Charisma", "Defender's", 
    "Dissipating", "Diver's", "Doctor's", "Durability", "Electrified", "Endurance", 
    "Frozen", "Ghost's", "Glowing", "Healthy", "Intelligence", "Lightweight", 
    "Luck", "Lucky", "Nimble", "Pack Rat's", "Perception", "Reflex", "Resilient", 
    "Safecracker's", "Secret Agent's", "Sentinel's", "Steadfast", "Strength", 
    "Swift", "Thru-hiker's", "Toxic", "V.A.T.S. Optimized"
  ],
  "4_STAR": [
    "Aegis", "Battle-Loader's", "Bruiser's", "Bully's", "Charged", "Choo-Choo's", 
    "Combo-Breaker's", "Conductor's", "Electrician's", "Encircler's", "Fencer's", 
    "Fracturer's", "Icemen's", "Limit-Breaking", "Miasma's", "Pin-Pointer's", 
    "Polished", "Pounder's", "Propelling", "Pyromaniac's", "Radioactive-Powered", 
    "Ranger's", "Reflective", "Rejuvenator's", "Runner's", "Sawbones's", 
    "Scanner's", "Stabilizer's", "Stalwart's", "Tanky's", "Thrill-Seeker's", "Viper's"
  ]
};

/**
 * Normalized map for fuzzy matching OCR strings.
 */
export const NORMALIZED_MOD_MAP: Record<string, string> = {};

// Populate normalized map
Object.entries(LEGENDARY_MOD_DICTIONARY).forEach(([tier, mods]) => {
  mods.forEach(mod => {
    NORMALIZED_MOD_MAP[mod.toLowerCase().replace(/[^a-z0-9]/g, '')] = mod;
  });
});

/**
 * Validates an OCR-recognized string against the dictionary.
 * Returns the canonical name if a match is found.
 */
export function validateLegendaryMod(ocrString: string): string | null {
  const normalized = ocrString.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Direct match
  if (NORMALIZED_MOD_MAP[normalized]) {
    return NORMALIZED_MOD_MAP[normalized];
  }

  // Fallback: Check if any dictionary entry is contained within the OCR string
  for (const [key, canonical] of Object.entries(NORMALIZED_MOD_MAP)) {
    if (normalized.includes(key) && key.length > 3) {
      return canonical;
    }
  }

  return null;
}
