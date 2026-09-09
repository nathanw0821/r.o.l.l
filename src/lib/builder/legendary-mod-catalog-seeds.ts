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
/** 1★ armor — common primary bench effects (names match in-game conventions). */
const ARMOR_1: BuilderLegendarySeedRow[] = [
  armor("aristocrats", "Aristocrat's", 1, "Grants up to +20 DR/ER the higher your caps (max at 29k caps).", {
    effectMath: { dr: 20, er: 20 }
  }),
  armor("assassins-armor", "Assassin's", 1, "-15% damage from humans."),
  armor("auto-stim", "Auto Stim", 1, "Automatically use a stimpak when hit while health is 25% or less, once every 60s."),
  armor("bolstering", "Bolstering", 1, "Grants up to +35 Energy and Damage Resistance the lower your health.", {
    effectMath: { dr: 10, er: 10 }
  }),
  armor("chameleon-armor", "Chameleon", 1, "Invisibility while sneaking and stationary."),
  armor("cloaking", "Cloaking", 1, "Being hit in melee generates a stealth field once per 30 seconds."),
  armor("exterminators-armor", "Exterminator's", 1, "-15% damage from Mirelurks and bugs."),
  armor("ghoul-slayers-armor", "Ghoul Slayer's", 1, "-15% damage from Ghouls."),
  armor("hunters-armor", "Hunter's", 1, "-15% damage from animals."),
  armor("life-saving", "Life Saving", 1, "When incapacitated, 100% chance to revive with a Stimpak once every 5 minutes.", { pa: false }),
  armor("mutant-slayers-armor", "Mutant Slayer's", 1, "-15% damage from Super Mutants."),
  armor("mutants-armor", "Mutant's", 1, "+10 Damage and Energy Resistance if you are mutated.", { effectMath: { dr: 10, er: 10 } }),
  armor("nocturnal-armor", "Nocturnal", 1, "+80 Damage and Energy Resistance at night or while crouched.", { effectMath: { dr: 80, er: 80 } }),
  armor("overeaters", "Overeater's", 1, "Increases damage reduction up to 6% as you fill hunger and thirst meters.", {
    effectMath: { dr: 6, er: 6 }
  }),
  armor("regenerating-armor", "Regenerating", 1, "Slowly regenerate health while not in combat."),
  armor("troubleshooters-armor", "Troubleshooter's", 1, "-15% damage from robots."),
  armor("unyielding", "Unyielding", 1, "+3 to all SPECIAL except END when health is low (armor only).", {
    pa: false,
    ghoulSpecialCap: 2,
    effectMath: { specialBonus: 3 }
  }),
  armor("vanguards", "Vanguard's", 1, "Grants up to +35 Energy and Damage Resistance the higher your health.", {
    effectMath: { dr: 10, er: 10 }
  }),
  armor("weightless", "Weightless", 1, "Weighs 90% less and does not count as armor for Chameleon mutation.", { pa: false }),
  armor("zealots-armor", "Zealot's", 1, "-15% damage from Scorched.")
];

/** 2★ armor */
const ARMOR_2: BuilderLegendarySeedRow[] = [
  armor("powered", "Powered", 2, "Increases Action Point refresh speed (+5 AP/s).", { effectMath: { apRegen: 0.05 } }),
  armor("poisoners", "Poisoner's", 2, "+25 Poison Resistance.", { effectMath: { pr: 25 } }),
  armor("fireproof-armor", "Fireproof", 2, "+25 Fire Resistance.", { effectMath: { fr: 25 } }),
  armor("warming", "Warming", 2, "+25 Cryo Resistance.", { effectMath: { cr: 25 } }),
  armor("hazmat", "HazMat", 2, "+25 Radiation Resistance.", { effectMath: { rr: 25 } }),
  armor("hardy", "Hardy", 2, "Receive 7% less explosion damage.", { effectMath: { er: 15 } }),
  armor("antiseptic", "Antiseptic", 2, "Receive 25% less disease chance from environmental sources."),
  armor("glutton", "Glutton", 2, "Thirst and hunger grow 10% slower."),
  armor("strength-2", "Strength", 2, "+2 Strength.", { effectMath: { str: 2 } }),
  armor("perception-2", "Perception", 2, "+2 Perception.", { effectMath: { per: 2 } }),
  armor("endurance-2", "Endurance", 2, "+2 Endurance.", { effectMath: { end: 2 } }),
  armor("charisma-2", "Charisma", 2, "+2 Charisma.", { effectMath: { cha: 2 } }),
  armor("intelligence-2", "Intelligence", 2, "+2 Intelligence.", { effectMath: { int: 2 } }),
  armor("agility-2", "Agility", 2, "+2 Agility.", { effectMath: { agi: 2 } }),
  armor("luck-2", "Luck", 2, "+2 Luck.", { effectMath: { lck: 2 } })
];

