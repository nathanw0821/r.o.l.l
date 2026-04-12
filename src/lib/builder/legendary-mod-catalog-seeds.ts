/**
 * Expanded Fallout 76–style legendary catalog for the loadout builder.
 * Star ranks follow common 4-star bench grouping (1–4); fifth-star / re-roll pool excluded here.
 * `effectMath` is often empty — sandbox totals only model a subset; all rows remain pickable.
 */

export type BuilderLegendarySeedRow = {
  slug: string;
  name: string;
  starRank: 1 | 2 | 3 | 4;
  category: "Armor" | "Weapon";
  subCategory: string | null;
  description: string;
  effectMath: Record<string, number>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
};

function armor(
  slug: string,
  name: string,
  star: 1 | 2 | 3 | 4,
  description: string,
  opts?: { pa?: boolean; effectMath?: Record<string, number>; ghoulSpecialCap?: number | null }
): BuilderLegendarySeedRow {
  return {
    slug,
    name,
    starRank: star,
    category: "Armor",
    subCategory: null,
    description,
    effectMath: opts?.effectMath ?? {},
    allowedOnPowerArmor: opts?.pa !== false,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: opts?.ghoulSpecialCap ?? null
  };
}

function weapon(
  slug: string,
  name: string,
  star: 1 | 2 | 3 | 4,
  subCategory: string | null,
  description: string,
  effectMath?: Record<string, number>
): BuilderLegendarySeedRow {
  return {
    slug,
    name,
    starRank: star,
    category: "Weapon",
    subCategory,
    description,
    effectMath: effectMath ?? {},
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  };
}

/** 1★ armor — common primary bench effects (names match in-game conventions). */
const ARMOR_1: BuilderLegendarySeedRow[] = [
  armor("aristocrats", "Aristocrat's", 1, "Damage resist increases with caps on hand."),
  armor("assassins-armor", "Assassin's", 1, "Damage reduction vs humans."),
  armor("auto-stim", "Auto Stim", 1, "Chance to use a stimpak when health drops."),
  armor("exterminators-armor", "Exterminator's", 1, "Damage reduction vs Mirelurks and bugs."),
  armor("hunters-armor", "Hunter's", 1, "Damage reduction vs animals."),
  armor("mutant-slayers-armor", "Mutant Slayer's", 1, "Damage reduction vs Super Mutants."),
  armor("mutants-armor", "Mutant's", 1, "Damage / energy resist if mutated."),
  armor("nocturnal-armor", "Nocturnal", 1, "Damage and energy resist increase at night."),
  armor("troubleshooters-armor", "Troubleshooter's", 1, "Damage reduction vs robots."),
  armor("vanguards", "Vanguard's", 1, "Damage and energy resist increase at high health."),
  armor("weightless", "Weightless", 1, "Chameleon when stationary and not moving."),
  armor("zealots-armor", "Zealot's", 1, "Damage reduction vs Scorched.")
];

/** 2★ armor */
const ARMOR_2: BuilderLegendarySeedRow[] = [
  armor("acrobats", "Acrobat's", 2, "Reduced fall damage."),
  armor("aerodynamic", "Aerodynamic", 2, "Power attack AP cost reduction."),
  armor("cunning", "Cunning", 2, "Agility and Perception while sneaking."),
  armor("durability-armor", "Durability", 2, "Breaks more slowly."),
  armor("hazmat-lining", "Hazmat lining", 2, "Rad exposure mitigation (sandbox placeholder)."),
  armor("hydration", "Hydration", 2, "Thirst decay reduction."),
  armor("lead-lined", "Lead Lined", 2, "Radiation resistance."),
  armor("lightweight-armor", "Lightweight", 2, "Reduced armor weight."),
  armor("luck", "Luck", 2, "Luck while equipped."),
  armor("medic", "Medic's", 2, "Heal nearby teammates on crit."),
  armor("nutrition", "Nutrition", 2, "Hunger decay reduction."),
  armor("poisoners", "Poisoner's", 2, "Poison resist."),
  armor("safecracker", "Safecracker's", 2, "Sweet spot on lockpicks."),
  armor("sneak", "Sneak", 2, "Harder to detect while sneaking.")
];

/** 3★ armor */
const ARMOR_3: BuilderLegendarySeedRow[] = [
  armor("cavaliers", "Cavalier's", 3, "Damage reduction while sprinting."),
  armor("docile", "Doctor's", 3, "Healing from stimpaks increased."),
  armor("dodge", "Dodge", 3, "Chance to avoid damage."),
  armor("fireproof-armor", "Fireproof", 3, "Fire resist / explosion mitigation."),
  armor("lockpicking", "Lockpicking", 3, "Lockpick sweet spot."),
  armor("thorns", "Thorn", 3, "Melee attackers bleed."),
  armor("underwater", "Underwater", 3, "Breathing underwater.")
];

/** 4★ armor */
const ARMOR_4: BuilderLegendarySeedRow[] = [
  armor("breakers", "Breaker's", 4, "Break speed / stagger utility."),
  armor("chameleon-armor", "Chameleon", 4, "Invisibility while sneaking and not moving."),
  armor("cloaking", "Cloaking", 4, "Brief invisibility when hit."),
  armor("detection", "Detection", 4, "Enemy detection bonus."),
  armor("grounded-armor", "Grounded", 4, "Energy damage mitigation."),
  armor("mitigating", "Mitigating", 4, "Damage reduction after taking damage."),
  armor("phoenix", "Phoenix", 4, "Chance to revive with full HP on down."),
  armor("rad-resist-4", "Rad Resistant", 4, "Radiation resistance."),
  armor("regenerating-armor", "Regenerating", 4, "Health regen out of combat."),
  armor("stealth-armor", "Stealth", 4, "Harder to detect while sneaking.")
];

