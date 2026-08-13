import { sanitizeTitle } from "@/lib/utils/clean-formatting";

export type LocalProgressEntry = {
  unlocked: boolean;
  isSeeking?: boolean;
  modCount?: number;
};

export type LocalProgressMap = Record<string, LocalProgressEntry>;

export function findLocalProgressEntry(
  localProgress: LocalProgressMap | null | undefined,
  rowId: string,
  effectName: string,
  tierLabel?: string | null,
  rowIndex?: number
): LocalProgressEntry | undefined {
  if (!localProgress) return undefined;

  // 1. Direct candidate key lookups
  if (localProgress[rowId] !== undefined) {
    return localProgress[rowId];
  }

  const lowerName = effectName.toLowerCase().trim();
  const slugName = lowerName.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const cleanName = sanitizeTitle(effectName).toLowerCase().replace(/[^a-z0-9]/g, "");
  const rawClean = lowerName.replace(/[^a-z0-9]/g, "");
  const strippedId = rowId.replace(/^effect-\dstar-/, "").replace(/^effect-/, "");
  const starNum = tierLabel ? tierLabel.replace(/[^0-9]/g, "") : (rowId.match(/\d/) || [""])[0];

  const candidateKeys = [
    rowId,
    effectName,
    lowerName,
    slugName,
    cleanName,
    rawClean,
    strippedId,
    // Hyphen star formats
    `${starNum}star-${slugName}`,
    `${starNum}-star-${slugName}`,
    `effect-${starNum}star-${slugName}`,
    `effect-${starNum}-star-${slugName}`,
    `${slugName}-${starNum}star`,
    `${slugName}-${starNum}-star`,
    // Underscore star formats
    `${starNum}star_${slugName}`,
    `${starNum}_star_${slugName}`,
    `effect_${starNum}star_${slugName}`,
    `effect_${starNum}_star_${slugName}`,
    `${slugName}_${starNum}star`,
    `${slugName}_${starNum}_star`,
    // Direct concatenated formats
    `${starNum}star_${cleanName}`,
    `${starNum}_star_${cleanName}`,
    `${cleanName}_${starNum}star`,
    `${cleanName}_${starNum}_star`,
    `${starNum}star${cleanName}`,
    `${cleanName}${starNum}star`
  ];

  for (const key of candidateKeys) {
    if (localProgress[key] !== undefined) {
      return localProgress[key];
    }
  }

  // 2. Numeric index position lookup
  if (rowIndex !== undefined) {
    const idxStr = String(rowIndex);
    if (localProgress[idxStr] !== undefined) return localProgress[idxStr];
    if (localProgress[`item_${idxStr}`] !== undefined) return localProgress[`item_${idxStr}`];
    if (localProgress[`idx_${idxStr}`] !== undefined) return localProgress[`idx_${idxStr}`];
  }

  // 3. Fallback fuzzy search across all entries in localProgress
  const entries = Object.entries(localProgress);
  for (const [key, val] of entries) {
    const kLower = key.toLowerCase();
    const kClean = kLower.replace(/[^a-z0-9]/g, "");

    if (kClean === cleanName || kClean === rawClean || (cleanName.length >= 4 && kClean.includes(cleanName))) {
      // If tier number is present in key, enforce matching star tier
      if (starNum && (kLower.includes("star") || kLower.includes("tier"))) {
        if (kLower.includes(starNum)) {
          return val;
        }
      } else {
        return val;
      }
    }
  }

  return undefined;
}
