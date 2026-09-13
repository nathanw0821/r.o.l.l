/**
 * Every browser storage key the builder reads or writes, in one place.
 * Renaming any of these is a data migration for existing players: their saved
 * payloads, holotape slots, perk loadouts and transmission ownership live under
 * these exact strings. The test next to this file pins them.
 */
export const BUILDER_STORAGE_KEYS = {
  /** Active builder payload (localStorage). */
  payload: "roll-builder-payload",
  /** Ten holotape preset slots (localStorage). */
  saves: "roll-builder-saves",
  /** Index of the active perk loadout slot; see perkLoadoutSlotKey (localStorage). */
  activePerkSlot: "roll_active_perk_slot",
  /** Equipped legendary perk ids written by the Nukes & Dragons import (localStorage). */
  legendaryPerkIds: "roll_legendary_perk_ids",
  /** Transmissions this browser published, for ownership checks (localStorage). */
  myTransmissions: "roll_my_transmissions",
  /** Snapshot keys read by the screenshot-assist flow (localStorage). */
  activeBuilderPayload: "roll_active_builder_payload",
  equippedPerks: "roll_equipped_perks",
  combatSwitchboardState: "roll_combat_switchboard_state"
} as const;

export const BUILDER_SESSION_KEYS = {
  /** Cached legendary mod catalog for the current patch (sessionStorage). */
  modsCache: "roll-builder-mods-v6-patch69",
  /** Older cache keys that are purged on load. */
  legacyModsCaches: ["roll-builder-mods-cache", "roll-builder-mods-cache-v4", "roll-builder-mods-cache-v5"]
} as const;

/** localStorage key holding the perk loadout for a given slot index. */
export function perkLoadoutSlotKey(slot: string | number): string {
  return `roll_perk_loadout_slot_${slot}`;
}
