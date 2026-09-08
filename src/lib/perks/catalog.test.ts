import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getPerkCardById, searchPerkCards, filterPerksBySpecial, calculateSpecialCapacity, calculateLegendarySpecialBonuses, getGenderedPerkName } from "./catalog";
import { getCleanPerkForeground } from "./clean-perk-assets";
import { getPerkVectorArtUrl } from "./perk-artwork";

describe("Perk Catalog Utilities", () => {
  it("should fetch perk card by ID", () => {
    const card = getPerkCardById("blocker");
    expect(card).toBeDefined();
    expect(card?.name).toBe("Blocker");
    expect(card?.special).toBe("S");
    expect(card?.maxRank).toBe(3);
  });

  it("should search perk cards fuzzy matching query", () => {
    const results = searchPerkCards("action");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => c.name.toLowerCase().includes("action"))).toBe(true);
  });

  it("should filter perk cards by SPECIAL category", () => {
    const luckPerks = filterPerksBySpecial("L");
    expect(luckPerks.length).toBeGreaterThan(0);
    expect(luckPerks.every((c) => c.special === "L")).toBe(true);
  });

  it("should calculate equipped SPECIAL capacity cost accurately", () => {
    const equipped = [
      { cardId: "blocker", rank: 3 },
      { cardId: "bandolier", rank: 2 },
      { cardId: "action-boy", rank: 1 }
    ];
    const capacity = calculateSpecialCapacity(equipped);
    expect(capacity.S).toBe(5); // 3 (Blocker rank 3) + 2 (Bandolier rank 2)
    expect(capacity.A).toBe(1); // 1 (Action Boy rank 1)
  });

  it("should calculate legendary SPECIAL perk card bonuses accurately", () => {
    const equipped = [
      { cardId: "legendary-strength", rank: 4 }, // +5 STR
      { cardId: "legendary-luck", rank: 2 } // +2 LUK
    ];
    const bonuses = calculateLegendarySpecialBonuses(equipped);
    expect(bonuses.S).toBe(5);
    expect(bonuses.L).toBe(2);
  });
});

