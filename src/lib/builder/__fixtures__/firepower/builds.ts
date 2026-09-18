import type { CombatFirepowerCalculationInput } from "../../combat-firepower-engine";

/**
 * Representative builds for the combat firepower golden fixtures.
 * One per weapon class plus the edge cases the calculator unification touches:
 * a stealth build (additive sneak pool), a Power Armor build (Stabilized),
 * a VATS crit-cycle build, and a melee build that exceeds 90% armor penetration.
 *
 * Regenerate goldens deliberately with: npx tsx scripts/gen-firepower-goldens.ts
 */
export type GoldenBuild = {
  id: string;
  description: string;
  input: Omit<CombatFirepowerCalculationInput, "targetDummyId">;
};

export const GOLDEN_DUMMY_IDS = [
  "scorchbeast-queen",
  "earle-williams",
  "ultracite-titan",
  "level-100-super-mutant",
  "raw-unarmored"
] as const;

export const GOLDEN_BUILDS: GoldenBuild[] = [
  {
    id: "bloodied-commando-fixer-vats",
    description: "Bloodied Commando Fixer in VATS crit cycle (Luck 33, Critical Savvy 3)",
    input: {
      weaponId: "the-fixer",
      equippedMods: [{ slug: "bloodied" }, { slug: "vital" }, { slug: "vats-optimized" }],
      equippedPerks: [
        { cardId: "commando", rank: 3 },
        { cardId: "expert-commando", rank: 3 },
        { cardId: "master-commando", rank: 3 },
        { cardId: "bloody-mess", rank: 3 },
        { cardId: "nerd-rage", rank: 3 },
        { cardId: "better-criticals", rank: 3 },
        { cardId: "critical-savvy", rank: 3 }
      ],
      activeBuffs: {
        activeDrug: "psychotats",
        activeFood: "blight-soup",
        activeBobblehead: "small-guns",
        activeMagazine: "guns-and-bullets-3",
        activeMutations: ["adrenal-reaction", "eagle-eyes"]
      },
      playerStats: {
        agility: 25,
        luck: 33,
        strength: 5,
        healthPct: 0.2,
        hasStrangeInNumbers: true,
        isInVats: true,
        vatsCritEveryOtherShot: true
      }
    }
  },
  {
    id: "anti-armor-tank-killer-fixer",
    description: "Anti-Armor Fixer with Tank Killer 3 and a perforating magazine (68% + innate)",
    input: {
      weaponId: "the-fixer",
      equippedMods: [{ slug: "anti-armor" }, { slug: "rapid" }],
      weaponCrafting: { magazineId: "perforating-magazine" },
      equippedPerks: [
        { cardId: "commando", rank: 3 },
        { cardId: "tank-killer", rank: 3 }
      ],
      playerStats: { agility: 15, luck: 15, strength: 5 }
    }
  },
  {
    id: "aristocrats-rifleman-hunting-rifle",
    description: "Aristocrat's Hunting Rifle, Rifleman line, Hitman's while aiming",
    input: {
      weaponId: "hunting-rifle",
      equippedMods: [{ slug: "aristocrats" }, { slug: "hitmans" }],
      equippedPerks: [
        { cardId: "rifleman", rank: 3 },
        { cardId: "expert-rifleman", rank: 3 },
        { cardId: "master-rifleman", rank: 3 },
        { cardId: "tank-killer", rank: 2 }
      ],
      activeBuffs: { activeDrug: "psychobuff", activeBobblehead: "small-guns" },
      playerStats: { agility: 10, luck: 12, strength: 5, caps: 30000, isAiming: true }
    }
  },
  {
    id: "pa-heavy-holy-fire-energy",
    description: "Power Armor Holy Fire (energy heavy) with Stabilized 3 and Quad",
    input: {
      weaponId: "holy-fire",
      equippedMods: [{ slug: "quad" }, { slug: "junkies" }],
      equippedPerks: [
        { cardId: "heavy-gunner", rank: 3 },
        { cardId: "expert-heavy-gunner", rank: 3 },
        { cardId: "master-heavy-gunner", rank: 3 },
        { cardId: "stabilized", rank: 3 }
      ],
      activeBuffs: { activeMagazine: "tesla-science-7" },
      playerStats: { agility: 8, luck: 10, strength: 15, isPowerArmor: true, addictionsCount: 4 }
    }
  },
  {
    id: "pa-heavy-red-terror-ballistic",
    description: "Power Armor Red Terror (ballistic heavy), Juggernaut's at full health, Rapid",
    input: {
      weaponId: "red-terror",
      equippedMods: [{ slug: "juggernauts" }, { slug: "rapid" }, { slug: "lucky" }],
      equippedPerks: [
        { cardId: "heavy-gunner", rank: 3 },
        { cardId: "expert-heavy-gunner", rank: 3 },
        { cardId: "master-heavy-gunner", rank: 3 },
        { cardId: "stabilized", rank: 2 },
        { cardId: "critical-savvy", rank: 2 }
      ],
      activeBuffs: { activeBobblehead: "big-guns", activeMagazine: "guns-and-bullets-3" },
      playerStats: { agility: 6, luck: 20, strength: 15, healthPct: 1.0, isPowerArmor: true }
    }
  },
  {
    id: "explosive-cremator-demolition",
    description: "Explosive Cremator with Demolition Expert 5",
    input: {
      weaponId: "cremator",
      equippedMods: [{ slug: "explosive" }, { slug: "two-shot" }],
      equippedPerks: [
        { cardId: "heavy-gunner", rank: 3 },
        { cardId: "demolition-expert", rank: 5 }
      ],
      playerStats: { agility: 8, luck: 10, strength: 10 }
    }
  },
  {
    id: "two-shot-combat-shotgun",
    description: "Two Shot Combat Shotgun, Shotgunner line",
    input: {
      weaponId: "combat-shotgun",
      equippedMods: [{ slug: "two-shot" }, { slug: "steady" }],
      equippedPerks: [
        { cardId: "shotgunner", rank: 3 },
        { cardId: "expert-shotgunner", rank: 3 },
        { cardId: "master-shotgunner", rank: 3 },
        { cardId: "bloody-mess", rank: 3 }
      ],
      playerStats: { agility: 12, luck: 8, strength: 6, isStationary: true }
    }
  },
  {
    id: "junkies-gunslinger-western-revolver",
    description: "Junkie's Western Revolver with Gunslinger line and Tank Killer",
    input: {
      weaponId: "western-revolver",
      equippedMods: [{ slug: "junkies" }, { slug: "vats-optimized" }],
      equippedPerks: [
        { cardId: "gunslinger", rank: 3 },
        { cardId: "expert-gunslinger", rank: 3 },
        { cardId: "master-gunslinger", rank: 3 },
        { cardId: "tank-killer", rank: 3 },
        { cardId: "critical-savvy", rank: 3 }
      ],
      playerStats: { agility: 20, luck: 23, strength: 5, addictionsCount: 5, isInVats: true }
    }
  },
  {
    id: "melee-chainsaw-over-cap-penetration",
    description: "Anti-Armor Chainsaw, Incisor 3, bow bar: penetration would be ~92% uncapped; engine cap holds it at 90%",
    input: {
      weaponId: "chainsaw",
      equippedMods: [{ slug: "anti-armor" }, { slug: "heavy-hitters" }],
      weaponCrafting: { barrelId: "chainsaw-bow-bar" },
      equippedPerks: [
        { cardId: "slugger", rank: 3 },
        { cardId: "expert-slugger", rank: 3 },
        { cardId: "master-slugger", rank: 3 },
        { cardId: "incisor", rank: 3 }
      ],
      activeBuffs: { activeFood: "yao-guai-roast", activeMutations: ["carnivore"] },
      playerStats: { agility: 8, luck: 8, strength: 30, hasStrangeInNumbers: true, isPowerAttacking: true }
    }
  },
  {
    id: "unarmed-deathclaw-gauntlet-mutants",
    description: "Mutant's Deathclaw Gauntlet, Iron Fist, Incisor 3, Strength 35",
    input: {
      weaponId: "deathclaw-gauntlet",
      equippedMods: [{ slug: "mutants" }],
      equippedPerks: [
        { cardId: "iron-fist", rank: 3 },
        { cardId: "incisor", rank: 3 },
        { cardId: "bloody-mess", rank: 3 }
      ],
      activeBuffs: { activeMutations: ["carnivore", "eagle-eyes"] },
      playerStats: { agility: 8, luck: 12, strength: 35, hasStrangeInNumbers: true }
    }
  },
  {
    id: "stalkers-archer-compound-bow-sneak",
    description: "Stalker's Compound Bow, Archer line, Bow Before Me 3, sneaking",
    input: {
      weaponId: "compound-bow",
      equippedMods: [{ slug: "stalkers" }],
      equippedPerks: [
        { cardId: "archer", rank: 3 },
        { cardId: "expert-archer", rank: 3 },
        { cardId: "master-archer", rank: 3 },
        { cardId: "bow-before-me", rank: 3 },
        { cardId: "ninja", rank: 2 }
      ],
      playerStats: { agility: 18, luck: 10, strength: 5, isSneaking: true, isCrouched: true }
    }
  },
  {
    id: "nocturnal-ninja-stealth-fixer",
    description: "Nocturnal Fixer at night, Ninja 3 + Covert Operative 3 + Mister Sandman 3 (additive sneak pool)",
    input: {
      weaponId: "the-fixer",
      equippedMods: [{ slug: "nocturnal" }, { slug: "lucky" }],
      weaponCrafting: { muzzleId: "suppressor" },
      equippedPerks: [
        { cardId: "commando", rank: 3 },
        { cardId: "ninja", rank: 3 },
        { cardId: "covert-operative", rank: 3 },
        { cardId: "mister-sandman", rank: 3 },
        { cardId: "critical-savvy", rank: 3 }
      ],
      playerStats: { agility: 20, luck: 23, strength: 5, isSneaking: true, isCrouched: true, timeOfDay: "night" }
    }
  }
];

/** AP-cost contract grid: every catalog base AP × innate reduction × V.A.T.S. Optimized star (x0.65). */
export const AP_FUZZ_REDUCTIONS = [0, -0.05, -0.1, -0.15, -0.2, -0.25, -0.3, -0.35, -0.4, -0.5, -0.9, -1.0];
