import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { getPerkCardById, searchPerkCards, filterPerksBySpecial, calculateSpecialCapacity, calculateLegendarySpecialBonuses, getGenderedPerkName } from "./catalog";
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
});

