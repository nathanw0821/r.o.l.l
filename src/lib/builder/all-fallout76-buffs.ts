// Comprehensive Registry of ALL Fallout 76 Consumables, Aid, Chems, Bobbleheads, Magazines, Drinks, CAMP Machines & Companion Buffs
import { sortAlphanumerically } from "@/lib/utils/alphanumeric-sort";

export type BuffCategory =
  | "bobblehead"
  | "magazine"
  | "chem"
  | "food_meat"
  | "food_plant"
  | "alcohol"
  | "nuka_cola"
  | "camp_machine"
  | "companion";

export type Fallout76BuffDef = {
  id: string;
  label: string;
  category: BuffCategory;
  description: string;
  foodBuffType?: "crit_damage" | "ap_regen" | "max_ap" | "int" | "xp" | "str" | "per" | "end" | "cha" | "agi" | "lck" | "melee_damage" | "carry_weight" | "dr_er" | "max_hp";
  damageMultiplier?: number;
  xpBonusPct?: number;
  specialBonus?: Partial<Record<"str" | "per" | "end" | "cha" | "int" | "agi" | "lck", number>>;
};

// 1. ALL BOBBLEHEADS (20 Total - Alphanumerically Sorted)
export const ALL_BOBBLEHEADS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "bobble-agility", label: "Bobblehead: Agility", category: "bobblehead", description: "+2 Agility", specialBonus: { agi: 2 } },
  { id: "bobble-big-guns", label: "Bobblehead: Big Guns", category: "bobblehead", description: "+20% Heavy Weapon Dmg", damageMultiplier: 1.20 },
  { id: "bobble-caps", label: "Bobblehead: Caps", category: "bobblehead", description: "Increased Cap Find Chance" },
  { id: "bobble-charisma", label: "Bobblehead: Charisma", category: "bobblehead", description: "+2 Charisma", specialBonus: { cha: 2 } },
  { id: "bobble-endurance", label: "Bobblehead: Endurance", category: "bobblehead", description: "+2 Endurance", specialBonus: { end: 2 } },
  { id: "bobble-energy", label: "Bobblehead: Energy Weapons", category: "bobblehead", description: "+20% Energy Weapon Dmg", damageMultiplier: 1.20 },
  { id: "bobble-explosive", label: "Bobblehead: Explosive", category: "bobblehead", description: "+20% Explosive Damage", damageMultiplier: 1.20 },
  { id: "bobble-intelligence", label: "Bobblehead: Intelligence", category: "bobblehead", description: "+2 Intelligence (+6% XP)", specialBonus: { int: 2 }, xpBonusPct: 6 },
  { id: "bobble-leader", label: "Bobblehead: Leader", category: "bobblehead", description: "+5% XP Bonus", xpBonusPct: 5 },
  { id: "bobble-lockpicking", label: "Bobblehead: Lockpicking", category: "bobblehead", description: "Wider Sweet Spot" },
  { id: "bobble-luck", label: "Bobblehead: Luck", category: "bobblehead", description: "+2 Luck", specialBonus: { lck: 2 } },
  { id: "bobble-medicine", label: "Bobblehead: Medicine", category: "bobblehead", description: "+30% Stimpak Healing" },
  { id: "bobble-melee", label: "Bobblehead: Melee", category: "bobblehead", description: "+20% Melee Weapon Dmg", damageMultiplier: 1.20 },
  { id: "bobble-perception", label: "Bobblehead: Perception", category: "bobblehead", description: "+2 Perception", specialBonus: { per: 2 } },
  { id: "bobble-repair", label: "Bobblehead: Repair", category: "bobblehead", description: "+30% Fusion Core Duration" },
  { id: "bobble-science", label: "Bobblehead: Science", category: "bobblehead", description: "+1 Extra Hack Attempt" },
  { id: "bobble-small-guns", label: "Bobblehead: Small Guns", category: "bobblehead", description: "+20% Small Guns Ballistic Dmg", damageMultiplier: 1.20 },
  { id: "bobble-sneak", label: "Bobblehead: Sneak", category: "bobblehead", description: "+30% Harder to Detect", damageMultiplier: 1.05 },
  { id: "bobble-strength", label: "Bobblehead: Strength", category: "bobblehead", description: "+2 Strength", specialBonus: { str: 2 }, damageMultiplier: 1.04 },
  { id: "bobble-unarmed", label: "Bobblehead: Unarmed", category: "bobblehead", description: "+20% Unarmed Damage", damageMultiplier: 1.20 },
], (b) => b.label);

