import { describe, it, expect } from "vitest";
import { deriveArchetypeTags } from "@/lib/builder/transmissions-engine";
import type { BuilderPayload } from "@/lib/builder/types";

describe("deriveArchetypeTags", () => {
  it("derives Human, Commando, Bloodied, and Unyielding tags for a Bloodied Stealth Commando build", () => {
    const payload: Partial<BuilderPayload> = {
      ghoul: false,
      equipmentKind: "weapon",
      basePieceId: "the-fixer",
      weaponSub: "ranged",
      legendaryModIds: ["bloodied", "explosive", "less-vats-ap-cost-weapon", null],
      armorLegendaryModIds: [
        ["unyielding", "powered", "sentinel"],
        ["unyielding", "powered", "sentinel"],
        ["unyielding", "powered", "sentinel"],
        ["unyielding", "powered", "sentinel"],
        ["unyielding", "powered", "sentinel"],
      ],
    };

    const tags = deriveArchetypeTags(payload);
    expect(tags).toContain("Human");
    expect(tags).toContain("Commando");
    expect(tags).toContain("Rifleman");
    expect(tags).toContain("Bloodied");
    expect(tags).toContain("Unyielding");
    expect(tags).not.toContain("Ghoul");
    expect(tags).not.toContain("Power Armor");
  });

  it("derives Ghoul, Power Armor, Heavy Gunner, and Anti-Armor tags for a Heavy Gunner Ghoul build", () => {
    const payload: Partial<BuilderPayload> = {
      ghoul: true,
      equipmentKind: "powerArmor",
      basePieceId: "cremator",
      legendaryModIds: ["anti-armor", "faster-fire-rate", "durability-50", null],
      armorLegendaryModIds: [
        ["overeater", "powered", "sentinel"],
        ["overeater", "powered", "sentinel"],
      ],
    };

    const tags = deriveArchetypeTags(payload);
    expect(tags).toContain("Ghoul");
    expect(tags).toContain("Power Armor");
    expect(tags).toContain("Tank");
    expect(tags).toContain("Heavy Gunner");
    expect(tags).toContain("Anti-Armor");
    expect(tags).toContain("Overeater's");
    expect(tags).not.toContain("Human");
  });

  it("derives Melee tags for Chainsaw or Melee weapon class", () => {
    const payload: Partial<BuilderPayload> = {
      ghoul: false,
      equipmentKind: "weapon",
      basePieceId: "auto-axe",
      weaponSub: "melee",
      legendaryModIds: ["vampire", "power-attack-damage-40", "strength-3-weapon", null],
    };

    const tags = deriveArchetypeTags(payload);
    expect(tags).toContain("Human");
    expect(tags).toContain("Melee");
    expect(tags).toContain("Vampire's");
  });

  it("derives Shotgunner and Quad tags for Cold Shoulder shotgun", () => {
    const payload: Partial<BuilderPayload> = {
      ghoul: false,
      equipmentKind: "weapon",
      basePieceId: "cold-shoulder",
      legendaryModIds: ["quad", "vats-enhanced", "reload-speed-15", null],
    };

    const tags = deriveArchetypeTags(payload);
    expect(tags).toContain("Shotgunner");
    expect(tags).toContain("Quad");
  });
});
