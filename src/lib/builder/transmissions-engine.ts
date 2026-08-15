import type { BuilderPayload } from "@/lib/builder/types";

export type TransmissionSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  author: {
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
  isGhoul: boolean;
  equipmentKind: "weapon" | "armor" | "powerArmor" | "underarmor";
  basePieceId: string;
  weaponSub: string | null;
  legendaryModIds: (string | null)[];
  specials: {
    S: number;
    P: number;
    E: number;
    C: number;
    I: number;
    A: number;
    L: number;
  };
  equippedPerkCount: number;
  mutationCount: number;
  archetypeTags: string[];
};

/**
 * Derives archetype tags from a build's payload (e.g. Bloodied, Commando, Power Armor, Ghoul, etc.).
 */
export function deriveArchetypeTags(payload: Partial<BuilderPayload>): string[] {
  const tags = new Set<string>();

  if (payload.ghoul) {
    tags.add("Ghoul");
  } else {
    tags.add("Human");
  }

  if (payload.equipmentKind === "powerArmor") {
    tags.add("Power Armor");
    tags.add("Tank");
  } else if (payload.equipmentKind === "armor") {
    tags.add("Regular Armor");
  }

  // Check weapon mods for legendary effects
  const mods = payload.legendaryModIds || [];
  if (mods.some((m) => m?.toLowerCase().includes("bloodied"))) {
    tags.add("Bloodied");
  }
  if (mods.some((m) => m?.toLowerCase().includes("anti-armor") || m?.toLowerCase().includes("antiarmor"))) {
    tags.add("Anti-Armor");
  }
  if (mods.some((m) => m?.toLowerCase().includes("quad"))) {
    tags.add("Quad");
  }
  if (mods.some((m) => m?.toLowerCase().includes("vampire"))) {
    tags.add("Vampire's");
  }
  if (mods.some((m) => m?.toLowerCase().includes("aristocrat"))) {
    tags.add("Aristocrat's");
  }

  // Check weapon type
  const baseId = payload.basePieceId?.toLowerCase() || "";
  if (baseId.includes("fixer") || baseId.includes("handmade") || baseId.includes("railway") || baseId.includes("assault")) {
    tags.add("Commando");
    tags.add("Rifleman");
  } else if (baseId.includes("plasma-caster") || baseId.includes("holy-fire") || baseId.includes("cremator") || baseId.includes("gatling") || baseId.includes("50cal") || baseId.includes("flamer")) {
    tags.add("Heavy Gunner");
  } else if (baseId.includes("axe") || baseId.includes("chainsaw") || baseId.includes("hammer") || baseId.includes("gauntlet") || baseId.includes("sword") || payload.weaponSub === "melee") {
    tags.add("Melee");
  } else if (baseId.includes("shotgun") || baseId.includes("cold-shoulder")) {
    tags.add("Shotgunner");
  } else if (baseId.includes("alien-blaster") || baseId.includes("revolver") || baseId.includes("10mm")) {
    tags.add("Gunslinger");
  }

  // Check unyielding in armor
  if (payload.armorLegendaryModIds?.some((row) => row?.some((m) => m?.toLowerCase().includes("unyielding")))) {
    tags.add("Unyielding");
  }
  if (payload.armorLegendaryModIds?.some((row) => row?.some((m) => m?.toLowerCase().includes("overeater")))) {
    tags.add("Overeater's");
  }

  return Array.from(tags);
}
