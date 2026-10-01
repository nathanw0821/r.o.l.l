import { describe, expect, it } from "vitest";

import official from "@/data/truth/unique-official-effects-p70.json";
import officialUniques from "@/data/truth/unique-items-official-p70.json";
import innate from "@/data/truth/unique-innate-effects-p70.json";
import uniqueItems from "@/data/truth/unique-items.json";

type Entry = {
  name: string;
  kind: "numeric" | "perk-rank";
  effect: string;
  parsed: Record<string, unknown>;
  gameData?: { relation: string; curve?: string; points?: [number, number][]; source?: string };
  openConflicts?: { source: string; note: string }[];
};

const uniques = official.uniques as unknown as Record<string, Entry>;

describe("official Patch 70 unique effects", () => {
  it("is stamped with the official source", () => {
    expect(official.source.patch).toBe(70);
    expect(official.source.published).toBe("2026-09-15");
    expect(official.source.url).toContain("fallout.bethesda.net");
    expect(official.source.confidence).toBe("verified");
  });

  it("holds 45 numeric effects and 4 perk-rank grants", () => {
    const entries = Object.values(uniques);
    expect(entries.length).toBe(49);
    expect(entries.filter((e) => e.kind === "numeric").length).toBe(45);
    expect(entries.filter((e) => e.kind === "perk-rank").length).toBe(4);
  });

  it("keys every entry by a real unique-items id and name", () => {
    const names = new Map((uniqueItems as { id: string; name: string }[]).map((u) => [u.id, u.name]));
    for (const [id, entry] of Object.entries(uniques)) {
      expect(names.get(id), id).toBe(entry.name);
    }
  });

  it("repeats the official wording exactly as the existing official-notes file prints it", () => {
    const text = new Map(
      (officialUniques.weapons as { name: string; effect: string }[]).map((w) => [
        w.name.replace(/[^a-z0-9]/gi, "").toLowerCase(),
        w.effect,
      ])
    );
    for (const [id, entry] of Object.entries(uniques)) {
      const key = entry.name.replace(/[^a-z0-9]/gi, "").toLowerCase();
      if (text.has(key)) expect(entry.effect, id).toBe(text.get(key));
    }
  });

  it("pins the values the builder is most likely to use", () => {
    expect(uniques["sole-survivor"].parsed.value).toBe(3);
    expect(uniques["the-quick-fix"].parsed.value).toBe(5);
    expect(uniques["the-debilitator"].parsed.value).toBe(2);
    expect(uniques["pirate-punch"].parsed.value).toBe(5);
    expect(uniques["whacker-smacker"].parsed.value).toBe(5);
    expect(uniques["somerset-special"].parsed.value).toBe(15);
    expect(uniques["longshot"].parsed.value).toBe(30);
    expect(uniques["daisycutter"].parsed.value).toBe(20);
    expect(uniques["ticket-to-revenge"].parsed.value).toBe(3);
    expect(uniques["v63-olga"].parsed.value).toBe(63);
    expect(uniques["slug-buster"].parsed).toMatchObject({ value: 60, unit: "AP" });
    expect(uniques["resolute-veteran"].parsed).toMatchObject({ value: 5, unit: "stacks" });
  });

  it("agrees with the game curves it cites", () => {
    expect(uniques["the-quick-fix"].gameData?.points?.at(-1)).toEqual([10, 0.5]);
    expect(uniques["sole-survivor"].gameData?.points?.at(-1)).toEqual([10, 30]);
    expect(uniques["pirate-punch"].gameData?.points?.at(-1)).toEqual([20, 100]);
    expect(uniques["molerat-bat"].gameData?.points?.[0]).toEqual([1, 50]);
    // V63-OLGA's 63% is the same number the ESM-derived truth file already carries.
    expect(innate.notes.vault63LaserRifle).toContain("63");
  });

  it("keeps Love Tap's conflict visible instead of choosing a side", () => {
    expect(uniques["love-tap"].parsed).toMatchObject({ value: 30, duration_s: 30 });
    expect(uniques["love-tap"].gameData?.relation).toBe("conflicts");
    expect(uniques["love-tap"].openConflicts?.length).toBeGreaterThan(0);
  });

  it("never lets a pre-release source become a value", () => {
    for (const [id, entry] of Object.entries(uniques)) {
      for (const c of entry.openConflicts ?? []) {
        expect(c.note, id).toMatch(/official note stands|Unresolved/);
      }
    }
  });
});