/** 3★ armor */
const ARMOR_3: BuilderLegendarySeedRow[] = [
  armor("sentinels", "Sentinel's", 3, "75% chance to reduce damage by 15% while standing still.", { effectMath: { dr: 15, er: 15 } }),
  armor("cavaliers", "Cavalier's", 3, "75% chance to reduce damage by 15% while sprinting."),
  armor("arms-keepers", "Arms Keeper's", 3, "Weapon weights reduced by 20%."),
  armor("thru-hikers", "Thru-Hiker's", 3, "Food, drink, and chem weights reduced by 20%."),
  armor("belted", "Belted", 3, "Ammo weight reduced by 20%."),
  armor("pack-rats", "Pack Rat's", 3, "Junk weight reduced by 20%."),
  armor("acrobats", "Acrobat's", 3, "Reduces fall damage by 50%.", { pa: false }),
  armor("doctors", "Doctor's", 3, "Stimpaks, RadAway, and Rad-X 5% more effective."),
  armor("secret-agents", "Secret Agent's", 3, "Harder to detect while sneaking.", { pa: false }),
  armor("dissipating", "Dissipating", 3, "Slowly regenerate radiation damage while not in combat."),
  armor("burning", "Burning", 3, "5% chance to deal 100 Fire damage to melee attackers."),
  armor("electrified", "Electrified", 3, "5% chance to deal 100 Energy damage to melee attackers."),
  armor("frozen", "Frozen", 3, "5% chance to deal 100 Cryo damage to melee attackers."),
  armor("toxic", "Toxic", 3, "5% chance to deal 100 Poison damage to melee attackers."),
  armor("divers", "Diver's", 3, "Grants underwater breathing.", { pa: false })
];

/** 4★ armor */
const ARMOR_4: BuilderLegendarySeedRow[] = [
  armor("aegis", "Aegis", 4, "+15 Damage & Energy Resistance for every 10% health above 50%."),
  armor("battle-scarred", "Battle-Scarred", 4, "+20% Damage Resistance while health is below 40%."),
  armor("bruising", "Bruising", 4, "Reflect 25% of incoming melee damage."),
  armor("bulwarks", "Bulwark's", 4, "Reduce damage taken by 10% when stationary."),
  armor("rangers", "Ranger's", 4, "+10% ranged weapon damage while wearing this armor."),
  armor("rejuvenators", "Rejuvenator's", 4, "Adds HP and AP regeneration to hunger and thirst."),
  armor("runners", "Runner's", 4, "-10% sprint AP cost and +5% sprint speed."),
  armor("tanky", "Tanky", 4, "+100 flat Max Health."),
  armor("vengeful", "Vengeful", 4, "When hit, deal 50 damage back to attacker.")
];

