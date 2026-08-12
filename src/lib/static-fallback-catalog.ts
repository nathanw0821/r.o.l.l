// Static Fallback Catalog for Legendary Effects & Wiki Records
// Ensures 100% reliable rendering even if the database is unseeded or unready.

export interface StaticEffectRow {
  id: string;
  effectName: string;
  tierLabel: string;
  categories: string;
  description: string;
  extraComponent: string;
  legendaryModules: number;
  notes: string;
  origins: string[];
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  unlockedBy: string[];
  selectionSource: "default" | "imported" | "edited";
  effect: { name: string };
  tier: { label: string };
  categoriesRel: { category: { name: string } }[];
}

export const FALLBACK_LEGENDARY_EFFECTS: StaticEffectRow[] = [
  // 1 STAR WEAPONS / ARMOR
  {
    id: "fb-1star-bloodied",
    effectName: "Bloodied",
    tierLabel: "1 Star",
    categories: "Weapon: Ranged • Weapon: Melee",
    description: "Deals up to +95% damage as health decreases (max scaling below 20% HP).",
    extraComponent: "Adrenaline Reaction Serum (1x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Bloodied legendary weapons. Requires 15 Legendary Modules.",
    origins: ["Scrapping Bloodied Weapons", "Purveyor Murmrgh"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Bloodied" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }, { category: { name: "Weapon: Melee" } }]
  },
  {
    id: "fb-1star-anti-armor",
    effectName: "Anti-armor",
    tierLabel: "1 Star",
    categories: "Weapon: Ranged • Weapon: Melee",
    description: "Ignores 50% of the target's armor.",
    extraComponent: "Black Titanium (10x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Anti-armor legendary weapons.",
    origins: ["Scrapping Anti-armor Weapons", "Events"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Anti-armor" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }, { category: { name: "Weapon: Melee" } }]
  },
  {
    id: "fb-1star-quad",
    effectName: "Quad",
    tierLabel: "1 Star",
    categories: "Weapon: Ranged",
    description: "Quadruples base ammo capacity.",
    extraComponent: "Fusion Core (2x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Quad legendary weapons.",
    origins: ["Scrapping Quad Weapons"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Quad" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }]
  },
  {
    id: "fb-1star-vampire",
    effectName: "Vampire's",
    tierLabel: "1 Star",
    categories: "Weapon: Ranged • Weapon: Melee",
    description: "Restores health on hit (2% HP per projectile/hit).",
    extraComponent: "Stimpak (10x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Vampire's weapons.",
    origins: ["Scrapping Vampire's Weapons"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Vampire's" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }, { category: { name: "Weapon: Melee" } }]
  },
  {
    id: "fb-1star-unyielding",
    effectName: "Unyielding",
    tierLabel: "1 Star",
    categories: "Armor",
    description: "Grants up to +3 to all S.P.E.C.I.A.L. stats (except END) when at low health.",
    extraComponent: "X-Cell (1x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Unyielding armor pieces.",
    origins: ["Scrapping Unyielding Armor"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Unyielding" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Armor" } }]
  },
  {
    id: "fb-1star-overeaters",
    effectName: "Overeater's",
    tierLabel: "1 Star",
    categories: "Armor • Power Armor",
    description: "Increases damage reduction up to +6% as hunger and thirst meters fill.",
    extraComponent: "Perfect Bubblegum (1x)",
    legendaryModules: 15,
    notes: "Crafting unlocked by scrapping Overeater's armor or power armor.",
    origins: ["Scrapping Overeater's Armor"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Overeater's" },
    tier: { label: "1 Star" },
    categoriesRel: [{ category: { name: "Armor" } }, { category: { name: "Power Armor" } }]
  },

  // 2 STAR WEAPONS / ARMOR
  {
    id: "fb-2star-explosive",
    effectName: "Explosive",
    tierLabel: "2 Star",
    categories: "Weapon: Ranged",
    description: "Bullets explode for 20% area-of-effect damage.",
    extraComponent: "Bobblehead: Explosive (1x)",
    legendaryModules: 30,
    notes: "Crafting unlocked by scrapping Explosive ranged weapons.",
    origins: ["Scrapping Explosive Weapons"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Explosive" },
    tier: { label: "2 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }]
  },
  {
    id: "fb-2star-vital",
    effectName: "Vital (50% Crit)",
    tierLabel: "2 Star",
    categories: "Weapon: Ranged • Weapon: Melee",
    description: "+50% V.A.T.S. Critical Hit Damage.",
    extraComponent: "Nuka-Cola Quantum (5x)",
    legendaryModules: 30,
    notes: "Crafting unlocked by scrapping 50% Crit Damage weapons.",
    origins: ["Scrapping Vital Weapons"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Vital" },
    tier: { label: "2 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }]
  },
  {
    id: "fb-2star-powered",
    effectName: "Powered (AP Refresh)",
    tierLabel: "2 Star",
    categories: "Armor • Power Armor",
    description: "Increases Action Point refresh speed (+5 AP/sec per piece).",
    extraComponent: "Canned Coffee (5x)",
    legendaryModules: 30,
    notes: "Crafting unlocked by scrapping Powered armor pieces.",
    origins: ["Scrapping Powered Armor"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Powered" },
    tier: { label: "2 Star" },
    categoriesRel: [{ category: { name: "Armor" } }]
  },

  // 3 STAR WEAPONS / ARMOR
  {
    id: "fb-3star-swift",
    effectName: "Swift (15% Reload)",
    tierLabel: "3 Star",
    categories: "Weapon: Ranged",
    description: "15% faster reload speed.",
    extraComponent: "Speed Demon Serum (1x)",
    legendaryModules: 60,
    notes: "Crafting unlocked by scrapping 15% Faster Reload weapons.",
    origins: ["Scrapping Swift Weapons"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Swift" },
    tier: { label: "3 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }]
  },
  {
    id: "fb-3star-arms-keeper",
    effectName: "Arms Keeper's (WWR)",
    tierLabel: "3 Star",
    categories: "Armor • Power Armor",
    description: "Weapon weights reduced by 20%.",
    extraComponent: "Small Guns Bobblehead (1x)",
    legendaryModules: 60,
    notes: "Crafting unlocked by scrapping Weapon Weight Reduction armor.",
    origins: ["Scrapping Arms Keeper Armor"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Arms Keeper's" },
    tier: { label: "3 Star" },
    categoriesRel: [{ category: { name: "Armor" } }]
  },
  {
    id: "fb-3star-sentinel",
    effectName: "Sentinel's",
    tierLabel: "3 Star",
    categories: "Armor • Power Armor",
    description: "75% chance to reduce damage by 15% while standing still.",
    extraComponent: "Scaly Skin Serum (1x)",
    legendaryModules: 60,
    notes: "Crafting unlocked by scrapping Sentinel's armor pieces.",
    origins: ["Scrapping Sentinel's Armor"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Sentinel's" },
    tier: { label: "3 Star" },
    categoriesRel: [{ category: { name: "Armor" } }]
  },

  // 4 STAR ENDGAME MODS
  {
    id: "fb-4star-aegis",
    effectName: "Aegis",
    tierLabel: "4 Star",
    categories: "Armor • Power Armor",
    description: "Grants 200 Energy & Radiation Resistance when below 30% HP.",
    extraComponent: "Vault Steel Bulk (80x)",
    legendaryModules: 120,
    notes: "Datamined Infestation event reward.",
    origins: ["Infestation Events", "Vault-Tec Raids"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Aegis" },
    tier: { label: "4 Star" },
    categoriesRel: [{ category: { name: "Armor" } }]
  },
  {
    id: "fb-4star-pinpointing",
    effectName: "Pinpointing",
    tierLabel: "4 Star",
    categories: "Weapon: Ranged",
    description: "+35% Weakspot Damage and +20 V.A.T.S. Accuracy on consecutive hits.",
    extraComponent: "Vault Steel Bulk (80x)",
    legendaryModules: 120,
    notes: "Datamined Infestation event reward.",
    origins: ["Infestation Events", "Vault-Tec Raids"],
    unlocked: false,
    isSeeking: false,
    modCount: 0,
    unlockedBy: [],
    selectionSource: "default",
    effect: { name: "Pinpointing" },
    tier: { label: "4 Star" },
    categoriesRel: [{ category: { name: "Weapon: Ranged" } }]
  }
];

export const FALLBACK_WIKI_ARTICLES = [
  {
    id: "art-legendary-crafting-matrix",
    source: "Overseer Log #1",
    title: "Fallout 76 Legendary Mod Crafting & Scrapping Matrix",
    url: "/all-effects",
    content: "Complete guide to scrapping 1-Star, 2-Star, 3-Star, and 4-Star legendary weapons and armor to unlock permanent crafting plans, legendary modules, and scrip requirements.",
    main_image: "/favicon-v3.png",
    category: "Weapons & Legendary Mods",
    updatedAt: "2026-08-12T00:00:00Z",
    snippet: "Complete guide to scrapping 1-Star, 2-Star, 3-Star, and 4-Star legendary weapons and armor to unlock permanent crafting plans..."
  },
  {
    id: "art-backwoods-2026-patch",
    source: "Overseer Log #2",
    title: "Backwoods 2026 Update & Legendary Balance Changes",
    url: "/pts",
    content: "Full datamined Patch 70 changes including 4-Star legendary Infestation mods, Ghoul Race mechanics, auto-axe crafting updates, and Union Power armor stamp costs.",
    main_image: "/favicon-v3.png",
    category: "Build Mechanics & Damage",
    updatedAt: "2026-08-12T00:00:00Z",
    snippet: "Full datamined Patch 70 changes including 4-Star legendary Infestation mods, Ghoul Race mechanics, auto-axe crafting updates..."
  },
  {
    id: "art-minerva-gold-bullion-schedule",
    source: "Overseer Log #3",
    title: "Minerva Gold Bullion Sales Schedule & Location Matrix",
    url: "/wiki",
    content: "Track Minerva's Big Sale rotated inventory across Crater, Foundation, Fort Atlas, and Whitespring Refuge with exact Gold Bullion costs.",
    main_image: "/favicon-v3.png",
    category: "Vendors & Minerva Sales",
    updatedAt: "2026-08-12T00:00:00Z",
    snippet: "Track Minerva's Big Sale rotated inventory across Crater, Foundation, Fort Atlas, and Whitespring Refuge..."
  }
];
