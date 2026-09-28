import { describe, it, expect } from "vitest";
import { vitalsBarModel } from "./vitals-bars";

describe("vitalsBarModel", () => {
  it("human: rads cap the usable pool from the right, on one bar", () => {
    expect(vitalsBarModel({ isGhoul: false, healthPct: 100, radsPct: 30 })).toEqual({
      kind: "human",
      hpPct: 100,
      usableHpPct: 70,
      radsPct: 30,
    });
    // Low HP below the cap: the HP segment is the smaller of the two.
    expect(vitalsBarModel({ isGhoul: false, healthPct: 20, radsPct: 30 })).toMatchObject({ usableHpPct: 20 });
    // Rads never squeeze the pool under the 5 % floor.
    expect(vitalsBarModel({ isGhoul: false, healthPct: 100, radsPct: 100 })).toMatchObject({ usableHpPct: 5 });
  });

  it("ghoul: glow is its own full-scale bar and is never clipped by HP", () => {
    const m = vitalsBarModel({ isGhoul: true, healthPct: 60, glowPct: 60 });
    expect(m).toEqual({ kind: "ghoul", hpPct: 60, glowPct: 60 });
    expect(vitalsBarModel({ isGhoul: true, healthPct: 100, glowPct: 100 })).toEqual({
      kind: "ghoul",
      hpPct: 100,
      glowPct: 100,
    });
  });

  it("treats missing or out-of-range values as 0 / clamped", () => {
    expect(vitalsBarModel({ isGhoul: true, healthPct: 50 })).toMatchObject({ glowPct: 0 });
    expect(vitalsBarModel({ isGhoul: false, healthPct: 500, radsPct: -10 })).toEqual({
      kind: "human",
      hpPct: 100,
      usableHpPct: 100,
      radsPct: 0,
    });
  });
});
