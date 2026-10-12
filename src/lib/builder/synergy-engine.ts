/**
 * Smart Synergy Recommendation Engine for R.O.L.L.
 * Maps weapons and armor sets to high-synergy perk cards, mods, and mutations.
 * Card ids and the reason / boost texts follow the Patch 70 catalog (src/data/perk-cards.json,
 * max-rank text); cards that left the game (Commando, Fireproof) were removed 2026-10-12.
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
    { id: "tank-killer", name: "Tank Killer", category: "perk", reason: "Ranged weapons ignore 40% of the target's armor", boostLabel: "40% Armor Pen" },
    { id: "concentrated-fire", name: "Concentrated Fire", category: "perk", reason: "Focus fire: +3% accuracy and damage per shot", boostLabel: "+3%/shot" },
    { id: "covert-operative", name: "Covert Operative", category: "perk", reason: "+50% sneak attack damage on ranged attacks (2.5x total)", boostLabel: "2.5x Sneak" },
    { id: "action-boy", name: "Action Boy/Girl", category: "perk", reason: "Accelerates AP refresh rate for VATS", boostLabel: "+45% AP Regen" },
  ],
  handmade: [
    { id: "tank-killer", name: "Tank Killer", category: "perk", reason: "Ranged weapons ignore 40% of the target's armor", boostLabel: "40% Armor Pen" },
    { id: "ground-pounder", name: "Ground Pounder", category: "perk", reason: "Small guns reload 30% faster, +30% hip-fire accuracy", boostLabel: "+30% Reload" },
  ],
  railway: [
    { id: "better-criticals", name: "Better Criticals", category: "perk", reason: "VATS criticals deal +100% damage", boostLabel: "+100% Crit Dmg" },
    { id: "critical-savvy", name: "Critical Savvy", category: "perk", reason: "VATS criticals consume only 55% crit meter", boostLabel: "Crit Every 2nd Shot" },
  ],
  cremator: [
    { id: "bullet-storm", name: "Bullet Storm", category: "perk", reason: "+9% damage per 30 ammo spent, 10 stacks", boostLabel: "Up to +90% Dmg" },
    { id: "demolition-expert", name: "Demolition Expert", category: "perk", reason: "Explosives do +60% damage", boostLabel: "+60% Explosive" },
    { id: "grenadier", name: "Grenadier", category: "perk", reason: "Doubles explosive area of effect radius", boostLabel: "2x Blast Radius" },
  ],
  "holy-fire": [
    { id: "bullet-storm", name: "Bullet Storm", category: "perk", reason: "+9% damage per 30 ammo spent, 10 stacks", boostLabel: "Up to +90% Dmg" },
    { id: "stabilized", name: "Stabilized", category: "perk", reason: "Big guns gain 30% accuracy, double in Power Armor", boostLabel: "+60% PA Accuracy" },
    { id: "one-gun-army", name: "One Gun Army", category: "perk", reason: "Heavy guns: 12% stagger chance and +75% limb damage", boostLabel: "12% Stagger" },
  ],
  "gatling-plasma": [
    { id: "bullet-storm", name: "Bullet Storm", category: "perk", reason: "+9% damage per 30 ammo spent, 10 stacks", boostLabel: "Up to +90% Dmg" },
    { id: "tightly-wound", name: "Tightly Wound", category: "perk", reason: "Weapons spin up 60% faster", boostLabel: "60% Spin-up" },
    { id: "stabilized", name: "Stabilized", category: "perk", reason: "Big guns gain 30% accuracy, double in Power Armor", boostLabel: "+60% PA Accuracy" },
    { id: "batteries-included", name: "Batteries Included", category: "perk", reason: "Energy weapon ammo weighs 90% less", boostLabel: "-90% Ammo Weight" },
  ],
  chainsaw: [
    { id: "slugger", name: "Slugger", category: "perk", reason: "Melee weapons do +30% damage to crippled targets", boostLabel: "+30% vs Crippled" },
    { id: "incisor", name: "Incisor", category: "perk", reason: "Melee and Fists weapons ignore 75% of the target's armor", boostLabel: "75% Armor Pen" },
    { id: "makeshift-warrior", name: "Makeshift Warrior", category: "perk", reason: "Melee weapons break 80% slower", boostLabel: "+80% Durability" },
    { id: "martial-artist", name: "Martial Artist", category: "perk", reason: "Swing melee weapons 30% faster, weigh 60% less", boostLabel: "+30% Speed" },
  ],
};

const ARMOR_SYNERGIES: Record<string, SynergyItem[]> = {
  "civil-engineer": [
    { id: "white-knight", name: "White Knight", category: "perk", reason: "Armor breaks 60% slower and is cheaper to repair", boostLabel: "+60% Durability" },
  ],
  "secret-service": [
    { id: "ironclad", name: "Ironclad", category: "perk", reason: "Armor provides 25% more protection, double with a matching set", boostLabel: "+50% Armor" },
    { id: "funky-duds", name: "Funky Duds", category: "perk", reason: "+200 Poison Resistance with full set", boostLabel: "+200 PR" },
  ],
};

export function getEquipmentSynergies(equipId: string): SynergyItem[] {
  const norm = equipId.toLowerCase().replace(/^armor-set-/, "").replace(/-torso$/, "");
  return WEAPON_SYNERGIES[norm] || ARMOR_SYNERGIES[norm] || [
    { id: "bloody-mess", name: "Bloody Mess", category: "perk", reason: "Bleeding enemies killed explode based on Luck", boostLabel: "Corpse Explode" },
    { id: "starched-genes", name: "Starched Genes", category: "perk", reason: "RadAway never cures mutations, rads never add one", boostLabel: "Mutation Shield" },
  ];
}
