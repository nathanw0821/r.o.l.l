import { describe, expect, it } from "vitest";
import {
  builderModHref,
  builderModSlug,
  guidesSearchHref,
  modDeepLinkPick,
  resolveModParam,
  slugifyModName,
  starFromTierLabel,
  trackerSearchHref
} from "@/lib/links/cross-links";
import { INITIAL_BUILDER_MODS } from "@/lib/builder/legendary-mod-catalog-seeds";
import { BASE_GEAR_PIECES, getBaseGearPiece } from "@/lib/builder/base-gear";
import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";

const piece = (id: string) => {
  const p = getBaseGearPiece(id);
  if (!p) throw new Error(`no base piece ${id}`);
  return p;
};
const mod = (slug: string) => {
  const m = INITIAL_BUILDER_MODS.find((x) => x.slug === slug);
  if (!m) throw new Error(`no mod ${slug}`);
  return m;
};

const gun = BASE_GEAR_PIECES.find((p) => p.kind === "weapon" && p.weaponSub === "ranged") ?? piece("fixer");
const armor = BASE_GEAR_PIECES.find((p) => p.kind === "armor")!;
const powerArmor = piece("t60-torso");

describe("cross-tool hrefs", () => {
  it("slugifies names the way the builder catalog does", () => {
    expect(slugifyModName("Pounder's")).toBe("pounders");
    expect(slugifyModName("V.A.T.S. Optimized")).toBe("vats-optimized");
    expect(slugifyModName("Anti-armor")).toBe("anti-armor");
    expect(builderModSlug("Strength", 3)).toBe("strength-3");
    expect(builderModSlug("Severing", 4)).toBe("severing");
  });

  it("every tracker row maps to a builder catalog slug", () => {
    const slugs = new Set(INITIAL_BUILDER_MODS.map((m) => m.slug));
    for (const row of FALLBACK_LEGENDARY_EFFECTS) {
      const slug = builderModSlug(row.effectName, starFromTierLabel(row.tier.label));
      expect(slugs.has(slug), `${row.effectName} (${row.tier.label}) -> ${slug}`).toBe(true);
    }
  });

  it("builds the three deep links", () => {
    expect(builderModHref("Severing", 4)).toBe("/build?tab=gear&mod=severing");
    expect(builderModHref("Agility", 2)).toBe("/build?tab=gear&mod=agility-2");
    expect(trackerSearchHref("Pounder's")).toBe("/all-effects?q=Pounder's");
    expect(guidesSearchHref("Night Person")).toBe("/wiki?q=Night%20Person");
    expect(starFromTierLabel("3 Star")).toBe(3);
    expect(starFromTierLabel("4★")).toBe(4);
    expect(starFromTierLabel(null)).toBeNull();
  });
});

describe("builder ?mod= handling", () => {
  it("resolves exact slugs, bare SPECIAL names and rejects junk", () => {
    expect(resolveModParam(INITIAL_BUILDER_MODS, "severing")?.name).toBe("Severing");
    expect(resolveModParam(INITIAL_BUILDER_MODS, "strength-3")?.starRank).toBe(3);
    expect(resolveModParam(INITIAL_BUILDER_MODS, "strength")?.starRank).toBe(2);
    expect(resolveModParam(INITIAL_BUILDER_MODS, "not-a-mod")).toBeUndefined();
    expect(resolveModParam(INITIAL_BUILDER_MODS, "<script>")).toBeUndefined();
    expect(resolveModParam(INITIAL_BUILDER_MODS, "")).toBeUndefined();
  });

  it("opens the weapon star slot for a weapon mod", () => {
    expect(modDeepLinkPick(mod("severing"), gun, armor)).toEqual({ scope: "single", starIndex: 3 });
    expect(modDeepLinkPick(mod("bloodied"), gun, armor)).toEqual({ scope: "single", starIndex: 0 });
  });

  it("opens the armor chassis for an armor mod (Power Armor skips the helmet)", () => {
    expect(modDeepLinkPick(mod("unyielding"), gun, armor)).toEqual({ scope: "armorSet", pieceIndex: 0, starIndex: 0 });
    expect(modDeepLinkPick(mod("unyielding"), gun, powerArmor)).toEqual({ scope: "armorSet", pieceIndex: 1, starIndex: 0 });
  });
});
