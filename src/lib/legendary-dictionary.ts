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
    "Fracturer's", "Hauler's", "Icemen's", "Limit-Breaking", "Miasma's", "Pin-Pointer's", 
    "Polished", "Pounder's", "Propelling", "Pyromaniac's", "Radioactive-Powered", 
    "Raging", "Ranger's", "Reflective", "Rejuvenator's", "Runner's", "Satiated", "Sawbones's", 
    "Scanner's", "Stabilizer's", "Stalwart's", "Tanky's", "Tarnished", "Thrill-Seeker's", "Vector", "Viper's"
  ]
};

/**
 * Normalized map for fuzzy matching OCR strings.
 */
export const NORMALIZED_MOD_MAP: Record<string, string> = {};

/**
 * Multi-language translations for official Fallout 76 localizations.
 * Key: Canonical English Name, Value: Array of localized variants.
 * (Source: Nuka Knights & FO76 Localization Files)
 */
export const MOD_TRANSLATIONS: Record<string, string[]> = {
  "Anti-armor": ["Anti-Rüstung", "Anti-armure", "Antiarmadura", "Przeciwpancerny", "Antiamadura", "破甲"],
  "Bloodied": ["Blutig", "Sanglant", "Ensangrentado", "Zakrwawiony", "Ensanguentado", "血染"],
  "Aristocrat's": ["Des Aristokraten", "Aristocrate", "Aristócrata", "Arystokraty", "Aritocrata", "贵族"],
  "Assassin's": ["Des Meuchelmörders", "Assassin", "Asesino", "Zabójcy", "Assassino", "刺客"],
  "Berserker's": ["Des Berserkers", "Berserker", "Berserker", "Berserkera", "Berserker", "狂战士"],
  "Executioner's": ["Des Henkers", "Exécuteur", "Ejecutor", "Kata", "Executor", "处决者"],
  "Exterminator's": ["Des Exterminators", "Exterminateur", "Exterminador", "Eksterminatora", "Exterminador", "灭虫者"],
  "Furious": ["Rasend", "Furieux", "Furioso", "Wściekły", "Furioso", "狂怒"],
  "Ghoul Slayer's": ["Des Ghulkillers", "Tueur de goules", "Mataguerreros", "Zabójcy ghouli", "Exterminador de Ghoul", "食尸鬼克星"],
  "Gourmand's": ["Des Feinschmeckers", "Gourmand", "Glotón", "Gourmanda", "Gourmet", "贪食者"],
  "Hunter's": ["Des Jägers", "Chasseur", "Cazador", "Łowcy", "Caçador", "猎人"],
  "Instigating": ["Anstachelnd", "Instigateur", "Instigador", "Podżegający", "Instigador", "煽动"],
  "Juggernaut's": ["Des Juggernauts", "Mastodonte", "Juggernaut", "Juggernauta", "Juggernaut", "主宰者"],
  "Junkie's": ["Des Junkies", "Drogué", "Adicto", "Ćpuna", "Viciado", "瘾头"],
  "Mutant Slayer's": ["Des Mutantentöters", "Tueur de mutants", "Mata-mutantes", "Zabójcy mutantów", "Exterminador de Mutantes", "变种人克星"],
  "Mutant's": ["Des Mutanten", "Mutant", "Mutante", "Mutanta", "Mutante", "变种人"],
  "Nocturnal": ["Nächtlich", "Nocturne", "Nocturno", "Nocny", "Noturno", "夜间"],
  "Overeater's": ["Des Vielfraßes", "Goinfre", "Tragaldabas", "Żarłoka", "Comilão", "暴食者"],
  "Quad": ["Vierfach", "Quadruple", "Cuádruple", "Quádruplo", "四倍"],
  "Stalker's": ["Des Pürschers", "Traqueur", "Acechador", "Prześladowcy", "Perseguidor", "潜行者"],
  "Suppressor's": ["Des Unterdrückers", "Suppresseur", "Supresor", "Tłumika", "Supressor", "镇压者"],
  "Troubleshooter's": ["Des Problemlösers", "Dépanneur", "Eliminador", "Likwidatora", "Eliminador", "故障排除者"],
  "Two Shot": ["Doppelschuss", "Deux coups", "Dos tiros", "Podwójny strzał", "Dois Tiros", "双弹"],
  "Vampire's": ["Vampir", "Vampirique", "Vampírico", "Vampiryczny", "Vampírico", "吸血鬼"],
  "Zealot's": ["Des Zealoten", "Zélote", "Fanático", "Zeloty", "Fanático", "狂热者"],
  "Explosive": ["Explosiv", "Explosif", "Explosivo", "Wybuchowy", "Explosivo", "爆炸"],
  "Rapid": ["Schnell", "Rapide", "Rápido", "Szybki", "Rápido", "急速"],
  "Vital": ["Vital", "Vital", "Vital", "Witalny", "Vital", "活力"],
  "Steady": ["Standhaft", "Stable", "Firme", "Stabilny", "Firme", "稳固"],
  "Strength": ["Stärke", "Force", "Fuerza", "Siła", "Força", "力量"],
  "Luck": ["Glück", "Chance", "Suerte", "Szczęście", "Sorte", "运气"],
  "Intelligence": ["Intelligenz", "Intelligence", "Inteligencia", "Inteligencja", "Inteligência", "智力"],
  "Agility": ["Beweglichkeit", "Agilité", "Agilidad", "Zwinność", "Agilidade", "敏捷"],
  "Endurance": ["Ausdauer", "Endurance", "Resistencia", "Wytrzymałość", "Resistência", "耐力"],
  "Perception": ["Wahrnehmung", "Perception", "Percepción", "Percepcja", "Percepção", "感知"],
  "Charisma": ["Charisma", "Charisme", "Carisma", "Charyzma", "Carisma", "魅力"],
  "V.A.T.S. Enhanced": ["V.A.T.S.-verbessert", "V.A.T.S. amélioré", "V.A.T.S. mejorado", "V.A.T.S. wzmocniony", "V.A.T.S. Aprimorado", "强化V.A.T.S."],
  "V.A.T.S. Optimized": ["V.A.T.S.-optimiert", "V.A.T.S. optimisé", "V.A.T.S. optimizado", "V.A.T.S. zoptymalizowany", "V.A.T.S. Otimizado", "优化V.A.T.S."]
};

// Populate normalized map
Object.values(LEGENDARY_MOD_DICTIONARY).forEach((mods) => {
  mods.forEach(mod => {
    const canonical = mod;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Canonical English
    NORMALIZED_MOD_MAP[norm(canonical)] = canonical;
    
    // Add common plural/possessive aliases to handle OCR truncations
    if (canonical.endsWith("'s")) {
      const base = canonical.slice(0, -2);
      NORMALIZED_MOD_MAP[norm(base)] = canonical;
    }
    if (canonical === "Arms Keeper's") {
      NORMALIZED_MOD_MAP[norm("Arm's Keeper")] = canonical;
      NORMALIZED_MOD_MAP[norm("Arms Keeper")] = canonical;
    }
    
    // Localized Variants
    const translations = MOD_TRANSLATIONS[canonical] || [];
    translations.forEach(variant => {
      const vNorm = norm(variant);
      if (vNorm) {
        NORMALIZED_MOD_MAP[vNorm] = canonical;
      }
    });
  });
});

/**
 * Validates an OCR-recognized string against the dictionary.
 * Returns the canonical name if a match is found.
 */
export function validateLegendaryMod(ocrString: string): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalized = norm(ocrString);
  
  if (!normalized) return null;

  // Direct match in normalized map (handles English + translations)
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
