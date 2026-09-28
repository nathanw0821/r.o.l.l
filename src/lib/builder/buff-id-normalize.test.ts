import { describe, it, expect } from "vitest";
import { normalizeActiveBuffs, normalizeBuffId } from "./buff-id-normalize";
import { ALL_ALCOHOL, ALL_BOBBLEHEADS, ALL_CHEMS, ALL_MAGAZINES } from "./all-fallout76-buffs";

describe("normalizeBuffId", () => {
  it("maps the switchboard's catalog ids to the engine's short names and keeps short names", () => {
    expect(normalizeBuffId("chem-psychotats")).toBe("psychotats");
    expect(normalizeBuffId("psychotats")).toBe("psychotats");
    expect(normalizeBuffId("bobble-small-guns")).toBe("small-guns");
    expect(normalizeBuffId("bobble-energy")).toBe("energy-weapons");
    expect(normalizeBuffId("mag-gb3")).toBe("guns-and-bullets-3");
    expect(normalizeBuffId("mag-ts7")).toBe("tesla-science-7");
    expect(normalizeBuffId("brew-ballistic-bock")).toBe("ballistic-bock");
    expect(normalizeBuffId("meat-glowing-steak")).toBe("glowing-steak");
    expect(normalizeBuffId(null)).toBeNull();
  });

  it("covers every catalog id the engine has a damage rule for", () => {
    const ids = new Set(
      [...ALL_CHEMS, ...ALL_BOBBLEHEADS, ...ALL_MAGAZINES, ...ALL_ALCOHOL].map((b) => normalizeBuffId(b.id)),
    );
    for (const engineId of [
      "psychotats", "psychobuff", "overdrive",
      "small-guns", "big-guns", "energy-weapons", "melee",
      "guns-and-bullets-3", "tesla-science-7", "tesla-science-8",
      "ballistic-bock", "high-voltage-hefe",
    ]) {
      expect(ids.has(engineId), engineId).toBe(true);
    }
  });

  it("normalises a whole activeBuffs block without touching mutations", () => {
    expect(
      normalizeActiveBuffs({
        activeDrug: "chem-overdrive",
        activeFoods: ["plant-blight-soup", "meat-glowing-steak"],
        activeBobblehead: "bobble-big-guns",
        activeMagazine: "mag-ts8",
        activeAlcohol: "brew-high-voltage-hefe",
        activeMutations: ["carnivore"],
      }),
    ).toEqual({
      activeDrug: "overdrive",
      activeFood: null,
      activeFoods: ["blight-soup", "glowing-steak"],
      activeBobblehead: "big-guns",
      activeMagazine: "tesla-science-8",
      activeAlcohol: "high-voltage-hefe",
      activeMutations: ["carnivore"],
    });
  });
});
