import { describe, expect, it } from "vitest";
import { getPerkCardById } from "@/lib/perks/catalog";
import { SWITCH_PERK_DEPENDENCIES, equippedSwitchPerkNames } from "./switch-perk-hints";

describe("Vitals switch dependency hints", () => {
  it("every listed card id exists in the perk catalog", () => {
    for (const ids of Object.values(SWITCH_PERK_DEPENDENCIES)) {
      for (const id of ids) expect(getPerkCardById(id)?.id, id).toBe(id);
    }
  });

  it("names only the equipped cards the switch changes, nothing when none are equipped", () => {
    expect(equippedSwitchPerkNames("diseased", [])).toEqual([]);
    expect(equippedSwitchPerkNames("diseased", ["evasive", "strong-back"])).toEqual([]);
    expect(equippedSwitchPerkNames("diseased", ["thirst-quencher", "lifegiver", "iron-stomach"])).toEqual([
      "Iron Stomach",
      "Thirst Quencher",
    ]);
    expect(equippedSwitchPerkNames("overEncumbered", ["packin-light", "iron-stomach"])).toEqual(["Packin' Light"]);
    expect(equippedSwitchPerkNames("overEncumbered", ["evasive", "packin-light"])).toEqual(["Evasive", "Packin' Light"]);
  });
});
