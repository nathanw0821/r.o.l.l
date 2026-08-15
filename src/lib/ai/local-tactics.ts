export type BuildAdvicePayload = {
  special: Record<string, number>;
  perks: Array<{ name: string; rank: number; special: string }>;
};

/**
 * Fast, 0-token local tactical analysis engine for Fallout 76 builds.
 * Evaluates perk synergies, DR caps, AP refresh, and SPECIAL allocation in 0ms on the client.
 */
export function getLocalTacticalAdvice(payload: BuildAdvicePayload): string | null {
  const { special, perks } = payload;
  const perkNames = new Set(perks.map((p) => p.name.toLowerCase()));

  const str = special.S || special.str || 1;
  const per = special.P || special.per || 1;
  const end = special.E || special.end || 1;
  const cha = special.C || special.cha || 1;
  const int = special.I || special.int || 1;
  const agi = special.A || special.agi || 1;
  const lck = special.L || special.lck || 1;

  // 1. High Charisma without Strange in Numbers / Tenderizer
  if (cha >= 4 && !perkNames.has("tenderizer")) {
    return "Vault-Tec Tip: With your Charisma investment, equipping Tenderizer makes targets receive up to +10% more damage from all sources for 10 seconds.";
  }

  // 2. High Strength without Barbarian
  if (str >= 10 && !perkNames.has("barbarian")) {
    return `Vault-Tec Tip: With ${str} Strength allocated, equipping Rank 3 Barbarian will grant +${Math.min(80, str * 4)} extra Damage Resistance for your build.`;
  }

  // 2. High Agility without Evasive
  if (agi >= 10 && !perkNames.has("evasive")) {
    return `Vault-Tec Tip: With ${agi} Agility, equipping Evasive will add +${Math.min(45, agi * 3)} Damage Resistance and Energy Resistance.`;
  }

  // 3. Low Health / Bloodied synergies without Nerd Rage
  const hasBloodiedOrUnyielding = Array.from(perkNames).some(
    (n) => n.includes("radicool") || n.includes("serendipity")
  );
  if (hasBloodiedOrUnyielding && !perkNames.has("nerd rage!")) {
    return "Vault-Tec Tip: For low-health irradiated builds, equipping Rank 3 Nerd Rage! provides +40 DR, +20% Damage, and +15% AP Refresh below 20% HP.";
  }

  // 4. VATS Critical builds without Starched Genes / Class Freak
  if (lck >= 10 && !perkNames.has("starched genes")) {
    return "Vault-Tec Tip: High-Luck mutations setups should equip Rank 2 Starched Genes to prevent RadAway from curing active mutations.";
  }

  // 5. Heavy Gunner / PA without Stabilized
  const hasHeavyGunner = Array.from(perkNames).some((n) => n.includes("heavy gunner"));
  if (hasHeavyGunner && int >= 3 && !perkNames.has("stabilized")) {
    return "Vault-Tec Tip: Heavy Gunner setups in Power Armor benefit immensely from Rank 3 Stabilized (+45% armor penetration & tighter accuracy).";
  }

  // 6. High Perception Commando / Rifleman without Tank Killer
  const hasRiflePerks = Array.from(perkNames).some(
    (n) => n.includes("commando") || n.includes("rifleman")
  );
  if (hasRiflePerks && per >= 3 && !perkNames.has("tank killer")) {
    return "Vault-Tec Tip: Equip Rank 3 Tank Killer for +36% armor penetration and a 9% stagger chance on all rifle/commando attacks.";
  }

  // 7. General High Endurance recommendation
  if (end >= 8 && !perkNames.has("fireproof")) {
    return "Vault-Tec Tip: With high Endurance, equipping Rank 3 Fireproof reduces incoming explosion and fire damage by 45%.";
  }

  return null;
}
