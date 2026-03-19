// Data model aligned to the TSV source structure and normalized app schema.

export type Id = string;

// -----------------------------
// Source dataset (raw rows)
// -----------------------------
export interface SourceDataset {
  id: Id;
  datasetVersionId: Id;
  name: string;
  sourcePath?: string;
  canonical: boolean;
  headerColumns?: string[];
  createdAt: Date;
}

export interface SourceEffectRow {
  id: Id;
  datasetId: Id;
  rowIndex: number;
  rawColumns: string[];
  tierLabel?: string;
  effectName?: string;
  categories?: string;
  description?: string;
  extraComponent?: string;
  legendaryModules?: number;
  unlockedRaw?: string;
  notes?: string;
  effectTierId?: Id;
}

// -----------------------------
// Normalized app dataset
// -----------------------------
export interface Tier {
  id: number;
  label: string;
}

export interface Effect {
  id: Id;
  datasetVersionId: Id;
  name: string;
}

export interface EffectTier {
  id: Id;
  datasetVersionId: Id;
  effectId: Id;
  tierId: number;
  description?: string;
  extraComponent?: string;
  legendaryModules?: number;
  notes?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface EffectTierCategory {
  effectTierId: Id;
  categoryId: number;
}

// -----------------------------
// User progress (separate from source)
// -----------------------------
export interface User {
  id: Id;
  profileDatasetVersionId?: Id;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
}

export interface UserProgress {
  id: Id;
  userId: Id;
  effectTierId: Id;
  unlocked: boolean;
  notes?: string;
  updatedAt: Date;
}

export interface DatasetVersion {
  id: Id;
  label: string;
  sourceType: string;
  sourceName?: string;
  sourceUrl?: string;
  syncMetadata?: Record<string, unknown>;
  importedAt: Date;
  isActive: boolean;
}

export interface UserSettings {
  id: Id;
  userId: Id;
  theme: string;
  accent: string;
  density: string;
  colorBlind: string;
}
