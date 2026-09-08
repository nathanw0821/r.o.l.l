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

describe("sandboxMutationMathLayer + Class Freak", () => {
  it("mitigates negative penalties by 25% at rank 1", () => {
    const cf1 = sandboxMutationMathLayer(["egg-head"], false, { classFreakRank: 1 });
    expect(cf1?.str).toBe(-2.25);
    expect(cf1?.end).toBe(-2.25);
    expect(cf1?.int).toBe(6);
  });

  it("mitigates negative penalties by 50% at rank 2", () => {
    const cf2 = sandboxMutationMathLayer(["egg-head"], false, { classFreakRank: 2 });
    expect(cf2?.str).toBe(-1.5);
    expect(cf2?.end).toBe(-1.5);
  });

  it("mitigates negative penalties by 75% at rank 3", () => {
    const cf3 = sandboxMutationMathLayer(["egg-head"], false, { classFreakRank: 3 });
    expect(cf3?.str).toBe(-0.75);
    expect(cf3?.end).toBe(-0.75);
  });

  it("leaves penalties at 0 if ignorePenalties is true even with Class Freak", () => {
    const res = sandboxMutationMathLayer(["egg-head"], true, { classFreakRank: 3 });
    expect(res?.str).toBeUndefined();
    expect(res?.end).toBeUndefined();
    expect(res?.int).toBe(6);
  });
});

