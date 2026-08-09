import { describe, expect, it } from "vitest";
import { getPtsCatalog, filterPtsCatalog } from "./catalog";

describe("PTS Catalog Engine", () => {
  it("returns all PTS catalog items", () => {
    const catalog = getPtsCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    expect(catalog[0]).toHaveProperty("id");
    expect(catalog[0]).toHaveProperty("name");
  });

  it("filters PTS items by section", () => {
    const mods = filterPtsCatalog({ section: "4-star-mods" });
    expect(mods.every((item) => item.section === "4-star-mods")).toBe(true);

    const rules = filterPtsCatalog({ section: "crafting-rules" });
    expect(rules.every((item) => item.section === "crafting-rules")).toBe(true);
  });

  it("searches PTS items by query string", () => {
    const results = filterPtsCatalog({ searchQuery: "scrip" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((item) => item.name.toLowerCase().includes("scrip") || item.description.toLowerCase().includes("scrip"))).toBe(true);
  });
});
