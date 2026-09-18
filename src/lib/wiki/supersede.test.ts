import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES, type WikiArticleItem } from "@/lib/wiki/wiki-articles-data";
import { ALLOWED_ENTITY_HREF_PATTERNS } from "@/lib/links/entity-links";
import { searchWikiArticles } from "@/lib/wiki/search-wiki-articles";
import committedIndex from "@/lib/wiki/supersede-index.json";
import {
  MAX_SUPERSEDE_NOTES,
  SUPERSEDE_RULES,
  buildSupersedeIndex,
  isPossiblyOutdated,
  supersedeNotesFor,
  supersedeNotesForId,
} from "@/lib/wiki/supersede";

const BODY_DIR = path.join(process.cwd(), "public/data/wiki");

function readBody(id: string | number): string {
  const file = path.join(BODY_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return "";
  return (JSON.parse(fs.readFileSync(file, "utf8")) as { content?: string }).content ?? "";
}

const BY_ID = new Map(FALLBACK_WIKI_ARTICLES.map((a) => [String(a.id), a]));
function guide(id: number | string): WikiArticleItem {
  const article = BY_ID.get(String(id));
  if (!article) throw new Error(`guide ${id} is not in the corpus`);
  return article;
}
const ruleIdsFor = (id: number | string) => supersedeNotesFor(guide(id), readBody(id)).map((r) => r.id);
const ruleIdsForText = (text: string, title = "A guide") => supersedeNotesFor({ title, snippet: "" }, text).map((r) => r.id);

/**
 * One real corpus guide per rule that states the old value (checked by hand in the precision
 * review, PATCH70_WORKLOG.md "Current state", step d), and near misses that must NOT match: real guides that
 * already give the current value and wording that only looks similar.
 */
const CASES: Record<string, { hit: number; misses: Array<number | string> }> = {
  // "Increases damage reduction up to 6% as hunger and thirst meters fill"
  "overeaters-max-health": {
    hit: 4475,
    misses: [437, 244, "Overeater's: +40 max health per armor piece.", "Overeater's now increases Max Health by up to +40 per piece. It no longer reduces incoming damage."],
  },
  // "Fireproof rank 3 Take 45% less damage from explosions and flame attacks."
  "fireproof-renamed-hardy": {
    hit: 4572,
    misses: [2642, 3609, "Armor mods: Poisoner's (1x), Fireproof (1x)", "Hardy rank 3: take 45% less damage from explosions."],
  },
  // "**Fireproof** Effect: 25 Fire Resistance"
  "resist-mods-plus-50": { hit: 4475, misses: [4254, "**Fireproof** Effect: +50 Fire Resistance", "Warming mods increased from +25 to +50"] },
  // "Bolstering ... Grants up to +35 Energy & Damage Resistance, the lower your health"
  "vanguards-bolstering-reducers": { hit: 4331, misses: [3554, "Vanguard's: up to 10% less damage taken at high health."] },
  // "Cavalier's Effect: 75% chance to reduce damage by 15% while sprinting"
  "sentinels-cavaliers-flat": { hit: 4475, misses: ["Sentinel's: 5% less damage while standing still.", "Cavalier's: take 10% less damage while sprinting."] },
  // Ghoul perk list with Expert Heavy Gunner and Master Heavy Gunner
  "heavy-gunner-line": {
    hit: 4332,
    misses: [
      2579,
      2751,
      "Expert Heavy Gunner was folded into Bullet Storm; Master Heavy Gunner became Bringing the Big Guns.",
      // left to the hand-written rule in outdated-articles.ts (no duplicate note)
      "Heavy Gunner rank 3, Expert Heavy Gunner 3, Master Heavy Gunner 3",
    ],
  },
  // "The “Stabilized” perk ... only works in PA."
  "stabilized-no-armor-ignore": {
    hit: 4116,
    misses: [2736, 210, "Stabilized: big guns gain 30% accuracy, double in Power Armor.", "Plan: Civil Engineer Stabilized Armor Arms"],
  },
  // "Charisma at 4: By the Dozen Weird, Inspirational 3 ... Nerd Rage 3"
  "special-scaled-single-rank": {
    hit: 3978,
    misses: [2680, "Nerd Rage! (1 rank, 2 points)", "Blocker 3, Ironclad 3, Hardy 3", "Lone Wanderer at CHA 15"],
  },
  // "the cost increases each time you do so, eventually capping at 1,000 Legendary Scrip"
  "mod-change-fixed-scrip": {
    hit: 4505,
    misses: [8, "The Scrip cost to change Legendary Mods no longer increases and is now a fixed value: 50 scrip."],
  },
  // "| ★★★ | 3 | Gain +3 INT and +3 PER between the hours of 6:00 p.m. and 6:00 a.m. |"
  "night-person-solar-powered": {
    hit: 2682,
    misses: ["Night Person: Gain +5 INT and PER between the hours of 6:00 p.m. and 6:00 a.m.", "Solar Powered (1 rank): +5 STR and END by day."],
  },
  // "- 25% less VATS Action Point cost -"
  "vats-optimized-35": {
    hit: 4569,
    misses: [286, 3609, 4419, "V.A.T.S. Optimized: -35% action point cost."],
  },
  // "**Bloodied** Effect: Damage increases up to 95% as health decreases"
  "bloodied-130": { hit: 4475, misses: [176, 58, 3609, "Bloodied: damage increases up to +130% as health decreases."] },
  // "Junkie's Effect: +10% Damage per addiction (up to +50%)"
  "junkies-100": { hit: 4475, misses: ["Junkie's: +10% damage per addiction, up to +100% at 10 addictions."] },
  // "Two shot - +1 Projectiles +25% Damage"
  "two-shot-75": { hit: 4448, misses: [4655, 4626, "Two Shot: +75% damage and an extra projectile."] },
};

describe("supersede rules file", () => {
  it("every rule is complete, unique, verified and links inside the site", () => {
    const ids = SUPERSEDE_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SUPERSEDE_RULES.length).toBeGreaterThanOrEqual(10);
    for (const rule of SUPERSEDE_RULES) {
      expect(rule.id).toMatch(/^[a-z0-9-]+$/);
      expect(Number.isInteger(rule.patch)).toBe(true);
      expect(rule.patchName.trim()).not.toBe("");
      expect(rule.changed).toMatch(/^[A-Z].*\.$/);
      expect(rule.verified.trim().length).toBeGreaterThan(20);
      const { titleAny, textAll, textAny } = rule.appliesTo;
      expect((titleAny?.length ?? 0) + (textAll?.length ?? 0) + (textAny?.length ?? 0)).toBeGreaterThan(0);
      for (const pattern of [...(titleAny ?? []), ...(textAll ?? []), ...(textAny ?? []), ...(rule.excludeIf?.textAny ?? [])]) {
        expect(() => new RegExp(pattern, "i")).not.toThrow();
      }
      const internal =
        rule.currentHref === "/all-effects" || ALLOWED_ENTITY_HREF_PATTERNS.some((re) => re.test(rule.currentHref)) || /^\/wiki\?id=[\w-]+$/.test(rule.currentHref);
      expect(internal, `${rule.id} currentHref ${rule.currentHref}`).toBe(true);
    }
  });

  it("has a real true positive and near-miss negatives for every rule", () => {
    expect(Object.keys(CASES).sort()).toEqual(SUPERSEDE_RULES.map((r) => r.id).sort());
  });
});

