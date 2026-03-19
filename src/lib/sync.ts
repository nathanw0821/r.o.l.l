import { prisma } from "@/lib/prisma";
import { normalizeNoteValue } from "@/lib/import-normalize";

type SyncSourceRecord = {
  id: string;
  name: string;
  kind: string;
  url: string | null;
  format: string | null;
  enabled: boolean;
};

type NormalizedRow = {
  tier: string;
  effectName: string;
  categories?: string;
  description?: string;
  extraComponent?: string;
  legendaryModules?: number;
  notes?: string;
  sourceName: string;
  sourceUrl?: string | null;
};

const DEFAULT_SOURCES = [
  { name: "NukaKnights", kind: "nukaknights", url: "", format: "csv" },
  { name: "TheDuchessFlame", kind: "theduchessflame", url: "", format: "csv" },
  { name: "Fallout 76 Wiki", kind: "fallout-wiki", url: "", format: "json" },
  { name: "Bethesda Fallout 76", kind: "bethesda", url: "", format: "json" }
];

const headerMap = new Map<string, keyof NormalizedRow>([
  ["tier", "tier"],
  ["tier label", "tier"],
  ["effect", "effectName"],
  ["effect name", "effectName"],
  ["name", "effectName"],
  ["categories", "categories"],
  ["category", "categories"],
  ["description", "description"],
  ["extra component", "extraComponent"],
  ["extra", "extraComponent"],
  ["modules", "legendaryModules"],
  ["legendary modules", "legendaryModules"],
  ["notes", "notes"]
]);

function normalizeHeaderKey(value: string) {
  return value.trim().toLowerCase();
}

function toInt(value: unknown) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseDelimited(text: string, delimiter: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }
    if (!inQuotes && char === delimiter) {
      row.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  row.push(current);
  rows.push(row);
  return rows.filter((line) => line.some((cell) => cell.trim().length > 0));
}

function normalizeRowsFromTable(header: string[], rows: string[][], source: SyncSourceRecord): NormalizedRow[] {
  const headerKeys = header.map(normalizeHeaderKey);
  const indexMap = new Map<number, keyof NormalizedRow>();
  headerKeys.forEach((key, index) => {
    const mapped = headerMap.get(key);
    if (mapped) indexMap.set(index, mapped);
  });

  return rows
    .map((row) => {
      const normalized: Partial<NormalizedRow> = {
        sourceName: source.name,
        sourceUrl: source.url
      };
      row.forEach((value, index) => {
        const key = indexMap.get(index);
        if (!key) return;
        if (key === "legendaryModules") {
          const parsed = toInt(value);
          if (parsed !== undefined) normalized.legendaryModules = parsed;
        } else if (key === "notes") {
          const note = normalizeNoteValue(value);
          if (note) normalized.notes = note;
        } else {
          const trimmed = value?.toString().trim();
          if (trimmed) {
            (normalized as Record<string, string>)[key] = trimmed;
          }
        }
      });
      return normalized as NormalizedRow;
    })
    .filter((row) => row.tier && row.effectName);
}

function normalizeFromJson(data: unknown, source: SyncSourceRecord) {
  if (!Array.isArray(data)) return [];
  return data
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const row: NormalizedRow = {
        tier: "",
        effectName: "",
        sourceName: source.name,
        sourceUrl: source.url
      };
      for (const [key, value] of Object.entries(record)) {
        const mapped = headerMap.get(normalizeHeaderKey(key));
        if (!mapped) continue;
        if (mapped === "legendaryModules") {
          const parsed = toInt(value);
          if (parsed !== undefined) row.legendaryModules = parsed;
          continue;
        }
        if (mapped === "notes") {
          const note = normalizeNoteValue(value);
          if (note) row.notes = note;
          continue;
        }
        const trimmed = value?.toString().trim();
        if (trimmed) {
          (row as Record<string, string>)[mapped] = trimmed;
        }
      }
      if (!row.tier || !row.effectName) return null;
      return row;
    })
    .filter((row): row is NormalizedRow => Boolean(row));
}

function mergeRows(rows: NormalizedRow[]) {
  const merged = new Map<string, NormalizedRow>();
  for (const row of rows) {
    const key = `${row.tier}||${row.effectName}`.toLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...row });
      continue;
    }
    const mergedRow = { ...existing };
    (["categories", "description", "extraComponent", "notes"] as const).forEach((field) => {
      const current = mergedRow[field];
      const incoming = row[field];
      if (!current && incoming) {
        mergedRow[field] = incoming;
      } else if (current && incoming && current !== incoming && field === "notes") {
        mergedRow[field] = `${current} | ${incoming}`;
      }
    });
    if (mergedRow.legendaryModules === undefined && row.legendaryModules !== undefined) {
      mergedRow.legendaryModules = row.legendaryModules;
    }
    merged.set(key, mergedRow);
  }
  return Array.from(merged.values());
}