// 2. ALL MAGAZINES (Top Meta & Combat Issues - Alphanumerically Sorted)
export const ALL_MAGAZINES: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "mag-aat4", label: "Astoundingly Awesome #4", category: "magazine", description: "+15% Alien Blaster Dmg", damageMultiplier: 1.15 },
  { id: "mag-aat10", label: "Astoundingly Awesome #10", category: "magazine", description: "+15% Scoped Weapon Dmg", damageMultiplier: 1.15 },
  { id: "mag-bw6", label: "Backwoodsman #6", category: "magazine", description: "+50% Food Buff Effectiveness", damageMultiplier: 1.05 },
  { id: "mag-gb3", label: "Guns and Bullets #3", category: "magazine", description: "+100% Ballistic VATS Crit Dmg", damageMultiplier: 1.15 },
  { id: "mag-grognak1", label: "Grognak the Barbarian #1", category: "magazine", description: "+15% Melee Weapon Dmg", damageMultiplier: 1.15 },
  { id: "mag-grognak5", label: "Grognak the Barbarian #5", category: "magazine", description: "+15% Dmg vs Scorched", damageMultiplier: 1.15 },
  { id: "mag-ll3", label: "Live & Love #3", category: "magazine", description: "+50% Healing & Food Effectiveness", damageMultiplier: 1.05 },
  { id: "mag-ll8", label: "Live & Love #8", category: "magazine", description: "+5% XP when in Team", xpBonusPct: 5 },
  { id: "mag-ts7", label: "Tesla Science #7", category: "magazine", description: "+100% Energy VATS Crit Dmg", damageMultiplier: 1.15 },
  { id: "mag-ts8", label: "Tesla Science #8", category: "magazine", description: "+50% Crit Dmg", damageMultiplier: 1.08 },
  { id: "mag-unstoppables1", label: "Unstoppables #1", category: "magazine", description: "+5% Chance to Avoid Damage" },
], (m) => m.label);

// 3. ALL CHEMS & DRUGS (Alphanumerically Sorted)
export const ALL_CHEMS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "chem-berry-mentats", label: "Berry Mentats", category: "chem", description: "+5 INT (+15% XP), Highlights Targets", specialBonus: { int: 5 }, xpBonusPct: 15 },
  { id: "chem-bufftats", label: "Bufftats", category: "chem", description: "+3 STR, +3 PER, +3 END, +45 HP", specialBonus: { str: 3, per: 3, end: 3 }, damageMultiplier: 1.06 },
  { id: "chem-calmex", label: "Calmex", category: "chem", description: "+3 PER, +3 AGI, +15% Sneak Dmg", damageMultiplier: 1.15, specialBonus: { per: 3, agi: 3 } },
  { id: "chem-formula-p", label: "Formula P", category: "chem", description: "+5 PER, +5 CHA, Extreme Hip-Fire Accuracy", specialBonus: { per: 5, cha: 5 } },
  { id: "chem-grape-mentats", label: "Grape Mentats", category: "chem", description: "+5 CHA, Better Vendor Prices", specialBonus: { cha: 5 } },
  { id: "chem-med-x", label: "Med-X", category: "chem", description: "+25 Damage Resistance" },
  { id: "chem-orange-mentats", label: "Orange Mentats", category: "chem", description: "+5 PER, +10% VATS Accuracy", specialBonus: { per: 5 } },
  { id: "chem-overdrive", label: "Overdrive", category: "chem", description: "+15% Dmg, +15% Crit Dmg", damageMultiplier: 1.15 },
  { id: "chem-psycho", label: "Psycho", category: "chem", description: "+15% Dmg, +25 DR", damageMultiplier: 1.15 },
  { id: "chem-psychobuff", label: "Psychobuff", category: "chem", description: "+25% Dmg, +65 HP, +3 STR, +3 END", damageMultiplier: 1.25, specialBonus: { str: 3, end: 3 } },
  { id: "chem-psychotats", label: "Psychotats", category: "chem", description: "+25% Dmg, +15 DR, +3 PER", damageMultiplier: 1.25, specialBonus: { per: 3 } },
  { id: "chem-rad-x", label: "Rad-X", category: "chem", description: "+100 Radiation Resistance" },
  { id: "chem-x-cell", label: "X-Cell", category: "chem", description: "+2 All S.P.E.C.I.A.L. Stats", specialBonus: { str: 2, per: 2, end: 2, cha: 2, int: 2, agi: 2, lck: 2 }, damageMultiplier: 1.04 },
], (c) => c.label);

