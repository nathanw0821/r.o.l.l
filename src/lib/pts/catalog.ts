import ptsData from "@/data/pts-catalog.json";

export type PtsSectionId =
  | "all"
  | "4-star-mods"
  | "modified-effects"
  | "crafting-rules"
  | "event-datamines";

export interface PtsItem {
  id: string;
  name: string;
  section: PtsSectionId;
  tier: string;
  categories: string;
  description: string;
  extraComponent?: string;
  legendaryModules?: number;
  scripCost?: number;
  status: string;
  notes?: string;
  sourceName: string;
  sourceUrl: string;
}

export const PTS_SECTIONS: { id: PtsSectionId; label: string; icon: string; description: string }[] = [
  { id: "all", label: "All PTS Updates", icon: "🧪", description: "All active datamines and experimental test server builds" },
  { id: "4-star-mods", label: "4-Star Mods", icon: "⭐", description: "Upcoming 4th star legendary effects & Infestation drops" },
  { id: "modified-effects", label: "Modified Effects", icon: "⚡", description: "Rebalanced 1-3 star mods and new PTS legendary perks" },
  { id: "crafting-rules", label: "Crafting Overhauls", icon: "⚙️", description: "Scrip cost adjustments, Vault Steel rules & Unique Item modding" },
  { id: "event-datamines", label: "Event Datamines", icon: "🗺️", description: "Infestation faction bosses & endgame reward tables" }
];

export function getPtsCatalog(): PtsItem[] {
  return ptsData as PtsItem[];
}

export function filterPtsCatalog(params?: {
  section?: PtsSectionId;
  searchQuery?: string;
}): PtsItem[] {
  let items = getPtsCatalog();

  if (params?.section && params.section !== "all") {
    items = items.filter((item) => item.section === params.section);
  }

  if (params?.searchQuery?.trim()) {
    const q = params.searchQuery.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.categories.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
    );
  }

  return items;
}
