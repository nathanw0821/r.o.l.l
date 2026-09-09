import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getPerkCardById, searchPerkCards, filterPerksBySpecial, calculateSpecialCapacity, calculateLegendarySpecialBonuses, getGenderedPerkName, areEquippedCardsEqual } from "./catalog";
import { getInGamePerkCardImage } from "./clean-perk-assets";

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

describe("1:1 In-Game Perk Card Asset Resolution Engine", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("should resolve reworked heavy and melee perks with legacy aliases", () => {
    // Bullet Storm & Heavy Gunner legacy alias
    expect(getInGamePerkCardImage("bullet-storm", 1)).toBe("/images/in_game_cards/bullet_storm_r1.png");
    expect(getInGamePerkCardImage("heavy-gunner", 1)).toBe("/images/in_game_cards/bullet_storm_r1.png");
    expect(getInGamePerkCardImage("heavy-gunner", 3)).toBe("/images/in_game_cards/bullet_storm_r3.png");

    // Tightly Wound & Expert Heavy Gunner legacy alias
    expect(getInGamePerkCardImage("tightly-wound", 1)).toBe("/images/in_game_cards/tightly_wound_r1.png");
    expect(getInGamePerkCardImage("expert-heavy-gunner", 1)).toBe("/images/in_game_cards/tightly_wound_r1.png");

    // Bringing the Big Guns & Master Heavy Gunner legacy alias
    expect(getInGamePerkCardImage("bringing-the-big-guns", 1)).toBe("/images/in_game_cards/bringing_the_big_guns_r1.png");
    expect(getInGamePerkCardImage("master-heavy-gunner", 1)).toBe("/images/in_game_cards/bringing_the_big_guns_r1.png");

    // Heavy Hitter & Master Slugger legacy alias
    expect(getInGamePerkCardImage("heavy-hitter", 1)).toBe("/images/in_game_cards/heavy_hitter_r1.png");
    expect(getInGamePerkCardImage("master-slugger", 1)).toBe("/images/in_game_cards/heavy_hitter_r1.png");

    // Knee-Capper & Expert Slugger legacy alias
    expect(getInGamePerkCardImage("knee-capper", 1)).toBe("/images/in_game_cards/knee_capper_r1.png");
    expect(getInGamePerkCardImage("expert-slugger", 1)).toBe("/images/in_game_cards/knee_capper_r1.png");
  });

  it("should verify resolved bitmapped images physically exist on disk in public/images/in_game_cards", () => {
    const testCases = [
      { id: "bullet-storm", rank: 1 },
      { id: "bullet-storm", rank: 3 },
      { id: "heavy-gunner", rank: 1 },
      { id: "tightly-wound", rank: 1 },
      { id: "bringing-the-big-guns", rank: 1 },
      { id: "heavy-hitter", rank: 1 },
      { id: "knee-capper", rank: 1 },
      { id: "bloody-mess", rank: 1 },
      { id: "bloody-mess", rank: 3 },
      { id: "action-boy", rank: 1 },
      { id: "action-boy", rank: 3 },
      { id: "legendary-strength", rank: 1 },
      { id: "legendary-strength", rank: 4 },
      { id: "ammo-factory", rank: 4 },
      { id: "what-rads", rank: 4 },
      { id: "action-ghoul", rank: 1 },
      { id: "curator", rank: 1 },
      { id: "woodchucker", rank: 1 },
      { id: "action-girl", rank: 1 },
      { id: "action-girl", rank: 3 },
      { id: "aquagirl", rank: 1 },
      { id: "party-girl", rank: 1 },
      { id: "party-girl", rank: 2 },
    ];

    for (const { id, rank } of testCases) {
      const url = getInGamePerkCardImage(id, rank);
      expect(url).not.toBeNull();
      const relativePath = url!.replace(/^\//, "");
      const fullPath = path.join(publicDir, relativePath);
      expect(fs.existsSync(fullPath), `Expected asset to exist: ${fullPath}`).toBe(true);
    }
  });

  it("should dynamically resolve gendered in-game perk cards based on isFemale flag", () => {
    // Action Boy <-> Action Girl
    expect(getInGamePerkCardImage("action-boy", 1, false)).toBe("/images/in_game_cards/action_boy_r1.png");
    expect(getInGamePerkCardImage("action-boy", 1, true)).toBe("/images/in_game_cards/action_girl_r1.png");
    expect(getInGamePerkCardImage("action-boy", 3, true)).toBe("/images/in_game_cards/action_girl_r3.png");
    expect(getInGamePerkCardImage("action-girl", 1, false)).toBe("/images/in_game_cards/action_boy_r1.png");
    expect(getInGamePerkCardImage("action-girl", 2, true)).toBe("/images/in_game_cards/action_girl_r2.png");

    // Aquaboy <-> Aquagirl
    expect(getInGamePerkCardImage("aquaboy", 1, false)).toBe("/images/in_game_cards/aquaboy_r1.png");
    expect(getInGamePerkCardImage("aquaboy", 1, true)).toBe("/images/in_game_cards/aquagirl_r1.png");
    expect(getInGamePerkCardImage("aquagirl", 1, false)).toBe("/images/in_game_cards/aquaboy_r1.png");
    expect(getInGamePerkCardImage("aquagirl", 1, true)).toBe("/images/in_game_cards/aquagirl_r1.png");

    // Party Boy <-> Party Girl
    expect(getInGamePerkCardImage("party-boy", 1, false)).toBe("/images/in_game_cards/party_boy_r1.png");
    expect(getInGamePerkCardImage("party-boy", 1, true)).toBe("/images/in_game_cards/party_girl_r1.png");
    expect(getInGamePerkCardImage("party-boy", 2, true)).toBe("/images/in_game_cards/party_girl_r2.png");
    expect(getInGamePerkCardImage("party-girl", 1, false)).toBe("/images/in_game_cards/party_boy_r1.png");
    expect(getInGamePerkCardImage("party-girl", 2, true)).toBe("/images/in_game_cards/party_girl_r2.png");
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

    it("should accurately compare equipped card arrays for value equality", () => {
      const a = [
        { cardId: "blocker", rank: 3 },
        { cardId: "bandolier", rank: 2 },
      ];
      const b = [
        { cardId: "blocker", rank: 3 },
        { cardId: "bandolier", rank: 2 },
      ];
      const c = [
        { cardId: "blocker", rank: 3 },
        { cardId: "bandolier", rank: 1 },
      ];
      const d = [
        { cardId: "blocker", rank: 3 },
      ];

      expect(areEquippedCardsEqual(a, b)).toBe(true);
      expect(areEquippedCardsEqual(a, c)).toBe(false);
      expect(areEquippedCardsEqual(a, d)).toBe(false);
      expect(areEquippedCardsEqual(null, null)).toBe(true);
      expect(areEquippedCardsEqual(a, null)).toBe(false);
      expect(areEquippedCardsEqual(undefined, b)).toBe(false);
    });
  });
});

