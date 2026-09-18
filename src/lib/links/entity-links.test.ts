import { describe, expect, it } from "vitest";
import {
  ALLOWED_ENTITY_HREF_PATTERNS,
  ENTITY_LINKS,
  MIN_ENTITY_NAME_LENGTH,
  createLinkPlanState,
  findEntityMatches,
  getEntityLink,
  normalizeEntityKey,
  planLinkSegments
} from "@/lib/links/entity-links";
import { BASE_GEAR_PIECES } from "@/lib/builder/base-gear";
import { UPDATE_PATCH_IDS } from "@/lib/wiki/update-patches";

const names = (text: string) => findEntityMatches(text).map((m) => m.entity.name);

describe("entity link map", () => {
  it("has no duplicate lower-cased keys", () => {
    const keys = ENTITY_LINKS.map((e) => normalizeEntityKey(e.name));
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of ENTITY_LINKS) expect(e.key).toBe(normalizeEntityKey(e.name));
  });

  it("covers every source kind", () => {
    const kinds = new Set(ENTITY_LINKS.map((e) => e.kind));
    expect([...kinds].sort()).toEqual(["effect", "perk", "unique", "update"]);
    expect(getEntityLink("Severing")?.href).toBe("/all-effects?q=Severing");
    expect(getEntityLink("Night Person")?.href).toBe("/perks?q=Night%20Person");
    expect(getEntityLink("The Slasher")?.href).toBe("/wiki?update=the-slasher");
    expect(getEntityLink("The Pitt")?.href).toBe("/wiki?update=the-pitt");
  });

  it("every href matches an allowed route pattern", () => {
    for (const e of ENTITY_LINKS) {
      expect(
        ALLOWED_ENTITY_HREF_PATTERNS.some((re) => re.test(e.href)),
        `${e.name} -> ${e.href}`
      ).toBe(true);
    }
  });

  it("every piece= id exists in BASE_GEAR_PIECES and every update= id is a wiki chip", () => {
    const baseIds = new Set(BASE_GEAR_PIECES.map((p) => p.id));
    for (const e of ENTITY_LINKS) {
      const url = new URL(e.href, "https://roll.local");
      const piece = url.searchParams.get("piece");
      if (piece !== null) expect(baseIds.has(piece), `${e.name} piece=${piece}`).toBe(true);
      const update = url.searchParams.get("update");
      if (update !== null) expect(UPDATE_PATCH_IDS.has(update), `${e.name} update=${update}`).toBe(true);
      const q = url.searchParams.get("q");
      if (q !== null) expect(normalizeEntityKey(q)).toBe(e.key);
    }
    expect(ENTITY_LINKS.some((e) => e.kind === "unique")).toBe(true);
  });

  it("skips short names and stoplisted words", () => {
    for (const e of ENTITY_LINKS) expect(e.name.length).toBeGreaterThanOrEqual(MIN_ENTITY_NAME_LENGTH);
    expect(getEntityLink("Sneak")).toBeUndefined();
    expect(getEntityLink("Strength")).toBeUndefined();
    expect(getEntityLink("Quad")).toBeUndefined(); // 4 characters
    expect(getEntityLink("Scrounger")?.kind).toBe("perk");
  });
});

describe("findEntityMatches", () => {
  it("prefers the longest name at overlapping positions", () => {
    expect(names("Anti-armor is a 1-star mod.")).toEqual(["Anti-armor"]);
    expect(names("Gunslinger Expert stacks.")).toEqual(["Gunslinger Expert"]);
    // Legendary Strength (perk) wins over the stoplisted Strength effect inside it.
    expect(names("Equip Legendary Strength first.")).toEqual(["Legendary Strength"]);
    // A longer name that fails its trailing boundary falls back to the shorter one.
    expect(names("Gunslinger Experts agree.")).toEqual(["Gunslinger"]);
  });

  it("links only the first occurrence of each entity", () => {
    const matches = findEntityMatches("Severing stacks. Severing again. Night Person and Severing.");
    expect(matches.map((m) => m.entity.name)).toEqual(["Severing", "Night Person"]);
    expect(matches[0].start).toBe(0);
    const all = findEntityMatches("Severing and Severing", { firstOnly: false });
    expect(all).toHaveLength(2);
  });

  it("does not match lowercase common words or inside other words", () => {
    expect(names("rapid fire and a bloodied build")).toEqual([]);
    expect(names("The unyielding tide")).toEqual([]);
    expect(names("Severingly odd")).toEqual([]);
    expect(names("Unyielding thresholds are 20 / 40 / 60% HP.")).toEqual(["Unyielding"]);
  });

  it("treats typographic and ASCII apostrophes alike", () => {
    expect(names("Aristocrat’s scales with caps.")).toEqual(["Aristocrat's"]);
    expect(names("Aristocrat's scales with caps.")).toEqual(["Aristocrat's"]);
    const m = findEntityMatches("Use Grim Reaper’s Sprint.")[0];
    expect(m.entity.name).toBe("Grim Reaper's Sprint");
    expect(m.text).toBe("Grim Reaper’s Sprint");
  });

  it("shares first-occurrence state across strings of one block", () => {
    const state = createLinkPlanState();
    const a = planLinkSegments("Severing is new.", { state });
    const b = planLinkSegments("Severing again.", { state });
    expect(a.filter((s) => s.href)).toHaveLength(1);
    expect(b.filter((s) => s.href)).toHaveLength(0);
    expect(b.map((s) => s.text).join("")).toBe("Severing again.");
  });
});

describe("planLinkSegments", () => {
  it("never links to the page it is on and keeps the text intact", () => {
    const text = "Severing pairs with Night Person.";
    const onTracker = planLinkSegments(text, { currentPath: "/all-effects" });
    expect(onTracker.map((s) => s.text).join("")).toBe(text);
    expect(onTracker.filter((s) => s.href).map((s) => s.href)).toEqual(["/perks?q=Night%20Person"]);
    const home = planLinkSegments(text, { currentPath: "/" });
    expect(home.filter((s) => s.href)).toHaveLength(2);
  });

  it("respects maxLinks", () => {
    const segs = planLinkSegments("Severing pairs with Night Person.", { maxLinks: 1 });
    expect(segs.filter((s) => s.href)).toHaveLength(1);
    expect(segs.map((s) => s.text).join("")).toBe("Severing pairs with Night Person.");
  });

  it("links the patch 70 'What changed' copy", () => {
    const segs = planLinkSegments(
      "Night Person and Solar Powered are single-rank 2-point cards giving +5 / +5. Nocturnal Fortitude gives 50 HP per rank, Photosynthetic 3 HP/s per rank, and Lone Wanderer now reduces all damage types.",
      { currentPath: "/" }
    );
    expect(segs.filter((s) => s.href).map((s) => s.text)).toEqual([
      "Night Person",
      "Solar Powered",
      "Nocturnal Fortitude",
      "Photosynthetic",
      "Lone Wanderer"
    ]);
  });
});
