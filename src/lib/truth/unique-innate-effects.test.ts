import { describe, expect, it } from "vitest";

import innate from "@/data/truth/unique-innate-effects-p70.json";
import officialUniques from "@/data/truth/unique-items-official-p70.json";
import uniqueItems from "@/data/truth/unique-items.json";

type Curve = { name: string; points: [number, number][] | null };
type Effect = { effect: string; magnitude: number | null; durationSeconds: number | null; curve?: Curve };
type Unique = {
  name: string;
  officialEffect: string;
  mod: string;
  enchantments: { enchantment: string; effects: Effect[] }[];
};

const uniques = innate.uniques as unknown as Record<string, Unique>;

function firstEffect(id: string): Effect {
  const found = uniques[id]?.enchantments[0]?.effects[0];
  if (!found) throw new Error(`no effect for ${id}`);
  return found;
}

describe("unique weapon innate effects (Patch 70 client data)", () => {
  it("is stamped with the build it was read from", () => {
    expect(innate.source.patch).toBe(70);
    expect(innate.source.build).toBe("1.7.26.13");
  });

  it("closes the Drill Fist and Red Terror fire-damage gaps", () => {
    const drill = firstEffect("drill-fist");
    expect(drill.effect).toBe("RD01_Weapon_DrillFist_FireDamageEffect");
    expect(drill.magnitude).toBe(18);
    expect(drill.durationSeconds).toBe(4);
    // Level scaling: 18 at level 1 up to 59 at level 50.
    expect(drill.curve?.points?.[0]).toEqual([1, 18]);
    expect(drill.curve?.points?.at(-1)).toEqual([50, 59]);

    const terror = firstEffect("red-terror");
    expect(terror.magnitude).toBe(5);
    expect(terror.durationSeconds).toBe(3);
    expect(terror.curve?.points?.at(-1)).toEqual([50, 17]);
  });

  it("uses R.O.L.L.'s own unique ids and the official effect names", () => {
    const ids = new Set((uniqueItems as { id: string }[]).map((u) => u.id));
    const official = new Map(
      (officialUniques.weapons as { name: string; effect: string }[]).map((w) => [w.name, w.effect])
    );
    for (const [id, entry] of Object.entries(uniques)) {
      expect(ids.has(id), `${id} is not a unique-items id`).toBe(true);
      expect(official.get(entry.name), entry.name).toBe(entry.officialEffect);
    }
  });

  it("agrees with the official damage type for every matched unique", () => {
    const type: Record<string, RegExp> = {
      "Fire Damage": /fire|burn|flame/i,
      "Poison Damage": /poison/i,
      "Bleed Damage": /bleed/i,
    };
    for (const entry of Object.values(uniques)) {
      const pattern = type[entry.officialEffect];
      if (!pattern) continue;
      const text = entry.enchantments.flatMap((e) => [e.enchantment, ...e.effects.map((x) => x.effect)]).join(" ");
      expect(text, entry.name).toMatch(pattern);
    }
  });

  it("records that the V63 Laser Carbine is only a paint and the Vault 63 rifle refracts 63%", () => {
    expect(innate.notes.v63LaserCarbine).toMatch(/paint/i);
    expect(innate.notes.vault63LaserRifle).toContain("63");
  });
});
