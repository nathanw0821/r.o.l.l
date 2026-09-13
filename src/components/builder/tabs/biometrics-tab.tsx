"use client";

import * as React from "react";
import BuilderCombatSwitchboard, { type CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";
import type { CombatFirepowerResult } from "@/lib/builder/combat-firepower-engine";
import type { BuilderPayload } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

type SwitchboardProps = React.ComponentProps<typeof BuilderCombatSwitchboard>;

/** Master tab 3: Biometrics & stances, wrapping <BuilderCombatSwitchboard>. */
export type BiometricsTabProps = {
  active: boolean;
  readOnly: SwitchboardProps["readOnly"];
  switchboardState: CombatSwitchboardState | null;
  setSwitchboardState: React.Dispatch<React.SetStateAction<CombatSwitchboardState | null>>;
  weaponFirepowerResult: CombatFirepowerResult | null;
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  activeTacticalTags: SwitchboardProps["activeTacticalTags"];
};

export default function BiometricsTab({
  active,
  readOnly,
  switchboardState,
  setSwitchboardState,
  weaponFirepowerResult,
  payload,
  setPayload,
  activeTacticalTags,
}: BiometricsTabProps) {
  return (
<div className={cn("space-y-4 animate-in fade-in duration-200", active ? "block" : "hidden")}>
  <BuilderCombatSwitchboard
    readOnly={readOnly}
    initialState={switchboardState || undefined}
    rawDamage={weaponFirepowerResult?.damagePerShot.normal ?? 110}
    isGhoul={payload.ghoul}
    onSpeciesChange={(isGhoul) => setPayload((p) => ({ ...p, ghoul: isGhoul }))}
    activeMutations={payload.mutationIds}
    onMutationsChange={(nextMutations) =>
      setPayload((p) => ({ ...p, mutationIds: nextMutations }))
    }
    hasStrangeInNumbers={payload.hasStrangeInNumbers}
    onStrangeInNumbersChange={(enabled) =>
      setPayload((p) => ({ ...p, hasStrangeInNumbers: enabled }))
    }
    ignoreMutationPenalties={payload.ignoreMutationPenalties}
    onIgnoreMutationPenaltiesChange={(enabled) =>
      setPayload((p) => ({ ...p, ignoreMutationPenalties: enabled }))
    }
    onStateChange={setSwitchboardState}
    activeTacticalTags={activeTacticalTags}
    critQualification={weaponFirepowerResult?.critCycle}
  />
</div>
  );
}
