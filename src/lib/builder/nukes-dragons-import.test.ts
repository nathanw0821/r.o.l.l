import { describe, expect, it } from "vitest";
import {
  importNukesDragonsFo76CharacterUrl,
  isNukesDragonsFo76CharacterUrl,
  parseNukesDragonsPerkParam
} from "./nukes-dragons-import";

/** Golden share URL (v=2) used for regression tests — see `docs/nukes-dragons-url.md`. */
const GOLDEN_ND_URL =
  "https://nukesdragons.com/fallout-76/character?cd=kk0131000k10&ef=MgM0M5MhMaM1McM9MeMfM7M2MbMiM6M4MdM8M3&s=aa547aa&p=sd3su1sq3sx1sp10B1p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30H3ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2&lp=x94x64x74x44x84xa4&v=2";

const GOLDEN_P =
  "sd3su1sq3sx1sp10B1p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30H3ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2";

describe("parseNukesDragonsPerkParam", () => {
  it("parses golden p= with uppercase markers and multi-digit ranks", () => {
    const rows = parseNukesDragonsPerkParam(GOLDEN_P);
    const sp = rows.find((r) => r.key === "sp");
    expect(sp).toEqual({ key: "sp", tree: "s", slot: "p", rank: 10 });
    expect(rows.some((r) => r.key === "sd" && r.rank === 3)).toBe(true);
  });

  it("strips B1/H3 style segments before tokenizing (same tokens as manually lowercased canonical string)", () => {
    const fromShare = parseNukesDragonsPerkParam(GOLDEN_P);
    /** Same as share `p=` after removing `[A-Z]\\d*` markers (`B1`, `H3`). */
    const canonicalLower =
      "sd3su1sq3sx1sp10p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2";
    const manual = parseNukesDragonsPerkParam(canonicalLower);
    expect(fromShare).toEqual(manual);
  });

  it("accepts implicit rank 1 for digit slot when next token is another SPECIAL", () => {
    const rows = parseNukesDragonsPerkParam("ej30l3ee1");
    expect(rows.find((r) => r.key === "ej")).toMatchObject({ rank: 30 });
    expect(rows.find((r) => r.key === "l3")).toMatchObject({ tree: "l", slot: "3", rank: 1 });
    expect(rows.find((r) => r.key === "ee")).toMatchObject({ rank: 1 });
  });

  it("parses full golden p= into a stable token count", () => {
    expect(parseNukesDragonsPerkParam(GOLDEN_P)).toHaveLength(32);
  });
});

describe("importNukesDragonsFo76CharacterUrl", () => {
  it("accepts the golden planner URL and returns structured result", () => {
    expect(isNukesDragonsFo76CharacterUrl(GOLDEN_ND_URL)).toBe(true);
    const r = importNukesDragonsFo76CharacterUrl(GOLDEN_ND_URL);
    expect("error" in r).toBe(false);
    if ("error" in r) return;
    expect(r.special).not.toBeNull();
    expect(r.special?.str).toBe(10);
    expect(r.special?.per).toBe(10);
    expect(r.special?.end).toBe(5);
    expect(r.special?.cha).toBe(4);
    expect(r.special?.int).toBe(7);
    expect(r.special?.agi).toBe(10);
    expect(r.special?.lck).toBe(10);
    expect(r.warnings.length).toBeGreaterThanOrEqual(5);
    expect(r.warnings.some((w) => w.includes("lp="))).toBe(true);
    expect(r.warnings.some((w) => w.includes("ef="))).toBe(true);
    expect(r.warnings.some((w) => w.includes("cd="))).toBe(true);
    expect(r.warnings.some((w) => w.includes("uppercase"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("p= perk slot keys"))).toBe(true);
    expect(Array.isArray(r.unknownCodes)).toBe(true);
    expect(r.hasStrangeInNumbers).toBe(true);
    expect(r.warnings.some((w) => w.includes("Strange in Numbers"))).toBe(true);
    expect(r.unknownCodes).not.toContain("ce");
  });

  it("detects Strange in Numbers from minimal p= ce token", () => {
    const r = importNukesDragonsFo76CharacterUrl(
      "https://nukesdragons.com/fallout-76/character?n=t&p=ce1&s=1111111&v=2"
    );
    expect("error" in r).toBe(false);
    if ("error" in r) return;
    expect(r.hasStrangeInNumbers).toBe(true);
  });

  it("rejects invalid host", () => {
    const r = importNukesDragonsFo76CharacterUrl("https://example.com/fallout-76/character?p=sb1&s=1111111&v=2");
    expect(r).toEqual({ error: "Only nukesdragons.com Fallout 76 character planner links are supported." });
  });
});