describe("supersedeNotesFor", () => {
  for (const [ruleId, { hit, misses }] of Object.entries(CASES)) {
    it(`${ruleId}: flags guide ${hit} and not its near misses`, () => {
      expect(ruleIdsFor(hit)).toContain(ruleId);
      for (const miss of misses) {
        const ids = typeof miss === "number" ? ruleIdsFor(miss) : ruleIdsForText(miss);
        expect(ids, `near miss ${typeof miss === "number" ? `guide ${miss}` : JSON.stringify(miss)}`).not.toContain(ruleId);
      }
    });
  }

  it("matches the title and snippet without a body", () => {
    const ids = supersedeNotesFor({ title: "Legendary effects", snippet: "Bloodied: damage increases up to 95% as health decreases." }).map((r) => r.id);
    expect(ids).toEqual(["bloodied-130"]);
  });

  it("never flags patch notes, test-server notes, Fallout 4 or Nuclear Winter pages", () => {
    const old = "Fireproof now reduces explosion and flame attack damage by 15% per rank.";
    expect(ruleIdsForText(old)).toContain("fireproof-renamed-hardy");
    expect(supersedeNotesFor({ title: "Fallout 76 patch 1.0.4.13", category: "Patch notes & news" }, old)).toEqual([]);
    expect(supersedeNotesFor({ title: "Pts Patchnotes adventuring in Appalachia Patch 66" }, old)).toEqual([]);
    expect(supersedeNotesFor({ title: "Fallout 4 legendary weapon effects" }, "Two Shot: +25% Damage and adds an extra projectile")).toEqual([]);
    expect(ruleIdsFor(4768)).toEqual([]);
    expect(ruleIdsFor(102)).toEqual([]);
  });

  it("orders several matches newest patch first", () => {
    const rules = supersedeNotesFor(guide(4331), readBody(4331));
    expect(rules.length).toBeGreaterThan(MAX_SUPERSEDE_NOTES);
    const patches = rules.map((r) => r.patch);
    expect(patches).toEqual([...patches].sort((a, b) => b - a));
  });
});

describe("supersede index", () => {
  it("committed index matches the rules and the corpus (run scripts/truth/build-supersede-index.ts to refresh)", () => {
    const live = buildSupersedeIndex(FALLBACK_WIKI_ARTICLES, readBody);
    expect(committedIndex).toEqual(live);
    expect(Object.keys(live).length).toBeGreaterThan(0);
  });

  it("serves at most three notes per guide, newest patch first", () => {
    const notes = supersedeNotesForId(4331);
    expect(notes).toHaveLength(MAX_SUPERSEDE_NOTES);
    expect(notes.every((r) => r.patch === 70)).toBe(true);
    expect(supersedeNotesForId(4116).map((r) => r.id)).toEqual(["stabilized-no-armor-ignore"]);
    expect(supersedeNotesForId("no-such-guide")).toEqual([]);
    expect(isPossiblyOutdated(4116)).toBe(true);
    expect(isPossiblyOutdated(2736)).toBe(false);
  });

  it("current=1 (hidePossiblyOutdated) drops flagged guides from search results", () => {
    const all = searchWikiArticles(FALLBACK_WIKI_ARTICLES, { q: "gauss minigun heavy gunner", includeArchive: true });
    expect(all.items.map((a) => String(a.id))).toContain("4117");
    const current = searchWikiArticles(FALLBACK_WIKI_ARTICLES, { q: "gauss minigun heavy gunner", includeArchive: true, hidePossiblyOutdated: true });
    expect(current.items.map((a) => String(a.id))).not.toContain("4117");
    const everything = searchWikiArticles(FALLBACK_WIKI_ARTICLES, { includeArchive: true, hidePossiblyOutdated: true });
    expect(everything.items.some((a) => isPossiblyOutdated(a.id))).toBe(false);
  });
});