function splitCategories(raw?: string) {
  if (!raw) return [];
  return raw
    .split("â€¢")
    .flatMap((part) => part.split("|"))
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

async function getOrCreateTier(label: string) {
  return prisma.tier.upsert({
    where: { label },
    update: {},
    create: { label }
  });
}

async function getOrCreateEffect(name: string, datasetVersionId: string) {
  return prisma.effect.upsert({
    where: { datasetVersionId_name: { datasetVersionId, name } },
    update: {},
    create: { datasetVersionId, name }
  });
}

async function getOrCreateCategory(name: string) {
  return prisma.category.upsert({
    where: { name },
    update: {},
    create: { name }
  });
}

async function upsertEffectTier(params: {
  datasetVersionId: string;
  effectId: string;
  tierId: number;
  description?: string;
  extraComponent?: string;
  legendaryModules?: number;
  notes?: string;
}) {
  const { datasetVersionId, effectId, tierId, description, extraComponent, legendaryModules, notes } = params;
  return prisma.effectTier.upsert({
    where: { datasetVersionId_effectId_tierId: { datasetVersionId, effectId, tierId } },
    update: { description, extraComponent, legendaryModules, notes },
    create: { datasetVersionId, effectId, tierId, description, extraComponent, legendaryModules, notes }
  });
}

async function migrateProgress(previousVersionId: string, newVersionId: string) {
  const oldEffectTiers = await prisma.effectTier.findMany({
    where: { datasetVersionId: previousVersionId },
    include: { effect: true, tier: true }
  });

  const newEffectTiers = await prisma.effectTier.findMany({
    where: { datasetVersionId: newVersionId },
    include: { effect: true, tier: true }
  });

  const oldKeyById = new Map(
    oldEffectTiers.map((row) => [row.id, `${row.tier.label}||${row.effect.name}`])
  );
  const newMap = new Map(
    newEffectTiers.map((row) => [`${row.tier.label}||${row.effect.name}`, row.id])
  );

  const oldProgress = await prisma.userProgress.findMany({
    where: { effectTierId: { in: Array.from(oldKeyById.keys()) } }
  });

  const migrated = oldProgress
    .map((progress) => {
      const key = oldKeyById.get(progress.effectTierId);
      if (!key) return null;
      const newEffectTierId = newMap.get(key);
      if (!newEffectTierId) return null;
      return {
        userId: progress.userId,
        effectTierId: newEffectTierId,
        unlocked: progress.unlocked,
        notes: progress.notes ?? undefined
      };
    })
    .filter(
      (row): row is { userId: string; effectTierId: string; unlocked: boolean; notes: string | undefined } =>
        Boolean(row)
    );

  if (migrated.length > 0) {
    await prisma.userProgress.createMany({ data: migrated });
  }
}

async function createDatasetVersionFromRows(rows: NormalizedRow[], sources: SyncSourceRecord[]) {
  const datasetVersion = await prisma.datasetVersion.create({
    data: {
      label: `Websheet Sync ${new Date().toISOString()}`,
      sourceType: "websheet",
      sourceName: "Multi-source sync",
      syncMetadata: {
        sources: sources.map((source) => ({
          name: source.name,
          url: source.url,
          format: source.format
        })),
        rowCount: rows.length
      },
      isActive: true
    }
  });

  const sourceDatasetMap = new Map<string, string>();
  for (const source of sources) {
    const record = await prisma.sourceDataset.create({
      data: {
        datasetVersionId: datasetVersion.id,
        name: source.name,
        sourcePath: source.url ?? undefined,
        canonical: true,
        headerColumns: ["Tier", "Effect Name", "Categories", "Description", "Extra Component", "Legendary Modules", "Notes"]
      }
    });
    sourceDatasetMap.set(source.id, record.id);
  }

  const effectTierByKey = new Map<string, string>();
  for (const row of rows) {
    const tier = await getOrCreateTier(row.tier);
    const effect = await getOrCreateEffect(row.effectName, datasetVersion.id);
    const effectTier = await upsertEffectTier({
      datasetVersionId: datasetVersion.id,
      effectId: effect.id,
      tierId: tier.id,
      description: row.description,
      extraComponent: row.extraComponent,
      legendaryModules: row.legendaryModules,
      notes: row.notes
    });

    effectTierByKey.set(`${row.tier}||${row.effectName}`.toLowerCase(), effectTier.id);

    const categoryNames = splitCategories(row.categories);
    if (categoryNames.length > 0) {
      const joinRows = [] as { effectTierId: string; categoryId: number }[];
      for (const categoryName of categoryNames) {
        const category = await getOrCreateCategory(categoryName);
        joinRows.push({ effectTierId: effectTier.id, categoryId: category.id });
      }
      if (joinRows.length > 0) {
        await prisma.effectTierCategory.createMany({ data: joinRows });
      }
    }
  }

  const sourceRows: {
    datasetId: string;
    rowIndex: number;
    rawColumns: (string | number | boolean | null)[];
    tierLabel?: string;
    effectName?: string;
    categories?: string;
    description?: string;
    extraComponent?: string;
    legendaryModules?: number;
    unlockedRaw?: string;
    notes?: string;
    effectTierId?: string;
  }[] = [];

  const rowsBySource = new Map<string, NormalizedRow[]>();
  for (const row of rows) {
    const key = sources.find((source) => source.name === row.sourceName)?.id;
    if (!key) continue;
    const list = rowsBySource.get(key) ?? [];
    list.push(row);
    rowsBySource.set(key, list);
  }

  for (const [sourceId, list] of rowsBySource.entries()) {
    const datasetId = sourceDatasetMap.get(sourceId);
    if (!datasetId) continue;
    list.forEach((row, index) => {
      const effectTierId = effectTierByKey.get(`${row.tier}||${row.effectName}`.toLowerCase());
      sourceRows.push({
        datasetId,
        rowIndex: index,
        rawColumns: [
          row.tier,
          row.effectName,
          row.categories ?? null,
          row.description ?? null,
          row.extraComponent ?? null,
          row.legendaryModules ?? null,
          row.notes ?? null
        ],
        tierLabel: row.tier,
        effectName: row.effectName,
        categories: row.categories,
        description: row.description,
        extraComponent: row.extraComponent,
        legendaryModules: row.legendaryModules,
        notes: row.notes,
        effectTierId
      });
    });
  }

  if (sourceRows.length > 0) {
    await prisma.sourceEffectRow.createMany({ data: sourceRows });
  }

  return datasetVersion.id;
}

async function fetchSourceRows(source: SyncSourceRecord) {
  if (!source.url) {
    throw new Error("Missing source URL");
  }

  const response = await fetch(source.url, { headers: { "user-agent": "R.O.L.L Sync/1.0" } });
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status})`);
  }
  const text = await response.text();
  const format = source.format ?? (source.url.endsWith(".tsv") ? "tsv" : source.url.endsWith(".csv") ? "csv" : "json");

  if (format === "json") {
    const data = JSON.parse(text);
    return normalizeFromJson(data, source);
  }

  const delimiter = format === "tsv" ? "\t" : ",";
  const table = parseDelimited(text, delimiter);
  const header = table[0] ?? [];
  const rows = table.slice(1);
  return normalizeRowsFromTable(header, rows, source);
}

async function fetchWithRetry(source: SyncSourceRecord, attempts = 3) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetchSourceRows(source);
    } catch (error) {
      lastError = error;
      const delay = 500 * (i + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function ensureSyncSources() {
  const existing = await prisma.syncSource.count();
  if (existing > 0) return;
  await prisma.syncSource.createMany({
    data: DEFAULT_SOURCES
  });
}

export async function getSyncSources() {
  await ensureSyncSources();
  return prisma.syncSource.findMany({
    orderBy: { name: "asc" }
  });
}

export async function updateSyncSource(params: { id: string; url?: string | null; enabled?: boolean; format?: string | null }) {
  return prisma.syncSource.update({
    where: { id: params.id },
    data: {
      url: params.url ?? undefined,
      enabled: params.enabled ?? undefined,
      format: params.format ?? undefined
    }
  });
}

export async function runSync() {
  await ensureSyncSources();
  const sources = await prisma.syncSource.findMany({ where: { enabled: true } });
  const priority = ["NukaKnights", "TheDuchessFlame", "Fallout 76 Wiki", "Bethesda Fallout 76"];
  sources.sort((a, b) => {
    const aIndex = priority.indexOf(a.name);
    const bIndex = priority.indexOf(b.name);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });
  const run = await prisma.syncRun.create({ data: { status: "running" } });

  const errors: { source: string; message: string }[] = [];
  const rowsByPriority: NormalizedRow[] = [];
  const successfulSources: SyncSourceRecord[] = [];

  for (const source of sources) {
    try {
      const rows = await fetchWithRetry(source, 3);
      if (rows.length === 0) {
        throw new Error("No rows returned.");
      }
      rowsByPriority.push(...rows);
      successfulSources.push(source);
      await prisma.syncSource.update({
        where: { id: source.id },
        data: { lastSyncedAt: new Date(), lastStatus: "success", lastError: null }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      errors.push({ source: source.name, message });
      await prisma.syncSource.update({
        where: { id: source.id },
        data: { lastSyncedAt: new Date(), lastStatus: "failed", lastError: message }
      });
    }
  }

  if (successfulSources.length === 0) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        errorSummary: errors
      }
    });
    return { ok: false, errors } as const;
  }

  const mergedRows = mergeRows(rowsByPriority);
  const previous = await prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });

  const datasetVersionId = await createDatasetVersionFromRows(mergedRows, successfulSources);

  if (previous) {
    await migrateProgress(previous.id, datasetVersionId);
    await prisma.datasetVersion.update({ where: { id: previous.id }, data: { isActive: false } });
  }

  const status = errors.length > 0 ? "partial" : "success";
  await prisma.syncRun.update({
    where: { id: run.id },
    data: {
      status,
      completedAt: new Date(),
      datasetVersionId,
      summary: {
        sources: successfulSources.map((source) => source.name),
        rowCount: mergedRows.length
      },
      errorSummary: errors.length > 0 ? errors : undefined
    }
  });

  return { ok: true, datasetVersionId, errors } as const;
}
