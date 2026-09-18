import { describe, expect, it } from "vitest";
import perkCards from "@/data/perk-cards.json";
import reference from "@/data/truth/perk-reference-nukesdragons.json";

/**
 * Pins src/data/perk-cards.json to the dated in-game reference snapshot in
 * src/data/truth/perk-reference-nukesdragons.json (scraped with
 * scripts/truth/scrape-nukesdragons-perks.py). Every card must match the
 * game 1:1 on level, rank count, per-rank description and top-rank cost.
 * When a patch changes cards: re-scrape, update the snapshot, then fix the cards.
 */

type Card = { name: string; special: string; minLevel: number; ranks: { rank: number; cost: number; description: string }[] };
type Ref = { slug: string; name: string; special: string | null; level: number | null; topCost: number | null; ranks: { rank: number; description: string }[] };

const SPECIAL: Record<string, string> = { S: "Strength", P: "Perception", E: "Endurance", C: "Charisma", I: "Intelligence", A: "Agility", L: "Luck", LEGENDARY: "Legendary" };

function norm(t: string): string {
  return t.replace(/[’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}
function key(n: string): string {
  return norm(n).toLowerCase().replace(/[!.']/g, "").replace(/[-/]/g, " ").replace(/\s+/g, " ").trim();
}

describe("perk cards match the in-game reference snapshot", () => {
  const refByKey = new Map<string, Ref>((reference.perks as Ref[]).map((r) => [key(r.name), r]));
  const cards = perkCards as Card[];

  it("has the same card set as the reference (268)", () => {
    expect(cards.length).toBe(reference.perks.length);
    const missing = cards.filter((c) => !refByKey.has(key(c.name))).map((c) => c.name);
    expect(missing).toEqual([]);
  });

  it("matches SPECIAL, level, rank count and top-rank cost for every card", () => {
    const problems: string[] = [];
    for (const c of cards) {
      const r = refByKey.get(key(c.name));
      if (!r) continue;
      if (r.special && SPECIAL[c.special] !== r.special) problems.push(`${c.name}: special ${c.special} vs ${r.special}`);
      if (c.special !== "LEGENDARY" && r.level !== null && c.minLevel !== r.level) problems.push(`${c.name}: level ${c.minLevel} vs ${r.level}`);
      if (c.ranks.length !== r.ranks.length) problems.push(`${c.name}: ranks ${c.ranks.length} vs ${r.ranks.length}`);
      if (c.special !== "LEGENDARY" && r.topCost !== null) {
        const top = c.ranks.reduce((a, b) => (b.rank > a.rank ? b : a));
        if (top.cost !== r.topCost) problems.push(`${c.name}: top cost ${top.cost} vs ${r.topCost}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("matches every rank description verbatim", () => {
    const problems: string[] = [];
    for (const c of cards) {
      const r = refByKey.get(key(c.name));
      if (!r) continue;
      for (const rank of c.ranks) {
        const ref = r.ranks.find((x) => x.rank === rank.rank);
        if (!ref) { problems.push(`${c.name} r${rank.rank}: no reference rank`); continue; }
        if (norm(rank.description) !== norm(ref.description)) problems.push(`${c.name} r${rank.rank}: "${rank.description}" vs "${ref.description}"`);
      }
    }
    expect(problems).toEqual([]);
  });
});
