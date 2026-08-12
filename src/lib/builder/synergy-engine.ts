/**
 * Smart Synergy Recommendation Engine for R.O.L.L.
 * Maps weapons and armor sets to high-synergy perk cards, mods, and mutations.
 */

export type SynergyItem = {
  id: string;
  name: string;
  category: "perk" | "mutation" | "mod";
  reason: string;
  boostLabel: string;
};

const WEAPON_SYNERGIES: Record<string, SynergyItem[]> = {
  fixer: [
    { id: "commando", name: "Commando", category: "perk", reason: "Increases automatic rifle damage", boostLabel: "+20% Dmg" },
    { id: "tank-killer", name: "Tank Killer", category: "perk", reason: "Ignores 36% target armor & 9% stagger", boostLabel: "36% Armor Pen" },
    { id: "concentrated-fire", name: "Concentrated Fire", category: "perk", reason: "Enables VATS headshots & stacking accuracy", boostLabel: "VATS Target" },
    { id: "covert-operative", name: "Covert Operative", category: "perk", reason: "Ranged sneak attacks deal 2.5x damage", boostLabel: "2.5x Sneak" },
    { id: "action-boy", name: "Action Boy/Girl", category: "perk", reason: "Accelerates AP refresh rate for VATS", boostLabel: "+45% AP Regen" },
  ],
  handmade: [
    { id: "commando", name: "Commando", category: "perk", reason: "Increases automatic rifle damage", boostLabel: "+20% Dmg" },
    { id: "tank-killer", name: "Tank Killer", category: "perk", reason: "Ignores 36% target armor & 9% stagger", boostLabel: "36% Armor Pen" },
    { id: "ground-pounder", name: "Ground Pounder", category: "perk", reason: "30% faster reload & better hip-fire accuracy", boostLabel: "+30% Reload" },
  ],
  railway: [
    { id: "commando", name: "Commando", category: "perk", reason: "Increases automatic rifle damage", boostLabel: "+20% Dmg" },
    { id: "better-criticals", name: "Better Criticals", category: "perk", reason: "VATS criticals deal +100% damage", boostLabel: "+100% Crit Dmg" },
    { id: "critical-savvy", name: "Critical Savvy", category: "perk", reason: "VATS criticals consume only 55% crit meter", boostLabel: "Crit Every 2nd Shot" },
  ],
  cremator: [
    { id: "heavy-gunner", name: "Heavy Gunner", category: "perk", reason: "Increases heavy energy weapon damage", boostLabel: "+20% Dmg" },
    { id: "demolition-expert", name: "Demolition Expert", category: "perk", reason: "Increases explosive blast radius damage", boostLabel: "+60% Explosive" },
    { id: "grenadier", name: "Grenadier", category: "perk", reason: "Doubles explosive area of effect radius", boostLabel: "2x Blast Radius" },
    { id: "fireproof", name: "Fireproof", category: "perk", reason: "Reduces self-inflicted explosive & fire damage", boostLabel: "60% Fire Resist" },
  ],
  "holy-fire": [
    { id: "heavy-gunner", name: "Heavy Gunner", category: "perk", reason: "Increases flamer damage", boostLabel: "+20% Dmg" },
    { id: "stabilized", name: "Stabilized", category: "perk", reason: "45% armor penetration & accuracy in Power Armor", boostLabel: "45% PA Armor Pen" },
    { id: "one-gun-army", name: "One Gun Army", category: "perk", reason: "12% chance to stagger & cripple limbs", boostLabel: "12% Stagger" },
  ],
  "gatling-plasma": [
    { id: "heavy-gunner", name: "Heavy Gunner", category: "perk", reason: "Increases heavy plasma damage", boostLabel: "+20% Dmg" },
    { id: "stabilized", name: "Stabilized", category: "perk", reason: "45% armor penetration in Power Armor", boostLabel: "45% PA Armor Pen" },
    { id: "batteries-included", name: "Batteries Included", category: "perk", reason: "Reduces Plasma Core weight by 90%", boostLabel: "-90% Weight" },
  ],
  chainsaw: [
    { id: "slugger", name: "Slugger", category: "perk", reason: "Increases two-handed melee damage", boostLabel: "+20% Dmg" },
    { id: "incisor", name: "Incisor", category: "perk", reason: "Melee attacks ignore 75% target armor", boostLabel: "75% Armor Pen" },
    { id: "makeshift-warrior", name: "Makeshift Warrior", category: "perk", reason: "Melee weapons break 50% slower", boostLabel: "+50% Durability" },
    { id: "martial-artist", name: "Martial Artist", category: "perk", reason: "Melee attack speed increased by 30%", boostLabel: "+30% Speed" },
  ],
};

const ARMOR_SYNERGIES: Record<string, SynergyItem[]> = {
  "civil-engineer": [
    { id: "fireproof", name: "Fireproof", category: "perk", reason: "Complements Civil Engineer thermal coating", boostLabel: "60% Fire Resist" },
    { id: "white-knight", name: "White Knight", category: "perk", reason: "Reduces armor repair cost and durability loss", boostLabel: "+50% Durability" },
  ],
  "secret-service": [
    { id: "ironclad", name: "Ironclad", category: "perk", reason: "Stacks DR/ER when not in Power Armor", boostLabel: "+50 DR/ER" },
    { id: "funky-duds", name: "Funky Duds", category: "perk", reason: "+200 Poison Resistance with full set", boostLabel: "+200 PR" },
  ],
};

export function getEquipmentSynergies(equipId: string): SynergyItem[] {
  const norm = equipId.toLowerCase().replace(/^armor-set-/, "").replace(/-torso$/, "");
  return WEAPON_SYNERGIES[norm] || ARMOR_SYNERGIES[norm] || [
    { id: "bloody-mess", name: "Bloody Mess", category: "perk", reason: "Universal +15% damage bonus", boostLabel: "+15% Flat Dmg" },
    { id: "starched-genes", name: "Starched Genes", category: "perk", reason: "Protects mutations from Radaway", boostLabel: "Mutation Shield" },
  ];
}
