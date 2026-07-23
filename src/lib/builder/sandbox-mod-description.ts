import type { BaseGearPiece } from "@/lib/builder/base-gear";

function pieceToSandboxContext(piece: BaseGearPiece | null | undefined): "armor" | "weapon" | "any" {
  if (!piece) return "any";
  if (piece.kind === "weapon") return "weapon";
  if (piece.kind === "armor" || piece.kind === "powerArmor") return "armor";
  return "any";
}

/** Pull text after `[Armor]` / `[Weapon]` until the next bracket or end. */
function extractTaggedSection(raw: string, tag: "Armor" | "Weapon"): string | null {
  const re = new RegExp(`\\[${tag}\\]\\s*([^\\[]*)`, "i");
  const m = re.exec(raw);
  const chunk = m?.[1]?.trim();
  return chunk && chunk.length > 0 ? chunk : null;
}

/**
 * Collapse "Up to … based on …" style copy into a single maximum-at-a-glance line for the sandbox.
 * When both armor and weapon clauses exist (e.g. Aristocrat's in tracker text), `piece` picks the relevant one.
 */
function collapseScalingPhrases(s: string): string {
  let t = s.trim();
  t = t.replace(/\[Armor\]\s*/gi, "").replace(/\[Weapon\]\s*/gi, "");
  t = t.replace(/\bUp to\s+/gi, "");
  t = t.replace(/\s*based on caps\.?/gi, " (sandbox max)");
  t = t.replace(/\s*based on your caps\.?/gi, " (sandbox max)");
  t = t.replace(/\s*based on[^.]+/gi, " (sandbox max)");
  t = t.replace(/\s*\(sandbox max\)\s*\(sandbox max\)/gi, " (sandbox max)");
  t = t.replace(/\s+/g, " ");
  return t.trim();
}

export function sandboxLegendaryDescription(
  description: string | null | undefined,
  piece?: BaseGearPiece | null
): string {
  const raw = description?.trim() ?? "";
  if (!raw) return "";

  const ctx = pieceToSandboxContext(piece);
  const armorSeg = extractTaggedSection(raw, "Armor");
  const weaponSeg = extractTaggedSection(raw, "Weapon");

  if (armorSeg && weaponSeg) {
    if (ctx === "armor") return collapseScalingPhrases(armorSeg);
    if (ctx === "weapon") return collapseScalingPhrases(weaponSeg);
    const a = collapseScalingPhrases(armorSeg);
    const w = collapseScalingPhrases(weaponSeg);
    return `${a} · ${w}`;
  }

  if (armorSeg && !weaponSeg && ctx === "weapon") {
    return collapseScalingPhrases(raw);
  }
  if (weaponSeg && !armorSeg && ctx === "armor") {
    return collapseScalingPhrases(raw);
  }

  return collapseScalingPhrases(raw);
}
