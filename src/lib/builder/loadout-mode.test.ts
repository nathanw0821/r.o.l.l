import { describe, it, expect } from "vitest";
import { defaultPayload } from "./normalize-builder-payload";
import { getBaseGearPiece } from "./base-gear";
import { aggregateEffectMath } from "./compatibility";
import { getArmorSetRow } from "./armor-sets";
import {
  applyChassisSelection,
  applyPowerArmorSnapshot,
  applyRegularSnapshot,
  armorModeOf,
  defaultChassisIdForMode,
  powerArmorSetCompletion,
  snapshotPowerArmorLoadout,
  snapshotRegularLoadout,
  underarmorBasePieceIdForShell,
} from "./loadout-mode";

const civil = getBaseGearPiece("armor-set-civil-engineer")!;
const secretService = getBaseGearPiece("armor-set-secret-service")!;
const t60 = getBaseGearPiece("t60-torso")!;

describe("applyChassisSelection", () => {
  it("resets the mixed-set keys so a newly picked armor set wins in the math", () => {
    // A user touched one slot dropdown: the keys are filled with the old set.
    const touched = {
      ...applyChassisSelection(defaultPayload(), civil),
      armorPieceSetKeys: Array.from({ length: 5 }, () => "civil-engineer"),
    };
    const next = applyChassisSelection(touched, secretService);
    expect(next.armorPieceSetKeys).toEqual(Array.from({ length: 5 }, () => "secret-service"));

    // The resist math now follows the frame (before the fix the stale keys outranked it).
    const totals = aggregateEffectMath([], {
      ghoul: false,
      extraLayers: [],
      baseArmorStats: getArmorSetRow("secret-service")!.stats,
      armorPieceSetKeys: next.armorPieceSetKeys,
    });
    const perPiece = Math.round(getArmorSetRow("secret-service")!.stats.dr / 5);
    expect(totals.dr).toBe(perPiece * 5);
  });

  it("keeps the mixed-set keys untouched when a power armor frame is picked", () => {
    const regular = {
      ...applyChassisSelection(defaultPayload(), civil),
      armorPieceSetKeys: ["civil-engineer", "secret-service", "civil-engineer", "civil-engineer", "civil-engineer"],
    };
    const pa = applyChassisSelection(regular, t60);
    expect(pa.equipmentKind).toBe("powerArmor");
    expect(pa.armorLegendaryModIds).toHaveLength(6);
    expect(pa.armorPieceCrafting).toHaveLength(6);
    expect(pa.armorPieceSetKeys).toEqual(regular.armorPieceSetKeys);
  });

  it("ignores weapons and underarmor", () => {
    const p = defaultPayload();
    expect(applyChassisSelection(p, getBaseGearPiece("fixer")!)).toBe(p);
    expect(applyChassisSelection(p, getBaseGearPiece("ua-casual")!)).toBe(p);
  });
});

describe("mode snapshots", () => {
  it("round-trips a regular loadout through power armor and back", () => {
    const regular = {
      ...applyChassisSelection(defaultPayload(), secretService),
      armorPieceSetKeys: ["secret-service", "secret-service", "civil-engineer", "secret-service", "secret-service"],
    };
    regular.armorLegendaryModIds[1] = ["unyielding", null, null, null];
    regular.armorPieceCrafting[2] = { materialModId: "polymer", miscModId: "none" };

    const snap = snapshotRegularLoadout(regular, secretService.id);
    const pa = applyChassisSelection(regular, t60);
    expect(armorModeOf(t60)).toBe("powerArmor");

    const back = applyRegularSnapshot(pa, snap);
    expect(back.basePieceId).toBe(secretService.id);
    expect(back.armorPieceSetKeys).toEqual(regular.armorPieceSetKeys);
    expect(back.armorLegendaryModIds).toEqual(regular.armorLegendaryModIds);
    expect(back.armorPieceCrafting).toEqual(regular.armorPieceCrafting);
    expect(back.powerArmorHelmetId).toBeNull();
  });

  it("round-trips a power armor loadout through regular armor and back", () => {
    const pa = applyChassisSelection(defaultPayload(), t60);
    pa.powerArmorPiecesEquipped = [true, true, false, true, true, true];
    pa.armorLegendaryModIds[1] = ["overeaters", null, null, null];
    pa.powerArmorHelmetId = "t60-helm";

    const snap = snapshotPowerArmorLoadout(pa, t60.id);
    const regular = applyChassisSelection(pa, civil);
    expect(regular.powerArmorPiecesEquipped.every(Boolean)).toBe(true);

    const back = applyPowerArmorSnapshot(regular, snap);
    expect(back.basePieceId).toBe(t60.id);
    expect(back.powerArmorPiecesEquipped).toEqual([true, true, false, true, true, true]);
    expect(back.armorLegendaryModIds[1]).toEqual(["overeaters", null, null, null]);
    expect(back.powerArmorHelmetId).toBe("t60-helm");
    expect(powerArmorSetCompletion(back)).toEqual({ equipped: 5, total: 6 });
  });

  it("falls back to the first catalog entry of the mode when a snapshot id is stale", () => {
    const p = applyChassisSelection(defaultPayload(), t60);
    const back = applyRegularSnapshot(p, {
      chassisId: "armor-set-does-not-exist",
      armorLegendaryModIds: [],
      armorPieceCrafting: [],
    });
    expect(back.basePieceId).toBe(defaultChassisIdForMode("regular"));
    expect(back.armorLegendaryModIds).toHaveLength(5);
  });
});

describe("underarmorBasePieceIdForShell", () => {
  it("maps a worn shell to its ledger row and unknown shells to null", () => {
    expect(underarmorBasePieceIdForShell("casual")).toBe("ua-casual");
    expect(underarmorBasePieceIdForShell("nope")).toBeNull();
    expect(underarmorBasePieceIdForShell(null)).toBeNull();
  });
});
