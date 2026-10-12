import { describe, expect, it } from "vitest";
import { hasHiddenFraction, pipboySpecial } from "./pipboy-special";

describe("pipboySpecial", () => {
  it("drops the fraction toward zero like the in-game stat sheet", () => {
    expect(pipboySpecial(7.5)).toBe(7); // Egg Head +6 × Strange in Numbers 1.25 on a base of 1
    expect(pipboySpecial(2.5)).toBe(2); // Herd Mentality +2 × 1.25
    expect(pipboySpecial(14)).toBe(14);
    expect(pipboySpecial(0.75)).toBe(0);
    expect(pipboySpecial(-1.5)).toBe(-1);
    expect(pipboySpecial(Number.NaN)).toBe(0);
  });

  it("flags values whose fraction the readout hides", () => {
    expect(hasHiddenFraction(7.5)).toBe(true);
    expect(hasHiddenFraction(7)).toBe(false);
    expect(hasHiddenFraction(Number.NaN)).toBe(false);
  });
});