/** 1★ weapons */
const WEAPON_1: BuilderLegendarySeedRow[] = [
  weapon("assassins-weapon", "Assassin's", 1, null, "Damage vs humans."),
  weapon("berserkers", "Berserker's", 1, null, "More damage with lower damage resist."),
  weapon("executioners", "Executioner's", 1, null, "More damage vs targets below 40% HP."),
  weapon("exterminators-weapon", "Exterminator's", 1, null, "Damage vs Mirelurks and bugs."),
  weapon("furious", "Furious", 1, null, "Each consecutive hit increases damage."),
  weapon("ghoul-slayer", "Ghoul Slayer's", 1, null, "Damage vs ghouls."),
  weapon("hunters-weapon", "Hunter's", 1, null, "Damage vs animals."),
  weapon("instigating", "Instigating", 1, null, "Double damage if target is full health."),
  weapon("junkies", "Junkie's", 1, null, "Damage increase per addiction."),
  weapon("medics-weapon", "Medic's", 1, null, "Crits heal you and your group."),
  weapon("mutants-weapon", "Mutant's", 1, null, "Damage if mutated."),
  weapon("mutant-slayers-weapon", "Mutant Slayer's", 1, null, "Damage vs Super Mutants."),
  weapon("nocturnal-weapon", "Nocturnal", 1, null, "Damage increase at night."),
  weapon("quad", "Quad", 1, null, "Quad capacity (weapon dependent)."),
  weapon("stalkers", "Stalker's", 1, null, "If not in combat, +100% VATS accuracy at +100% AP cost."),
  weapon("suppressors", "Suppressor's", 1, null, "Reduce target damage output."),
  weapon("troubleshooters-weapon", "Troubleshooter's", 1, null, "Damage vs robots."),
  weapon("two-shot", "Two Shot", 1, null, "Fire an additional projectile."),
  weapon("vampires", "Vampire's", 1, null, "Brief health regen on hit."),
  weapon("zealots-weapon", "Zealot's", 1, null, "Damage vs Scorched.")
];

/** 2★ weapons */
const WEAPON_2: BuilderLegendarySeedRow[] = [
  weapon("bashing", "Bashing", 2, "Melee", "Increased bash damage."),
  weapon("black-powder-extra", "Muzzle Loading", 2, "Ranged", "Black powder style bonus (placeholder)."),
  weapon("crit-dmg", "+50% crit damage", 2, null, "Increased critical damage."),
  weapon("extra-barrels", "Dual / extra barrels", 2, "Ranged", "Rate-of-fire style (placeholder)."),
  weapon("faster-reload", "15% faster reload", 2, null, "Reload speed."),
  weapon("hitmans", "10% damage while aiming", 2, "Ranged", "Damage while aiming."),
  weapon("limb-dmg", "+50% limb damage", 2, null, "Limb damage."),
  weapon("movement-speed-aim", "Movement speed while aiming", 2, "Ranged", "Move faster while aiming."),
  weapon("perception-2", "+1 Perception", 2, null, "Perception."),
  weapon("rip-extend", "Extended ripper", 2, "Melee", "Melee reach / duration (placeholder)."),
  weapon("vats-accuracy", "+33% VATS accuracy", 2, null, "VATS hit chance."),
  weapon("vats-cost", "25% less VATS AP cost", 2, null, "VATS AP cost.")
];

/** 3★ weapons */
const WEAPON_3: BuilderLegendarySeedRow[] = [
  weapon("agility-3", "Agility", 3, null, "Agility."),
  weapon("endurance-3", "Endurance", 3, null, "Endurance."),
  weapon("fill-meter", "Fill meter", 3, null, "Meter fill on crit (placeholder)."),
  weapon("last-shot", "Last Shot", 3, "Ranged", "Last round in mag bonus damage chance."),
  weapon("luck-3", "Luck", 3, null, "Luck."),
  weapon("perception-3", "Perception", 3, null, "Perception."),
  weapon("resilient", "Resilient", 3, "Melee", "Damage reflect while blocking."),
  weapon("stealth-field-weapon", "Stealth Field", 3, null, "Brief stealth on hit."),
  weapon("strength-3", "Strength", 3, null, "Strength.")
];

/** 4★ weapons */
const WEAPON_4: BuilderLegendarySeedRow[] = [
  weapon("break-slower-weapon", "Durability", 4, null, "Slower break."),
  weapon("faster-move-ads", "Faster movement while aiming", 4, "Ranged", "ADS move speed."),
  weapon("instigating-4-wrong", "Rapid reload echo", 4, null, "Reload utility (placeholder).", { damagePct: 0.02 }),
  weapon("quad-4-alt", "Capacity echo", 4, null, "Magazine utility (placeholder)."),
  weapon("steady-aim-4", "Steady", 4, "Ranged", "Reduced sway while aiming."),
  weapon("two-shot-4-alt", "Focused", 4, null, "Single-target bias (placeholder).")
];

export const EXTENDED_LEGENDARY_MOD_SEEDS: BuilderLegendarySeedRow[] = [
  ...ARMOR_1,
  ...ARMOR_2,
  ...ARMOR_3,
  ...ARMOR_4,
  ...WEAPON_1,
  ...WEAPON_2,
  ...WEAPON_3,
  ...WEAPON_4
];