// 4. ALL STEEPED TEAS & PLANT FOODS (Herbivore 2.5x - Alphanumerically Sorted)
export const ALL_PLANT_FOODS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "plant-blight-soup", label: "Blight Soup", category: "food_plant", foodBuffType: "crit_damage", description: "+50% VATS Crit Dmg (+125% Herbivore)", damageMultiplier: 1.0 },
  { id: "plant-brain-bombs", label: "Brain Bombs", category: "food_plant", foodBuffType: "int", description: "+4 INT (+8 INT Herbivore = +24% XP)", specialBonus: { int: 8 }, xpBonusPct: 24 },
  { id: "plant-company-tea", label: "Company Tea", category: "food_plant", foodBuffType: "ap_regen", description: "+10 AP Regen/sec (+25 Herbivore)", damageMultiplier: 1.0 },
  { id: "plant-corn-soup", label: "Corn Soup", category: "food_plant", foodBuffType: "ap_regen", description: "+6 AP Regen (+15 Herbivore)" },
  { id: "plant-cranberry-relish", label: "Cranberry Relish", category: "food_plant", foodBuffType: "xp", description: "+10% XP (+25% Herbivore)", xpBonusPct: 25 },
  { id: "plant-mutfruit-juice", label: "Mutfruit Juice", category: "food_plant", foodBuffType: "agi", description: "+2 Agility (+5 Herbivore)", specialBonus: { agi: 5 } },
  { id: "plant-steeped-ash-rose", label: "Steeped Ash Rose Tea", category: "food_plant", foodBuffType: "str", description: "+2 Strength (+5 Herbivore)", specialBonus: { str: 5 }, damageMultiplier: 1.04 },
  { id: "plant-steeped-fever-blossom", label: "Steeped Fever Blossom Tea", category: "food_plant", foodBuffType: "ap_regen", description: "+20 AP Regen (+50 Herbivore)", damageMultiplier: 1.0 },
  { id: "plant-steeped-melon", label: "Steeped Melon Blossom Tea", category: "food_plant", foodBuffType: "agi", description: "+2 Agility (+5 Herbivore)", specialBonus: { agi: 5 } },
  { id: "plant-steeped-strangler", label: "Steeped Strangler Bloom Tea", category: "food_plant", foodBuffType: "lck", description: "+2 Luck (+5 Herbivore)", specialBonus: { lck: 5 } },
  { id: "plant-steeped-tattoo", label: "Steeped Tattoo Flower Tea", category: "food_plant", foodBuffType: "per", description: "+2 Perception (+5 Herbivore)", specialBonus: { per: 5 } },
  { id: "plant-steeped-thistle", label: "Steeped Thistle Tea", category: "food_plant", foodBuffType: "crit_damage", description: "+20% VATS Crit Dmg (+50% Herbivore)", damageMultiplier: 1.0 },
  { id: "plant-sweet-mutfruit-tea", label: "Sweet Mutfruit Tea", category: "food_plant", foodBuffType: "crit_damage", description: "+20% VATS Crit Dmg (+50% Herbivore)", damageMultiplier: 1.0 },
  { id: "plant-tato-juice", label: "Tato Juice", category: "food_plant", foodBuffType: "max_ap", description: "+10 Max AP (+25 Herbivore)" },
], (f) => f.label);

