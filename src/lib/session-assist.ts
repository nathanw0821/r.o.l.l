import type { SelectionSource } from "@/lib/filter-utils";

export type SessionAssistRow = {
  id: string;
  effect: { name: string };
  tier?: { label?: string } | null;
  categories: { category: { name: string } }[];
  unlocked: boolean;
  selectionSource?: SelectionSource;
};
