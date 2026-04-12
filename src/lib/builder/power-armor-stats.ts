import type { ArmorSetStats } from "@/lib/builder/armor-sets";

/** Frame key shared by torso + helmet ids (e.g. `excavator` for `excavator-torso` / `excavator-helm`). */
export function powerArmorFrameFromPieceId(pieceId: string): string | null {
  const m = /^(.*)-(torso|helm|chest)$/.exec(pieceId);
  return m?.[1] ?? null;
}

function statsForFrame(frame: string, slot: "torso" | "helmet"): ArmorSetStats | null {
  const row = POWER_ARMOR_FRAME_BASE[frame];
  if (!row) return null;
  return slot === "torso" ? row.torso : row.helmet;
}

/** Resist table rows for sandbox totals (approximate max-tier ballpark; tweak as you tune the sim). */
export const POWER_ARMOR_FRAME_BASE: Record<string, { torso: ArmorSetStats; helmet: ArmorSetStats }> = {
  "raider-pa": {
    torso: { dr: 98, er: 98, fr: 98, cr: 98, pr: 98, rr: 98 },
    helmet: { dr: 57, er: 57, fr: 57, cr: 57, pr: 57, rr: 57 }
  },
  t45: {
    torso: { dr: 114, er: 114, fr: 114, cr: 114, pr: 114, rr: 114 },
    helmet: { dr: 66, er: 66, fr: 66, cr: 66, pr: 66, rr: 66 }
  },
  t51: {
    torso: { dr: 122, er: 122, fr: 122, cr: 122, pr: 122, rr: 122 },
    helmet: { dr: 71, er: 71, fr: 71, cr: 71, pr: 71, rr: 71 }
  },
  t60: {
    torso: { dr: 130, er: 130, fr: 130, cr: 130, pr: 130, rr: 130 },
    helmet: { dr: 75, er: 75, fr: 75, cr: 75, pr: 75, rr: 75 }
  },
  t65: {
    torso: { dr: 151, er: 151, fr: 151, cr: 151, pr: 151, rr: 151 },
    helmet: { dr: 88, er: 88, fr: 88, cr: 88, pr: 88, rr: 88 }
  },
  excavator: {
    torso: { dr: 120, er: 120, fr: 120, cr: 120, pr: 120, rr: 120 },
    helmet: { dr: 70, er: 70, fr: 70, cr: 70, pr: 70, rr: 70 }
  },
  x01: {
    torso: { dr: 141, er: 141, fr: 141, cr: 141, pr: 141, rr: 141 },
    helmet: { dr: 82, er: 82, fr: 82, cr: 82, pr: 82, rr: 82 }
  },
  ultracite: {
    torso: { dr: 138, er: 138, fr: 138, cr: 138, pr: 138, rr: 138 },
    helmet: { dr: 80, er: 80, fr: 80, cr: 80, pr: 80, rr: 80 }
  },
  "strangler-heart": {
    torso: { dr: 135, er: 135, fr: 135, cr: 135, pr: 135, rr: 135 },
    helmet: { dr: 78, er: 78, fr: 78, cr: 78, pr: 78, rr: 78 }
  },
  hellcat: {
    torso: { dr: 134, er: 134, fr: 134, cr: 134, pr: 134, rr: 134 },
    helmet: { dr: 78, er: 78, fr: 78, cr: 78, pr: 78, rr: 78 }
  },
  "union-pa": {
    torso: { dr: 136, er: 136, fr: 136, cr: 136, pr: 136, rr: 136 },
    helmet: { dr: 79, er: 79, fr: 79, cr: 79, pr: 79, rr: 79 }
  },
  "hellfire-prototype": {
    torso: { dr: 145, er: 145, fr: 145, cr: 145, pr: 145, rr: 145 },
    helmet: { dr: 84, er: 84, fr: 84, cr: 84, pr: 84, rr: 84 }
  },
  vulcan: {
    torso: { dr: 142, er: 142, fr: 142, cr: 142, pr: 142, rr: 142 },
    helmet: { dr: 82, er: 82, fr: 82, cr: 82, pr: 82, rr: 82 }
  }
};

export function mergeArmorSetStats(a: ArmorSetStats, b: ArmorSetStats): ArmorSetStats {
  return {
    dr: a.dr + b.dr,
    er: a.er + b.er,
    fr: a.fr + b.fr,
    cr: a.cr + b.cr,
    pr: a.pr + b.pr,
    rr: a.rr + b.rr
  };
}

export function getPowerArmorSlotBaseStats(pieceId: string, slot: "torso" | "helmet"): ArmorSetStats | null {
  const frame = powerArmorFrameFromPieceId(pieceId);
  if (!frame) return null;
  return statsForFrame(frame, slot);
}

/** Torso row + optional equipped helmet row (FO76: no legendary stars on PA helmet; misc + material still apply). */
export function getPowerArmorCombinedBaseStats(
  torsoPieceId: string,
  helmetPieceId: string | null | undefined
): ArmorSetStats | null {
  const torso = getPowerArmorSlotBaseStats(torsoPieceId, "torso");
  if (!torso) return null;
  if (!helmetPieceId) return torso;
  const helmet = getPowerArmorSlotBaseStats(helmetPieceId, "helmet");
  if (!helmet) return torso;
  return mergeArmorSetStats(torso, helmet);
}

export function defaultHelmetIdForTorsoPieceId(torsoId: string): string | null {
  const frame = powerArmorFrameFromPieceId(torsoId);
  if (!frame || !statsForFrame(frame, "torso")) return null;
  if (torsoId.endsWith("-torso")) return `${frame}-helm`;
  if (torsoId.endsWith("-chest")) return `${frame}-helm`;
  return null;
}

export function isKnownPowerArmorHelmetPieceId(helmetId: string): boolean {
  if (!helmetId.endsWith("-helm")) return false;
  const frame = powerArmorFrameFromPieceId(helmetId);
  return Boolean(frame && POWER_ARMOR_FRAME_BASE[frame]);
}
