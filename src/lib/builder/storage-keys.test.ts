import { describe, it, expect } from "vitest";
import { BUILDER_SESSION_KEYS, BUILDER_STORAGE_KEYS, perkLoadoutSlotKey } from "./storage-keys";

/** These strings are persisted in players' browsers. Changing one is a migration, not a rename. */
describe("builder storage keys", () => {
  it("pins every localStorage key", () => {
    expect(BUILDER_STORAGE_KEYS).toEqual({
      payload: "roll-builder-payload",
      saves: "roll-builder-saves",
      activePerkSlot: "roll_active_perk_slot",
      legendaryPerkIds: "roll_legendary_perk_ids",
      myTransmissions: "roll_my_transmissions",
      activeBuilderPayload: "roll_active_builder_payload",
      equippedPerks: "roll_equipped_perks",
      combatSwitchboardState: "roll_combat_switchboard_state"
    });
  });

  it("pins every sessionStorage key", () => {
    expect(BUILDER_SESSION_KEYS.modsCache).toBe("roll-builder-mods-v6-patch69");
    expect(BUILDER_SESSION_KEYS.legacyModsCaches).toEqual([
      "roll-builder-mods-cache",
      "roll-builder-mods-cache-v4",
      "roll-builder-mods-cache-v5"
    ]);
  });

  it("formats the perk loadout slot key exactly as before", () => {
    expect(perkLoadoutSlotKey("0")).toBe("roll_perk_loadout_slot_0");
    expect(perkLoadoutSlotKey(3)).toBe("roll_perk_loadout_slot_3");
  });
});