describe("1:1 Scaleform Vector Perk Card Asset Resolution Engine", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("should resolve reworked heavy and melee perks with legacy aliases to canonical vector SVGs", () => {
    // Bullet Storm & Heavy Gunner legacy alias
    expect(getPerkVectorArtUrl("bullet-storm", "S")).toBe("/images/perks_official/bulletstorm.svg");
    expect(getPerkVectorArtUrl("heavy-gunner", "S")).toBe("/images/perks_official/bulletstorm.svg");

    // Tightly Wound & Expert Heavy Gunner legacy alias
    expect(getPerkVectorArtUrl("tightly-wound", "S")).toBe("/images/perks_official/tightlywound.svg");
    expect(getPerkVectorArtUrl("expert-heavy-gunner", "S")).toBe("/images/perks_official/tightlywound.svg");

    // Bringing the Big Guns & Master Heavy Gunner legacy alias
    expect(getPerkVectorArtUrl("bringing-the-big-guns", "S")).toBe("/images/perks_official/bringingthebigguns.svg");
    expect(getPerkVectorArtUrl("master-heavy-gunner", "S")).toBe("/images/perks_official/bringingthebigguns.svg");

    // Heavy Hitter & Master Slugger legacy alias
    expect(getPerkVectorArtUrl("heavy-hitter", "S")).toBe("/images/perks_official/heavyhitter.svg");
    expect(getPerkVectorArtUrl("master-slugger", "S")).toBe("/images/perks_official/heavyhitter.svg");

    // Knee-Capper & Expert Slugger legacy alias
    expect(getPerkVectorArtUrl("knee-capper", "S")).toBe("/images/perks_official/kneecapper.svg");
    expect(getPerkVectorArtUrl("expert-slugger", "S")).toBe("/images/perks_official/kneecapper.svg");
  });

  it("should verify resolved vector SVGs physically exist on disk in public/images/perks_official", () => {
    const testCases = [
      "bullet-storm",
      "heavy-gunner",
      "tightly-wound",
      "bringing-the-big-guns",
      "heavy-hitter",
      "knee-capper",
      "bloody-mess",
      "action-boy",
      "legendary-strength",
      "ammo-factory",
      "what-rads",
      "action-ghoul",
      "curator",
      "woodchucker",
      "action-girl",
      "aquagirl",
      "party-girl",
    ];

    for (const id of testCases) {
      const url = getCleanPerkForeground(id);
      expect(url).not.toBeNull();
      expect(url!.endsWith(".svg")).toBe(true);
      const relativePath = url!.replace(/^\//, "");
      const fullPath = path.join(publicDir, relativePath);
      expect(fs.existsSync(fullPath), `Expected SVG asset to exist: ${fullPath}`).toBe(true);
    }
  });

  it("should dynamically resolve gendered vector perk cards based on isFemale flag", () => {
    // Action Boy <-> Action Girl
    expect(getPerkVectorArtUrl("action-boy", "A", false)).toBe("/images/perks_official/actionboy.svg");
    expect(getPerkVectorArtUrl("action-boy", "A", true)).toBe("/images/perks_official/actiongirl.svg");
    expect(getPerkVectorArtUrl("action-girl", "A", false)).toBe("/images/perks_official/actionboy.svg");
    expect(getPerkVectorArtUrl("action-girl", "A", true)).toBe("/images/perks_official/actiongirl.svg");

    // Aquaboy <-> Aquagirl
    expect(getPerkVectorArtUrl("aquaboy", "E", false)).toBe("/images/perks_official/aquaticconcealment.svg");
    expect(getPerkVectorArtUrl("aquaboy", "E", true)).toBe("/images/perks_official/aquaticconcealmentgirl.svg");

    // Party Boy <-> Party Girl
    expect(getPerkVectorArtUrl("party-boy", "C", false)).toBe("/images/perks_official/partyboy.svg");
    expect(getPerkVectorArtUrl("party-boy", "C", true)).toBe("/images/perks_official/partygirl.svg");
  });

  it("should properly swap gendered perk names bidirectionally", () => {
    // Male -> Female
    expect(getGenderedPerkName("Action Boy", true)).toBe("Action Girl");
    expect(getGenderedPerkName("Aquaboy", true)).toBe("Aquagirl");
    expect(getGenderedPerkName("Party Boy", true)).toBe("Party Girl");

    // Female -> Male
    expect(getGenderedPerkName("Action Girl", false)).toBe("Action Boy");
    expect(getGenderedPerkName("Aquagirl", false)).toBe("Aquaboy");
    expect(getGenderedPerkName("Party Girl", false)).toBe("Party Boy");

    // Idempotent when flag matches
    expect(getGenderedPerkName("Action Girl", true)).toBe("Action Girl");
    expect(getGenderedPerkName("Action Boy", false)).toBe("Action Boy");
    expect(getGenderedPerkName("Bloody Mess", true)).toBe("Bloody Mess");
    expect(getGenderedPerkName("Bloody Mess", false)).toBe("Bloody Mess");
  });

  describe("Deterministic Outdated & Reworked Perk Knowledge Engine", () => {
    it("should find modern replacement cards and legacy cards when searching legacy terms", () => {
      // Heavy Gunner -> Bullet Storm
      const heavyResults = searchPerkCards("heavy gunner");
      expect(heavyResults.some((c) => c.id === "bullet-storm")).toBe(true);
      expect(heavyResults.some((c) => c.id === "heavy-gunner" && c.isOutdated === true)).toBe(true);

      // Expert Heavy Gunner -> Tightly Wound
      const expertHeavyResults = searchPerkCards("expert heavy gunner");
      expect(expertHeavyResults.some((c) => c.id === "tightly-wound")).toBe(true);
      expect(expertHeavyResults.some((c) => c.id === "expert-heavy-gunner" && c.isOutdated === true)).toBe(true);

      // Master Heavy Gunner -> Bringing the Big Guns
      const masterHeavyResults = searchPerkCards("master heavy gunner");
      expect(masterHeavyResults.some((c) => c.id === "bringing-the-big-guns")).toBe(true);
      expect(masterHeavyResults.some((c) => c.id === "master-heavy-gunner" && c.isOutdated === true)).toBe(true);

      // Master Slugger -> Heavy Hitter
      const masterSluggerResults = searchPerkCards("master slugger");
      expect(masterSluggerResults.some((c) => c.id === "heavy-hitter")).toBe(true);
      expect(masterSluggerResults.some((c) => c.id === "master-slugger" && c.isOutdated === true)).toBe(true);

      // Expert Slugger -> Knee-Capper
      const expertSluggerResults = searchPerkCards("expert slugger");
      expect(expertSluggerResults.some((c) => c.id === "knee-capper")).toBe(true);
      expect(expertSluggerResults.some((c) => c.id === "expert-slugger" && c.isOutdated === true)).toBe(true);
    });

    it("should resolve legacy perk IDs via getPerkCardById with Outdated metadata and hyperlink targets", () => {
      const legacyHeavy = getPerkCardById("heavy-gunner");
      expect(legacyHeavy).toBeDefined();
      expect(legacyHeavy?.isOutdated).toBe(true);
      expect(legacyHeavy?.outdatedMeta?.replacedBy.id).toBe("bullet-storm");
      expect(legacyHeavy?.outdatedMeta?.replacedBy.name).toBe("Bullet Storm");
      expect(legacyHeavy?.outdatedMeta?.href).toBe("/perks?q=bullet-storm");

      const legacyMasterSlugger = getPerkCardById("master-slugger");
      expect(legacyMasterSlugger).toBeDefined();
      expect(legacyMasterSlugger?.isOutdated).toBe(true);
      expect(legacyMasterSlugger?.outdatedMeta?.replacedBy.id).toBe("heavy-hitter");
      expect(legacyMasterSlugger?.outdatedMeta?.replacedBy.name).toBe("Heavy Hitter");
    });

    it("should attach reworkedFrom metadata to modern Patch 69 replacement perks", () => {
      const bulletStorm = getPerkCardById("bullet-storm");
      expect(bulletStorm?.reworkedFrom).toBeDefined();
      expect(bulletStorm?.reworkedFrom?.formerName).toBe("Heavy Gunner");

      const tightlyWound = getPerkCardById("tightly-wound");
      expect(tightlyWound?.reworkedFrom?.formerName).toBe("Expert Heavy Gunner");

      const bigGuns = getPerkCardById("bringing-the-big-guns");
      expect(bigGuns?.reworkedFrom?.formerName).toBe("Master Heavy Gunner");

      const heavyHitter = getPerkCardById("heavy-hitter");
      expect(heavyHitter?.reworkedFrom?.formerName).toBe("Master Slugger");

      const kneeCapper = getPerkCardById("knee-capper");
      expect(kneeCapper?.reworkedFrom?.formerName).toBe("Expert Slugger");
    });

    it("should verify all legendary perks have 0 SPECIAL cost across all ranks", () => {
      const legendaryPerks = searchPerkCards("").filter((p) => p.special === "LEGENDARY");
      expect(legendaryPerks.length).toBeGreaterThan(0);
      legendaryPerks.forEach((p) => {
        p.ranks.forEach((r) => {
          expect(r.cost).toBe(0);
        });
      });
    });

    it("should exclude outdated perks when includeOutdated is false (perk deck for builds)", () => {
      const buildDeckResults = searchPerkCards("heavy gunner", undefined, false);
      expect(buildDeckResults.some((p) => p.isOutdated)).toBe(false);
      // Modern replacement perks like Bullet Storm should still match via formerName
      expect(buildDeckResults.some((p) => p.id === "bullet-storm")).toBe(true);
      // Legacy cards should NOT be present in build deck
      expect(buildDeckResults.some((p) => p.id === "heavy-gunner")).toBe(false);
      expect(buildDeckResults.some((p) => p.id === "expert-heavy-gunner")).toBe(false);
      expect(buildDeckResults.some((p) => p.id === "master-heavy-gunner")).toBe(false);
    });
  });
});

