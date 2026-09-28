/**
 * Effect categories for perk cards, derived from the cards' own effect text (the truth-pack
 * rank descriptions), so the scoped perk picker can group by what a card does (Ranged,
 * V.A.T.S., Resistances, Stacks…) as well as by S.P.E.C.I.A.L. A card can carry several tags;
 * one that matches no rule is "misc". Rules are plain regexes over rank-1 text plus the name.
 */
export type PerkEffectTag =
  | "ranged"
  | "melee"
  | "vats"
  | "resist"
  | "ap"
  | "stacks"
  | "weight"
  | "craft"
  | "loot"
  | "stealth"
  | "consumables"
  | "team"
  | "powerArmor"
  | "glow"
  | "explosive"
  | "special"
  | "misc";

export const PERK_EFFECT_TAG_LABEL: Record<PerkEffectTag, string> = {
  ranged: "Ranged",
  melee: "Melee & unarmed",
  vats: "V.A.T.S. & crits",
  resist: "Resistances & evasion",
  ap: "Action Points",
  stacks: "Stacks",
  weight: "Weight",
  craft: "Craft & repair",
  loot: "Loot & gathering",
  stealth: "Stealth",
  consumables: "Chems, food & drink",
  team: "Team",
  powerArmor: "Power armor",
  glow: "Glow, rads & feral",
  explosive: "Explosives",
  special: "Scales with S.P.E.C.I.A.L.",
  misc: "Other",
};

export const PERK_EFFECT_TAG_ORDER: readonly PerkEffectTag[] = [
  "ranged",
  "melee",
  "vats",
  "resist",
  "ap",
  "stacks",
  "explosive",
  "stealth",
  "special",
  "glow",
  "powerArmor",
  "team",
  "consumables",
  "weight",
  "craft",
  "loot",
  "misc",
];

const RULES: ReadonlyArray<readonly [PerkEffectTag, RegExp]> = [
  ["ranged", /\b(ranged|small guns?|big guns?|heavy guns?|rifles?|pistols?|shotguns?|scoped|bows?|crossbows?|arrows?|reload|hip fire|accuracy|spin up|projectiles?|ammo spent|weak spot|ballistic weapon)\b/i],
  ["melee", /\b(melee|fists?|unarmed|bash(?:ing)?|power attacks?|swing|throwing|thrown)\b/i],
  ["vats", /v\.?a\.?t\.?s\.?|\bcriticals?\b|\bcrit(?:ical)? meter\b/i],
  ["resist", /\b(resistances?|resist|damage reduction|less damage|block(?:ing)?|evade|evasion|deflect|stagger(?:ing)?|take no damage|protection|immune)\b/i],
  ["ap", /\baction points?\b|\bAP\b/],
  ["stacks", /\b(stacks?|bullet storm|onslaught|kill streak|tenderizer)\b/i],
  ["weight", /\b(weighs?|weight|carry weight|encumbered)\b/i],
  ["craft", /\b(craft(?:ed|ing)?|repairs?|breaks? \d+% slower|durability|scrap|components?|materials|fewer materials)\b/i],
  ["loot", /\b(find more|chance to find|harvest(?:ing)?|reap|collect|caps stash|bottle caps|directional audio|extra meat|canned goods|double results)\b/i],
  ["stealth", /\b(sneak(?:ing)?|silenced|stealth(?: boys?)?|harder to detect|night vision|lose enemies)\b/i],
  ["consumables", /\b(chems?|stimpaks?|radaway|foods?|drinks?|alcohol|liquor|nuka-cola|bobbleheads?|magazines?|hunger|thirst|addict(?:ed|ion)?|eat(?:ing)?)\b/i],
  ["team", /\b(teams?|teammates?|revive[sd]?|downed)\b/i],
  ["powerArmor", /\bpower armor\b|\bfusion cores?\b/i],
  ["glow", /\bglow\b|\bferal\b|\brads?\b|\bradiation\b|\birradiated?\b|\bmutat(?:e|ions?)\b/i],
  ["explosive", /\b(explosives?|explosions?|explode|grenades?|mines?|detonate)\b/i],
  ["special", /\bbased on your (?:STR|PER|END|CHA|INT|AGI|LCK|DR)\b|\+\d+ (?:STR|PER|END|CHA|INT|AGI|LCK|Strength|Perception|Endurance|Charisma|Intelligence|Agility|Luck)\b|\bS\.P\.E\.C\.I\.A\.L\.\b/i],
];

export type PerkForTagging = { name: string; ranks: ReadonlyArray<{ description: string }> };

export function perkEffectTags(card: PerkForTagging): PerkEffectTag[] {
  const text = `${card.name}. ${card.ranks[0]?.description ?? ""}`;
  const tags = RULES.filter(([, re]) => re.test(text)).map(([tag]) => tag);
  return tags.length > 0 ? tags : ["misc"];
}

export function countPerkEffectTags(cards: ReadonlyArray<PerkForTagging>): Partial<Record<PerkEffectTag, number>> {
  const counts: Partial<Record<PerkEffectTag, number>> = {};
  for (const card of cards) {
    for (const tag of perkEffectTags(card)) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return counts;
}