// 5. ALL MEATS & SCORCHBEAST ORGANS (Carnivore 2.5x - Alphanumerically Sorted)
export const ALL_MEAT_FOODS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "meat-scorchbeast-brain", label: "Broiled Scorchbeast Brain", category: "food_meat", foodBuffType: "int", description: "+3 INT (+7.5 INT Carnivore = +22.5% XP)", specialBonus: { int: 7 }, xpBonusPct: 22.5 },
  { id: "meat-softshell", label: "Cooked Softshell Meat", category: "food_meat", foodBuffType: "max_ap", description: "+25 Max AP (+62.5 Carnivore)" },
  { id: "meat-deathclaw-steak", label: "Deathclaw Steak", category: "food_meat", foodBuffType: "str", description: "+2.5 STR (+5 STR Carnivore)", specialBonus: { str: 5 }, damageMultiplier: 1.05 },
  { id: "meat-glowing-steak", label: "Glowing Meat Steak", category: "food_meat", foodBuffType: "melee_damage", description: "+20% Melee Dmg (+50% Carnivore)", damageMultiplier: 1.20 },
  { id: "meat-scorchbeast-liver", label: "Scorchbeast Liver", category: "food_meat", foodBuffType: "lck", description: "+3 LCK (+7.5 LCK Carnivore)", specialBonus: { lck: 7 } },
  { id: "meat-scorchbeast-steak", label: "Scorchbeast Steak", category: "food_meat", foodBuffType: "str", description: "+3 STR (+7.5 STR Carnivore)", specialBonus: { str: 7 }, damageMultiplier: 1.08 },
  { id: "meat-smoked-mirelurk", label: "Smoked Mirelurk Fillet", category: "food_meat", foodBuffType: "carry_weight", description: "+30 Carry Wt (+60 Carnivore)" },
  { id: "meat-tasty-squirrel", label: "Tasty Squirrel Stew", category: "food_meat", foodBuffType: "xp", description: "+10% XP (+25% Carnivore)", xpBonusPct: 25 },
  { id: "meat-yao-guai-roast", label: "Yao Guai Roast", category: "food_meat", foodBuffType: "melee_damage", description: "+15% Melee Dmg (+37.5% Carnivore)", damageMultiplier: 1.15 },
], (f) => f.label);

// 6. ALL ALCOHOL & BREWS (Alphanumerically Sorted)
export const ALL_ALCOHOL: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "brew-ballistic-bock", label: "Ballistic Bock", category: "alcohol", description: "+15% Ballistic Damage, +15% Cnd Loss", damageMultiplier: 1.15 },
  { id: "brew-bourbon", label: "Bourbon", category: "alcohol", description: "+1 STR, +1 END (+3 STR with Party Boy)", specialBonus: { str: 3, end: 3 }, damageMultiplier: 1.05 },
  { id: "brew-high-voltage-hefe", label: "High Voltage Hefe", category: "alcohol", description: "+15% Energy Damage, +15% Cnd Loss", damageMultiplier: 1.15 },
  { id: "brew-tick-blood-tequila", label: "Tick Blood Tequila", category: "alcohol", description: "+5% Health Steal on Hit" },
  { id: "brew-vintage-shine", label: "Vintage Mire Magic Moonshine", category: "alcohol", description: "+4 STR, +4 END", specialBonus: { str: 4, end: 4 }, damageMultiplier: 1.08 },
  { id: "brew-whiskey", label: "Whiskey", category: "alcohol", description: "+2 Strength (+6 STR with Party Boy)", specialBonus: { str: 6 }, damageMultiplier: 1.10 },
], (a) => a.label);

// 7. ALL NUKA-COLA BEVERAGES (Alphanumerically Sorted)
export const ALL_NUKA_COLAS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "nuka-cranberry", label: "Nuka-Cola Cranberry", category: "nuka_cola", description: "+10% XP Bonus", xpBonusPct: 10 },
  { id: "nuka-dark", label: "Nuka-Dark", category: "nuka_cola", description: "+1 STR, +1 END (+6 STR with Cola Nut & Party Boy)", specialBonus: { str: 6, end: 6 }, damageMultiplier: 1.10 },
  { id: "nuka-grape", label: "Nuka-Grape", category: "nuka_cola", description: "-1200 Rads, +100 HP" },
  { id: "nuka-quantum", label: "Nuka-Quantum", category: "nuka_cola", description: "+200 HP, +100 AP" },
  { id: "nuka-twist", label: "Nuka-Twist", category: "nuka_cola", description: "+2 Random SPECIAL Stats", specialBonus: { str: 2, per: 2, agi: 2 } },
], (n) => n.label);

