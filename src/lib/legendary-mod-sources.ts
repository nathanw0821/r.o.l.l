import dataset from "@/content/legendary-mod-sources.json";

type SourceEntry = (typeof dataset.legendary_mod_sources)[number];
type SourceEffects = SourceEntry["effects"];
type StarKey = keyof SourceEffects;
export type CraftComponentKind = keyof typeof dataset.ui_theme.colors.components;

const tierByStarKey: Record<StarKey, string> = {
  star_1: "1 Star",
  star_2: "2 Star",
  star_3: "3 Star",
  star_4: "4 Star"
};

const sourceNotes = new Map<string, string[]>();

function normalizeValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[’']/g, "'")
    .replace(/v\.a\.t\.s\./gi, "vats")
    .replace(/anti-armor/gi, "anti armour")
    .replace(/-25%\s*vats\s*cost/gi, "vats optimized")
    .replace(/faster swing speed/gi, "rapid")
    .replace(/power attack damage/gi, "heavy hitter's")
    .replace(/lucky hit/gi, "lucky")
    .replace(/[^a-z0-9%+\-'\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function createMapKey(tierLabel: string, effectName: string) {
  return `${tierLabel}|${normalizeValue(effectName)}`;
}

function sanitizeNoteText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\[object Object\]/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatSourceNote(entry: SourceEntry, starKey: StarKey) {
  const suffix = starKey === "star_4" ? ", 4-star learn" : "";
  const itemName = sanitizeNoteText(entry.item_name);
  const sourceDetail = sanitizeNoteText(entry.source_detail);
  if (!itemName || !sourceDetail) return "";
  return `${itemName} (${sourceDetail}${suffix})`;
}

for (const entry of dataset.legendary_mod_sources) {
  (Object.entries(entry.effects) as [StarKey, string][]).forEach(([starKey, effectName]) => {
    if (!effectName) return;
    const key = createMapKey(tierByStarKey[starKey], effectName);
    const current = sourceNotes.get(key) ?? [];
    const note = formatSourceNote(entry, starKey);
    if (!note) return;
    current.push(note);
    sourceNotes.set(key, current);
  });
}

export const legendaryModSourcesDataset = dataset;
export const legendaryModUiTheme = dataset.ui_theme;

export function appendLegendaryModSourceNotes(
  existingNotes: string | null | undefined,
  effectName: string,
  tierLabel?: string | null
) {
  if (!tierLabel) return existingNotes ?? undefined;
  const matches = sourceNotes.get(createMapKey(tierLabel, effectName));
  if (!matches || matches.length === 0) return existingNotes ?? undefined;

  const deduped = Array.from(new Set(matches)).sort((left, right) => left.localeCompare(right));
  const addition = `Scrap source: ${deduped.join(" | ")}`;

  const safeExisting = sanitizeNoteText(existingNotes);
  if (!safeExisting) return addition;
  if (safeExisting.toLowerCase().includes(addition.toLowerCase())) return safeExisting;
  return `${safeExisting} | ${addition}`;
}

export function getCraftComponentKind(value?: string | null): CraftComponentKind {
  const normalized = normalizeValue(value ?? "");
  if (!normalized) return "default";
  if (normalized.includes("bobblehead")) return "bobblehead";
  if (normalized.includes("magazine")) return "magazine";
  if (normalized.includes("flux")) return "flux";
  if (
    ["whiskey", "sugar", "bubblegum", "ham", "nuka", "food", "drink"].some((token) =>
      normalized.includes(token)
    )
  ) {
    return "food_drink";
  }
  if (
    [
      "serum",
      "mentats",
      "med x",
      "psycho",
      "psychotats",
      "buffout",
      "overdrive",
      "liquid courage",
      "stimpak",
      "stealth boy",
      "bloodpack",
      "blood pack",
      "fury"
    ].some((token) => normalized.includes(token))
  ) {
    return "chem";
  }
  if (
    [
      "steel",
      "wood",
      "oil",
      "gear",
      "concrete",
      "titanium",
      "springs",
      "fiber",
      "cork",
      "circuitry",
      "gunpowder",
      "asbestos",
      "lead",
      "nuclear material",
      "leather"
    ].some((token) => normalized.includes(token))
  ) {
    return "junk";
  }
  return "default";
}
