import { describe, expect, it } from "vitest";
import { getArmorSetBonusTags } from "@/lib/builder/armor-set-bonuses";

describe("armor set bonuses", () => {
  it("tags a full Civil Engineer set with both printed bonuses", () => {
    const tags = getArmorSetBonusTags(["civil-engineer", "civil-engineer", "civil-engineer", "civil-engineer", "civil-engineer"]);
    expect(tags).toEqual([
      "Civil Engineer set: Weapons break 35% slower",
      "Civil Engineer set: 10% chance to deal 150 fire damage to melee attackers",
    ]);
  });
  it("gives nothing for mixed, partial or unknown sets", () => {
    expect(getArmorSetBonusTags(["civil-engineer", "civil-engineer", "secret-service", "civil-engineer", "civil-engineer"])).toEqual([]);
    expect(getArmorSetBonusTags(["civil-engineer", "civil-engineer", "civil-engineer", "civil-engineer"])).toEqual([]);
    expect(getArmorSetBonusTags(["secret-service", "secret-service", "secret-service", "secret-service", "secret-service"])).toEqual([]);
    expect(getArmorSetBonusTags(null)).toEqual([]);
  });
});
