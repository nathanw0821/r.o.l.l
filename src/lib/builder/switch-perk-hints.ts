/**
 * Which equipped perk cards a Vitals switch changes. First cut, data-free: the card lists mirror
 * the conditions the defensive layer, the vitals sheet and the firepower engine already apply
 * (Iron Stomach / Natural Resistance / Thirst Quencher read `isDiseased`; Evasive and Packin'
 * Light read `isOverEncumbered`). Names come from the perk catalog; nothing else is invented.
 */
import { getPerkCardById } from "@/lib/perks/catalog";

export type VitalsSwitch = "diseased" | "overEncumbered";

export const SWITCH_PERK_DEPENDENCIES: Record<VitalsSwitch, readonly string[]> = {
  diseased: ["iron-stomach", "natural-resistance", "thirst-quencher"],
  overEncumbered: ["evasive", "packin-light"],
};

/** Display names of the equipped cards `switchName` changes, in catalog-list order; empty when none. */
export function equippedSwitchPerkNames(switchName: VitalsSwitch, equippedPerkIds: ReadonlyArray<string>): string[] {
  const equipped = new Set(equippedPerkIds);
  return SWITCH_PERK_DEPENDENCIES[switchName]
    .filter((id) => equipped.has(id))
    .map((id) => getPerkCardById(id)?.name ?? id);
}
