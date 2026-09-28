import { describe, expect, it } from "vitest";

import datamine from "@/data/truth/legendary-datamine-p70.json";
import { LEGENDARY_EFFECT_MODELS } from "@/lib/truth/legendary-effect-model";

type Curve = { name: string; points: [number, number][] | null };
type Prop = { property: string; function: string; target: string | null; value: number | null; curve?: Curve };
type Eff = { effect: string; magnitude: number; durationSeconds: number; curve?: Curve };
type Entry = { name: string; star: number; appliesTo: string[]; properties: Prop[]; effects: Eff[] };

const effects = datamine.effects as unknown as Record<string, Entry>;

function prop(key: string, target: string): Prop {
  const found = effects[key]?.properties.find((p) => p.target === target || p.property === target);
  if (!found) throw new Error(`${key} has no property ${target}`);
  return found;
}

function curveOf(key: string, name: string): [number, number][] {
  for (const e of effects[key]?.effects ?? []) {
    if (e.curve?.name === name && e.curve.points) return e.curve.points;
  }
  throw new Error(`${key} has no curve ${name}`);
}

describe("legendary datamine (Patch 70 client data)", () => {
  it("is stamped with the build it was read from", () => {
    expect(datamine.source.patch).toBe(70);
    expect(datamine.source.build).toBe("1.7.26.13");
  });

  it("stores numbers only: no game text leaks into the file", () => {
    const text = JSON.stringify(datamine);
    expect(text).not.toMatch(/lstring|<Error|<\\+?MAG/);
    for (const entry of Object.values(effects)) {
      expect([1, 2, 3, 4]).toContain(entry.star);
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });

  it("reproduces the settled values it was calibrated against", () => {
    // Bloodied: +130% at 5% health, none at full health.
    expect(curveOf("bloodied-1star", "CT_Legendary_Weapon_DamageInverseHealth")).toEqual([
      [0.05, 130],
      [1, 0],
    ]);
    // Junkie's: +10% per addiction, 100% at ten.
    const junkie = curveOf("junkies-1star", "CT_Legendary_Weapon_DamageAddiction");
    expect(junkie[10]).toEqual([10, 100]);
    // Two Shot: one extra projectile and +75% damage.
    expect(prop("two-shot-1star", "NumProjectiles").value).toBe(1);
    expect(prop("two-shot-1star", "DamageBonusMult").value).toBe(0.75);
    // 50% / 25% / 100% properties.
    expect(prop("severing-4star", "STAT_DmgVsBleeding").value).toBe(50);
    expect(prop("bullys-4star", "STAT_DmgPerCrippled").value).toBe(25);
    expect(prop("vipers-4star", "STAT_DmgVsPoisoned").value).toBe(50);
    expect(prop("pyromaniacs-4star", "STAT_DmgVsBurning").value).toBe(50);
    expect(prop("stalkers-1star", "STAT_SneakAttackBonus").value).toBe(100);
  });

  it("carries the slayer curves and the weak-spot value", () => {
    expect(prop("assassins-1star", "STAT_DmgVsHumans").curve?.points?.[0]).toEqual([1, 50]);
    expect(prop("pin-pointers-4star", "STAT_DmgVsWeakSpot").value).toBe(20);
  });

  it("agrees with every legendary-effect-model row it can be matched to", () => {
    // Additive rows added from this file must carry the datamined magnitude.
    const model = LEGENDARY_EFFECT_MODELS;
    expect(model["assassins"]?.value).toBe(0.5);
    expect(model["pin-pointers"]?.value).toBe(
      (prop("pin-pointers-4star", "STAT_DmgVsWeakSpot").value as number) / 100
    );
    expect(model["severing"]?.value).toBe((prop("severing-4star", "STAT_DmgVsBleeding").value as number) / 100);
  });

  it("keeps unresolved questions visible instead of guessing them", () => {
    const names = datamine.unresolved.map((u) => u.effect);
    expect(names).toContain("Cavalier's");
  });
});