// 8. ALL CAMP APPLIANCES & MACHINES (Alphanumerically Sorted)
export const ALL_CAMP_APPLIANCES: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "camp-arm-wrestling", label: "Arm Wrestling Machine", category: "camp_machine", description: "+2 Strength (30m)", specialBonus: { str: 2 }, damageMultiplier: 1.04 },
  { id: "camp-bowling-lane", label: "Bowling Alley Lane", category: "camp_machine", description: "+2 Luck & +2 Charisma (30m)", specialBonus: { lck: 2, cha: 2 } },
  { id: "camp-derby-machine", label: "Derby Machine", category: "camp_machine", description: "+2 Intelligence (+6% XP 30m)", specialBonus: { int: 2 }, xpBonusPct: 6 },
  { id: "camp-exercise-bike", label: "Exercise Bike", category: "camp_machine", description: "+2 Endurance (30m)", specialBonus: { end: 2 } },
  { id: "camp-fortune-teller", label: "Fortune Teller Machine", category: "camp_machine", description: "+2 Luck (30m)", specialBonus: { lck: 2 } },
  { id: "camp-love-seat", label: "Lethal Love Seat", category: "camp_machine", description: "+25% Chem Duration Increase (1 Hour)" },
  { id: "camp-lunchboxes", label: "Lunchboxes (x4)", category: "camp_machine", description: "Very Well Rested (+100% XP 1 hr)", xpBonusPct: 100 },
  { id: "camp-mothman-tome", label: "Mothman Tome", category: "camp_machine", description: "+5% XP Bonus (1 Hour)", xpBonusPct: 5 },
  { id: "camp-instrument", label: "Musical Instrument (Piano/Guitar)", category: "camp_machine", description: "Well Tuned (+25% AP Regen 1 hr)" },
  { id: "camp-phoropter", label: "Phoropter VATS Chair", category: "camp_machine", description: "+2 Perception (30m)", specialBonus: { per: 2 } },
  { id: "camp-speed-bag", label: "Speed Bag", category: "camp_machine", description: "+2 Agility (30m)", specialBonus: { agi: 2 } },
  { id: "camp-bed-kindred", label: "Vault Bed + Ally Station", category: "camp_machine", description: "Kindred Spirit Buff (+5% XP for 3 Hours)", xpBonusPct: 5 },
  { id: "camp-weight-bench", label: "Weight Bench", category: "camp_machine", description: "+2 Strength (30m)", specialBonus: { str: 2 }, damageMultiplier: 1.04 },
], (c) => c.label);

// 9. ALL COMPANION BUFFS (Alphanumerically Sorted)
export const ALL_COMPANIONS: Fallout76BuffDef[] = sortAlphanumerically([
  { id: "comp-adelaide", label: "Adelaide (CAMP Ally)", category: "companion", description: "Kindred Spirit Bed (+5% XP 3 hrs) & +15 Dmg vs Robots", xpBonusPct: 5, damageMultiplier: 1.15 },
  { id: "comp-joey-bello", label: "Joey Bello Comedic Relief", category: "companion", description: "+2 CHA, +2 LCK (1 Hour)", specialBonus: { cha: 2, lck: 2 } },
  { id: "comp-leo-petrova", label: "Leo Petrova Nuka-Cranberry Buff", category: "companion", description: "+5% XP Bonus (1 Hour)", xpBonusPct: 5 },
  { id: "comp-steven-scarberry", label: "Steven Scarberry Blessing", category: "companion", description: "+5% XP Bonus (1 Hour)", xpBonusPct: 5 },
  { id: "comp-yasmin", label: "Yasmin Gourmand Feast", category: "companion", description: "+2 STR, +2 END (1 Hour)", specialBonus: { str: 2, end: 2 } },
], (c) => c.label);