/** 1★ weapons */
const WEAPON_1: BuilderLegendarySeedRow[] = [
  weapon("anti-armor", "Anti-Armor", 1, null, "+50% Armor Penetration.", { damagePct: 0.12 }),
  weapon(
    "aristocrats-weapon",
    "Aristocrat's",
    1,
    null,
    "Damage increases as caps increase (max +50% at 29k caps).",
    { damagePct: 0.5 }
  ),
  weapon("assassins-weapon", "Assassin's", 1, null, "+50% damage vs humans."),
  weapon("berserkers", "Berserker's", 1, null, "Damage increases up to +50% as Damage Resistance decreases."),
  weapon("bloodied", "Bloodied", 1, null, "Damage increases up to +95% as Health decreases.", { damagePct: 0.25 }),
  weapon("executioners", "Executioner's", 1, null, "+50% more damage when target is below 40% health."),
  weapon("exterminators-weapon", "Exterminator's", 1, null, "+50% damage to Mirelurks and bugs."),
  weapon("furious", "Furious", 1, null, "+5% damage per consecutive hit on the same target (max +45%)."),
  weapon("ghoul-slayer", "Ghoul Slayer's", 1, null, "+50% damage to Ghouls."),
  weapon("gourmands", "Gourmand's", 1, null, "Damage increases up to +24% as you fill hunger and thirst."),
  weapon("hunters-weapon", "Hunter's", 1, null, "+50% damage to animals."),
  weapon("instigating", "Instigating", 1, null, "+100% damage if target is at full health."),
  weapon("juggernauts", "Juggernaut's", 1, null, "Damage increases up to +25% as health increases."),
  weapon("junkies", "Junkie's", 1, null, "+10% damage per addiction (max +50%)."),
  weapon("medics-weapon", "Medic's", 1, null, "Attacks heal friendly targets by 5% health."),
  weapon("mutants-weapon", "Mutant's", 1, null, "+5% damage per mutation (max +25%)."),
  weapon("mutant-slayers-weapon", "Mutant Slayer's", 1, null, "+50% damage to Super Mutants."),
  weapon("nocturnal-weapon", "Nocturnal", 1, null, "+50% damage at night or when crouched.", { damagePct: 0.5 }),
  weapon("quad", "Quad", 1, null, "+300% ammo capacity (quadruple base capacity)."),
  weapon("stalkers", "Stalker's", 1, null, "+100% sneak attack damage."),
  weapon("suppressors", "Suppressor's", 1, null, "Reduce target's damage output by 25% for 5 seconds."),
  weapon("troubleshooters-weapon", "Troubleshooter's", 1, null, "+50% damage to robots."),
  weapon("two-shot", "Two Shot", 1, null, "Fires an additional projectile (+25% damage).", { damagePct: 0.25 }),
  weapon("vampires", "Vampire's", 1, null, "Restore 2% health over 2 seconds when hitting a target."),
  weapon("zealots-weapon", "Zealot's", 1, null, "+50% damage to Scorched.")
];

/** 2★ weapons */
const WEAPON_2: BuilderLegendarySeedRow[] = [
  weapon("rapid", "Rapid", 2, null, "+25% weapon speed (ranged) or +40% swing speed (melee).", { damagePct: 0.05 }),
  weapon("vital", "Vital", 2, null, "+50% critical damage."),
  weapon("vats-enhanced", "V.A.T.S. Enhanced", 2, null, "+50% chance to hit a target in V.A.T.S."),
  weapon("explosive", "Explosive", 2, "Ranged", "Bullets explode for +20% area-of-effect damage.", { damagePct: 0.2 }),
  weapon("hitmans", "Hitman's", 2, "Ranged", "+25% damage while aiming down sights."),
  weapon("heavy-hitters", "Heavy Hitter's", 2, "Melee", "+40% power attack damage."),
  weapon("crippling", "Crippling", 2, null, "+50% limb damage."),
  weapon("inertial", "Inertial", 2, null, "Replenish 15 Action Points with each kill."),
  weapon("last-shot", "Last Shot", 2, "Ranged", "The final round in a magazine has 25% chance to deal +100% damage."),
  weapon("steady", "Steady", 2, "Melee", "+25% melee damage while standing still."),
  weapon("riposting", "Riposting", 2, "Melee", "+50% melee damage reflection while blocking."),
  weapon("bashers", "Basher's", 2, "Ranged", "+50% bash damage.")
];

