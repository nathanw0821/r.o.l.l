"use client";

import PerkBuilder from "@/components/perks/perk-builder";
import { cn } from "@/lib/utils";

type PerkBuilderProps = React.ComponentProps<typeof PerkBuilder>;

/**
 * Master tab 2: Perk deck & S.P.E.C.I.A.L. The eight props forwarded to
 * <PerkBuilder> are typed from its own props so they cannot drift.
 */
export type PerkDeckTabProps = {
  active: boolean;
  readOnly: PerkBuilderProps["readOnly"];
  baseSpecial: PerkBuilderProps["initialSpecials"];
  equippedPerkCards: PerkBuilderProps["initialEquippedCards"];
  legendaryPerkIds: PerkBuilderProps["initialLegendaryPerks"];
  importedBuildForPerkBuilder: PerkBuilderProps["externalImport"];
  handlePerkLoadoutChange: PerkBuilderProps["onLoadoutChange"];
  /** Cards the active weapon grants (Western Spirit: Gunslinger Master), free of point cost. */
  grantedCards?: PerkBuilderProps["grantedCards"];
};

export default function PerkDeckTab({
  active,
  readOnly,
  baseSpecial,
  equippedPerkCards,
  legendaryPerkIds,
  importedBuildForPerkBuilder,
  handlePerkLoadoutChange,
  grantedCards,
}: PerkDeckTabProps) {
  return (
<div className={cn("space-y-4 animate-in fade-in duration-200", active ? "block" : "hidden")}>
  <PerkBuilder
    mode="live"
    readOnly={readOnly}
    initialSpecials={baseSpecial}
    initialEquippedCards={equippedPerkCards}
    initialLegendaryPerks={legendaryPerkIds}
    externalImport={importedBuildForPerkBuilder}
    onLoadoutChange={handlePerkLoadoutChange}
    grantedCards={grantedCards}
  />
</div>
  );
}
