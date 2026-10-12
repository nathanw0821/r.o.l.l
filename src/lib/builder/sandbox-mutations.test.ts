import { describe, expect, it } from "vitest";
import { sanitizeMutationIds } from "./sandbox-mutations";
import { isStrangeInNumbersActive, sandboxMutationMathLayer, strangeInNumbersBenefitMultiplier } from "./sandbox-mutations";

// Patch 70 card: "Positive mutation effects are +25% stronger if teammates are mutated too."
// One qualifying teammate gives the full, flat bonus (Nathan, 2026-10-12).
describe("strangeInNumbersBenefitMultiplier", () => {
  it("is 1 with zero teammates", () => {
    expect(strangeInNumbersBenefitMultiplier(0)).toBe(1);
  });
  it("is a flat 1.25 with one mutated teammate", () => {
    expect(strangeInNumbersBenefitMultiplier(1)).toBe(1.25);
  });
  it("does not grow with more teammates", () => {
    expect(strangeInNumbersBenefitMultiplier(4)).toBe(1.25);
    expect(strangeInNumbersBenefitMultiplier(99)).toBe(1.25);
  });
});

describe("isStrangeInNumbersActive", () => {
  const card = [{ cardId: "strange-in-numbers", rank: 1 }];
  it("needs the card, a mutated teammate and a mutation of your own", () => {
    expect(isStrangeInNumbersActive(card, true, ["egg-head"])).toBe(true);
    expect(isStrangeInNumbersActive([], true, ["egg-head"])).toBe(false);
    expect(isStrangeInNumbersActive(card, false, ["egg-head"])).toBe(false);
    expect(isStrangeInNumbersActive(card, true, [])).toBe(false);
  });
});

describe("sandboxMutationMathLayer + Strange in Numbers", () => {
  it("scales Egg Head INT benefit by 1.25", () => {
    const noSin = sandboxMutationMathLayer(["egg-head"], false, {});
    const sin = sandboxMutationMathLayer(["egg-head"], false, { strangeInNumbersMutatedTeammates: 1 });
    expect(noSin?.int).toBe(6);
    expect(sin?.int).toBe(7.5);
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

describe("sanitizeMutationIds", () => {
  it("keeps known ids once, in order, and drops the rest", () => {
    expect(sanitizeMutationIds(["marsupial", "nope", "egg-head", "marsupial", null, undefined])).toEqual([
      "marsupial",
      "egg-head",
    ]);
    expect(sanitizeMutationIds([])).toEqual([]);
  });
});