/** 3★ weapons */
const WEAPON_3: BuilderLegendarySeedRow[] = [
  weapon("vats-optimized", "V.A.T.S. Optimized", 3, null, "-35% Action Point Cost in V.A.T.S."),
  weapon("lucky-hit", "Lucky Hit", 3, null, "+15 bonus V.A.T.S. critical charge fill."),
  weapon("swift", "Swift", 3, "Ranged", "+15% reload speed."),
  weapon("durability", "Durability", 3, null, "Weapons break 50% slower."),
  weapon("lightweight", "Lightweight", 3, null, "-90% weapon weight."),
  weapon("ghosts", "Ghost's", 3, null, "10% chance to cause stealth field for 2 seconds on hit."),
  weapon("steadfast", "Steadfast", 3, "Ranged", "+50 Damage Resistance while aiming down sights."),
  weapon("nimble", "Nimble", 3, "Ranged", "+100% faster movement speed while aiming."),
  weapon("resilient", "Resilient", 3, null, "Gain +500 to all resistances while reloading."),
  weapon("cavaliers-weapon", "Cavalier's", 3, "Melee", "-15% damage taken while blocking."),
  weapon("defenders", "Defender's", 3, "Melee", "-40% damage taken while power attacking."),
  weapon("strength-3", "Strength", 3, null, "+3 Strength.", { str: 3 }),
  weapon("perception-3", "Perception", 3, null, "+3 Perception.", { per: 3 }),
  weapon("endurance-3", "Endurance", 3, null, "+3 Endurance.", { end: 3 }),
  weapon("charisma-3", "Charisma", 3, null, "+3 Charisma.", { cha: 3 }),
  weapon("intelligence-3", "Intelligence", 3, null, "+3 Intelligence.", { int: 3 }),
  weapon("agility-3", "Agility", 3, null, "+3 Agility.", { agi: 3 }),
  weapon("luck-3", "Luck", 3, null, "+3 Luck.", { lck: 3 })
];

/** 4★ weapons */
const WEAPON_4: BuilderLegendarySeedRow[] = [
  weapon("bullys", "Bully's", 4, null, "+25% damage per crippled limb target has."),
  weapon("conductors", "Conductor's", 4, null, "Crits restore 10 HP & AP instantly and 100 over 5s to team."),
  weapon("encirclers", "Encircler's", 4, null, "+10% damage for each combat target around you (up to +50%)."),
  weapon("fracturers", "Fracturer's", 4, null, "When crippling limbs, explode dealing up to 50 damage."),
  weapon("polished", "Polished", 4, null, "The higher the item condition (+100%), the higher the damage (up to +60%)."),
  weapon("pyromaniacs", "Pyromaniac's", 4, null, "When target is burning, deal +50% bonus damage."),
  weapon("vipers", "Viper's", 4, null, "When target is poisoned, deal +50% bonus damage."),
  weapon("charged", "Charged", 4, "Melee", "Light attacks build charge released with heavy attacks."),
  weapon("combo-breakers", "Combo-Breaker's", 4, null, "50% chance to consume 0 AP on hit (10% for power tools)."),
  weapon("fencers", "Fencer's", 4, "Melee", "+12.5% melee damage (+12.5% per nearby teammate, max +50%)."),
  weapon("icemens", "Icemen's", 4, "Melee", "+20% Cryo damage."),
  weapon("pounders", "Pounder's", 4, "Melee", "+10% damage per Onslaught stack (+10 max stacks)."),
  weapon("electricians", "Electrician's", 4, "Ranged", "When reloading, emit shock wave stunning nearby targets for 3s."),
  weapon("pin-pointers", "Pin-Pointer's", 4, "Ranged", "+20% weak spot damage."),
  weapon("stabilizers", "Stabilizer's", 4, "Ranged", "Improves weapon recoil by +35% and stability by +20%.")
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
