import { describe, expect, it } from "vitest";
import { sandboxMutationMathLayer, strangeInNumbersBenefitMultiplier } from "./sandbox-mutations";

describe("strangeInNumbersBenefitMultiplier", () => {
  it("is 1 with zero teammates", () => {
    expect(strangeInNumbersBenefitMultiplier(0)).toBe(1);
  });
  it("is 2 with four mutated teammates", () => {
    expect(strangeInNumbersBenefitMultiplier(4)).toBe(2);
  });
  it("clamps above four", () => {
    expect(strangeInNumbersBenefitMultiplier(99)).toBe(2);
  });
});

describe("sandboxMutationMathLayer + Strange in Numbers", () => {
  it("doubles Egg Head INT benefit with four SiN teammates", () => {
    const noSin = sandboxMutationMathLayer(["egg-head"], false, {});
    const sin = sandboxMutationMathLayer(["egg-head"], false, { strangeInNumbersMutatedTeammates: 4 });
    expect(noSin?.int).toBe(6);
    expect(sin?.int).toBe(12);
  });

  it("does not scale penalties", () => {
    const sin = sandboxMutationMathLayer(["egg-head"], false, { strangeInNumbersMutatedTeammates: 4 });
    expect(sin?.str).toBe(-3);
    expect(sin?.end).toBe(-3);
  });
});
