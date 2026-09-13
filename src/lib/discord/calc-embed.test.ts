import { describe, it, expect } from "vitest";
import {
  buildCalcEmbed,
  buildDamageEmbed,
  buildVatsEmbed,
  buildCritEmbed,
  parsePercentList,
  optionsToRecord,
  PIPBOY_AMBER,
  PIPBOY_GREEN
} from "./calc-embed";

describe("/calc embed builders", () => {
  it("parses percent lists leniently and rejects garbage", () => {
    expect(parsePercentList("50, 36")).toEqual([50, 36]);
    expect(parsePercentList("50% 36%")).toEqual([50, 36]);
    expect(parsePercentList(undefined)).toEqual([]);
    expect(parsePercentList("")).toEqual([]);
    expect(parsePercentList("abc")).toBeNull();
    expect(parsePercentList("150")).toBeNull();
  });

  it("flattens Discord option arrays", () => {
    expect(optionsToRecord([{ name: "base", value: 50 }, { name: "lvc", value: true }])).toEqual({ base: 50, lvc: true });
    expect(optionsToRecord(undefined)).toEqual({});
  });

  it("damage: runs the full Earle pipeline with golden numbers in the readout", () => {
    const embed = buildDamageEmbed({ base: 380, target_dr: 350, penetration: "36", flat_reduction: 80 });
    expect(embed.color).toBe(PIPBOY_GREEN);
    expect(embed.fields).toHaveLength(3);
    expect(embed.fields[1].value).toContain("224 DR remaining");
    expect(embed.fields[2].value).toContain("60.68%");
    expect(embed.fields[2].value).toContain("46.12 DELIVERED");
    expect(embed.description).toContain("**46.12** delivered");
  });

  it("damage: hybrid scaling benchmark and cap flag", () => {
    const paper = buildDamageEmbed({ base: 50, additive: 160, multipliers: "40, 10" });
    expect(paper.fields[0].value).toContain("= 200.2 DMG");
    expect(paper.fields).toHaveLength(1);

    const capped = buildDamageEmbed({ base: 100, target_dr: 100, penetration: "50,50,50,50,50" });
    expect(capped.fields[1].value).toContain("[ENGINE CAP 90%]");
    expect(capped.fields[1].value).toContain("= 10 DR remaining");
  });

  it("damage: rejects bad input with an amber fault embed", () => {
    expect(buildDamageEmbed({}).color).toBe(PIPBOY_AMBER);
    expect(buildDamageEmbed({ base: 50, multipliers: "lots" }).color).toBe(PIPBOY_AMBER);
  });

  it("vats: 30 AP with -30% mods and 25 LVC reads 15.8 AP", () => {
    const embed = buildVatsEmbed({ base_ap: 30, mod_reduction: 30, lvc: true });
    expect(embed.fields[0].value).toContain("= 15.8 AP / shot");
    expect(buildVatsEmbed({ base_ap: 0 }).color).toBe(PIPBOY_AMBER);
  });

  it("crit: Luck 33 + Savvy 3 announces every-other-shot", () => {
    const embed = buildCritEmbed({ luck: 33, savvy: 3 });
    expect(embed.description).toContain("EVERY-OTHER-SHOT");
    expect(embed.fields[0].value).toContain("1 crit every 2 shots");
    expect(buildCritEmbed({ luck: 20 }).description).toContain("**2** hits");
  });

  it("dispatches by subcommand and returns null for unknown", () => {
    expect(buildCalcEmbed("damage", { base: 10 })?.title).toContain("DAMAGE");
    expect(buildCalcEmbed("vats", { base_ap: 10 })?.title).toContain("V.A.T.S.");
    expect(buildCalcEmbed("crit", { luck: 10 })?.title).toContain("CRITICAL");
    expect(buildCalcEmbed("nope", {})).toBeNull();
  });
});
