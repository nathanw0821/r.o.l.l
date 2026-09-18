import ptsData from "@/data/pts-catalog.json";

export type PtsSectionId =
  | "all"
  | "4-star-mods"
  | "modified-effects"
  | "crafting-rules"
  | "event-datamines";

export interface PtsItem {
  binaryVerified?: boolean;
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
  { id: "all", label: "All PTS Updates", icon: "🧪", description: "Everything tracked through the last test cycle, with the patch it shipped in" },
  { id: "4-star-mods", label: "4-Star Mods", icon: "⭐", description: "4th star legendary effects and where they drop" },
  { id: "modified-effects", label: "Modified Effects", icon: "⚡", description: "Rebalanced mods and reworked perks" },
  { id: "crafting-rules", label: "Crafting Overhauls", icon: "⚙️", description: "Scrip costs, Vault Steel and unique item modding" },
  { id: "event-datamines", label: "Event Datamines", icon: "🗺️", description: "Event bosses and reward tables" }
];

import { sortAlphanumerically } from "@/lib/utils/alphanumeric-sort";

export function getPtsCatalog(): PtsItem[] {
  return sortAlphanumerically(ptsData as PtsItem[], (item) => item.name);
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

  return sortAlphanumerically(items, (item) => item.name);
}
