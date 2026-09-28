import { describe, it, expect } from "vitest";
import { readdirSync } from "node:fs";
import path from "node:path";
import { webpSiblingForCardImage } from "./card-webp";

describe("webpSiblingForCardImage", () => {
  it("maps an in-game card PNG to its WebP sibling and nothing else", () => {
    expect(webpSiblingForCardImage("/images/in_game_cards/action_boy.png")).toBe(
      "/images/in_game_cards_webp/action_boy.webp",
    );
    expect(webpSiblingForCardImage("/images/in_game_cards/bullet_storm_r2.png")).toBe(
      "/images/in_game_cards_webp/bullet_storm_r2.webp",
    );
    expect(webpSiblingForCardImage("/images/perks_official/actionboy.svg")).toBeNull();
    expect(webpSiblingForCardImage(null)).toBeNull();
  });

  it("every card PNG has a generated WebP sibling (run scripts/perks/build-card-webp.mjs)", () => {
    const root = path.resolve(__dirname, "../../../public/images");
    const pngs = readdirSync(path.join(root, "in_game_cards"))
      .filter((n) => n.toLowerCase().endsWith(".png"))
      .map((n) => n.replace(/\.png$/i, ""));
    const webps = new Set(
      readdirSync(path.join(root, "in_game_cards_webp"))
        .filter((n) => n.toLowerCase().endsWith(".webp"))
        .map((n) => n.replace(/\.webp$/i, "")),
    );
    const missing = pngs.filter((n) => !webps.has(n));
    expect(pngs.length).toBeGreaterThan(800);
    expect(missing).toEqual([]);
  });
});
