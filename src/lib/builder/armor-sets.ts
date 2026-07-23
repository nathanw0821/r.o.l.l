/**
 * Full-set armor resistances (DR/ER/FR/CR/PR/RR) from Nuka Knights —
 * "Expected Changes for The Backwoods Update on 3rd March 2026" armor table.
 * @see https://nukaknights.com/articles/expected-changes-for-the-backwoods-update-on-3rd-march-2026.html#armor
 */
export type ArmorSetStats = {
  dr: number;
  er: number;
  fr: number;
  cr: number;
  pr: number;
  rr: number;
};

export type ArmorSetRow = { key: string; label: string; stats: ArmorSetStats };

/** Body slot order in payload: chest → arms → legs (matches UI). */
export const ARMOR_SET_SLOT_LABELS = [
  "Chest",
  "Left arm",
  "Right arm",
  "Left leg",
  "Right leg"
] as const;

/** Resistances for a complete five-piece set at max tier (article values). */
export const ARMOR_SET_ROWS: ArmorSetRow[] = [
  { key: "secret-service", label: "Secret Service", stats: { dr: 278, er: 200, fr: 35, cr: 35, pr: 35, rr: 248 } },
  { key: "civil-engineer", label: "Civil Engineer", stats: { dr: 155, er: 305, fr: 66, cr: 155, pr: 52, rr: 194 } },
  { key: "bos-recon", label: "Brotherhood Recon", stats: { dr: 346, er: 130, fr: 52, cr: 133, pr: 66, rr: 130 } },
  { key: "covert-scout", label: "Covert Scout", stats: { dr: 155, er: 155, fr: 82, cr: 52, pr: 52, rr: 82 } },
  { key: "urban-scout", label: "Urban Scout", stats: { dr: 200, er: 150, fr: 52, cr: 52, pr: 52, rr: 52 } },
  { key: "forest-scout", label: "Forest Scout", stats: { dr: 194, er: 130, fr: 66, cr: 52, pr: 66, rr: 52 } },
  { key: "marine", label: "Marine", stats: { dr: 155, er: 57, fr: 47, cr: 49, pr: 30, rr: 90 } },
  { key: "arctic-marine", label: "Arctic Marine", stats: { dr: 150, er: 130, fr: 52, cr: 82, pr: 150, rr: 82 } },
  { key: "heavy-combat", label: "Heavy combat", stats: { dr: 213, er: 185, fr: 82, cr: 134, pr: 82, rr: 108 } },
  { key: "sturdy-combat", label: "Sturdy combat", stats: { dr: 166, er: 144, fr: 64, cr: 105, pr: 64, rr: 84 } },
  { key: "light-combat", label: "Light combat", stats: { dr: 130, er: 113, fr: 52, cr: 82, pr: 52, rr: 66 } },
  { key: "heavy-raider", label: "Heavy raider", stats: { dr: 145, er: 48, fr: 63, cr: 166, pr: 48, rr: 76 } },
  { key: "sturdy-raider", label: "Sturdy raider", stats: { dr: 115, er: 37, fr: 51, cr: 130, pr: 37, rr: 59 } },
  { key: "light-raider", label: "Light raider", stats: { dr: 90, er: 30, fr: 40, cr: 101, pr: 30, rr: 47 } },
  { key: "botsmith", label: "Botsmith", stats: { dr: 249, er: 97, fr: 52, cr: 52, pr: 52, rr: 97 } },
  { key: "trapper", label: "Trapper", stats: { dr: 117, er: 101, fr: 60, cr: 30, pr: 71, rr: 90 } },
  { key: "thorn", label: "Thorn", stats: { dr: 155, er: 150, fr: 130, cr: 55, pr: 55, rr: 66 } },
  { key: "solar", label: "Solar", stats: { dr: 150, er: 173, fr: 82, cr: 133, pr: 52, rr: 82 } },
  { key: "wood", label: "Wood", stats: { dr: 144, er: 48, fr: 138, cr: 17, pr: 30, rr: 30 } },
  { key: "heavy-metal", label: "Heavy metal", stats: { dr: 408, er: 67, fr: 67, cr: 54, pr: 67, rr: 87 } },
  { key: "sturdy-metal", label: "Sturdy metal", stats: { dr: 270, er: 54, fr: 54, cr: 42, pr: 54, rr: 68 } },
  { key: "light-metal", label: "Light metal", stats: { dr: 248, er: 42, fr: 42, cr: 35, pr: 42, rr: 55 } },
  { key: "heavy-leather", label: "Heavy leather", stats: { dr: 82, er: 243, fr: 87, cr: 67, pr: 185, rr: 82 } },
  { key: "sturdy-leather", label: "Sturdy leather", stats: { dr: 64, er: 191, fr: 68, cr: 54, pr: 144, rr: 64 } },
  { key: "light-leather", label: "Light leather", stats: { dr: 52, er: 150, fr: 55, cr: 42, pr: 113, rr: 52 } },
  { key: "heavy-robot", label: "Heavy robot", stats: { dr: 318, er: 134, fr: 54, cr: 82, pr: 82, rr: 108 } },
  { key: "sturdy-robot", label: "Sturdy robot", stats: { dr: 248, er: 105, fr: 42, cr: 64, pr: 64, rr: 84 } },
  { key: "light-robot", label: "Light robot", stats: { dr: 194, er: 82, fr: 35, cr: 52, pr: 52, rr: 66 } }
];

const byKey = new Map(ARMOR_SET_ROWS.map((r) => [r.key, r]));

export function getArmorSetRow(key: string): ArmorSetRow | undefined {
  return byKey.get(key);
}

export function basePieceIdForArmorSet(key: string): string {
  return `armor-set-${key}`;
}

export function armorSetKeyFromBasePieceId(basePieceId: string): string | null {
  const m = /^armor-set-(.+)$/.exec(basePieceId);
  return m?.[1] ?? null;
}
