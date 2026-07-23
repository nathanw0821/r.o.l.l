import fs from "fs";
import path from "path";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { isTsvLike, readTsvFile } from "./tsv";
import { normalizeDatabaseUrl } from "./lib/database-url";
import { seedBuilderCatalog } from "./lib/builder/seed-builder-catalog";
import { normalizeNoteValue } from "./lib/import-normalize";

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL)
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool)
});

const canonicalFileName = "Fallout76 Tracker Personal - All Tiers.txt";

type DatasetKind = "all-tiers" | "tier" | "still-need" | "chart" | "unknown";

type ParsedRow = {
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
  effectTierId?: string;
};

const nonEmptyString = z.string().min(1);

const canonicalRowSchema = z.object({
  tier: nonEmptyString,
  effectName: nonEmptyString,
  categories: z.string().optional(),
  description: z.string().optional(),
  extraComponent: z.string().optional(),
  legendaryModules: z.string().optional(),
  notes: z.string().optional(),
});

function detectDatasetKind(fileName: string): DatasetKind {
  if (fileName === canonicalFileName) return "all-tiers";
  if (fileName.includes("Still Need")) return "still-need";
  if (fileName.includes("All Tiers Chart")) return "chart";
  if (fileName.includes("1 Star") || fileName.includes("2 Star") || fileName.includes("3 Star") || fileName.includes("4 Star")) {
    return "tier";
  }
  return "unknown";
}

function getTierLabelFromFileName(fileName: string): string | undefined {
  const match = fileName.match(/(\d) Star/);
  if (!match) return undefined;
  return `${match[1]} Star`;
}

function toIntOrNull(raw?: string): number | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildHeaderIndex(header: string[]): Map<string, number> {
  const map = new Map<string, number>();
  header.forEach((name, index) => {
    const key = name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, index);
    }
  });
  return map;
}

function getColumnValue(row: string[], headerIndex: Map<string, number>, name: string): string | undefined {
  const index = headerIndex.get(name.trim().toLowerCase());
  if (index === undefined) return undefined;
  return row[index];
}

function normalizeName(value?: string): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function splitCategories(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[|•â€¢,;]/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

async function upsertDataset(
  datasetVersionId: string,
  name: string,
  sourcePath: string,
  canonical: boolean,
  headerColumns: string[]
) {
  const existing = await prisma.sourceDataset.findFirst({
    where: { datasetVersionId, name }
  });
  if (existing) {
    await prisma.sourceEffectRow.deleteMany({ where: { datasetId: existing.id } });
    return prisma.sourceDataset.update({
      where: { id: existing.id },
      data: { sourcePath, canonical, headerColumns }
    });
  }

  return prisma.sourceDataset.create({
    data: {
      datasetVersionId,
      name,
      sourcePath,
      canonical,
      headerColumns
    }
  });
}

async function getOrCreateTier(label: string) {
  return prisma.tier.upsert({
    where: { label },
    update: {},
    create: { label },
  });
}

async function getOrCreateEffect(datasetVersionId: string, name: string) {
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
    create: { name },
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

async function seedNormalizedFromCanonical(
  datasetVersionId: string,
  rows: ParsedRow[],
  headerIndex: Map<string, number>
) {
  for (const row of rows) {
    const rawTier = row.tierLabel ?? getColumnValue(row.rawColumns, headerIndex, "Tier");
    const rawEffectName = row.effectName ?? getColumnValue(row.rawColumns, headerIndex, "Effect Name");
    const rawCategories = row.categories ?? getColumnValue(row.rawColumns, headerIndex, "Categories");
    const rawDescription = row.description ?? getColumnValue(row.rawColumns, headerIndex, "Description");
    const rawExtra = row.extraComponent ?? getColumnValue(row.rawColumns, headerIndex, "Extra Component");
    const rawModules = getColumnValue(row.rawColumns, headerIndex, "Legendary Modules");
    const rawNotes = row.notes ?? getColumnValue(row.rawColumns, headerIndex, "Notes");

    const parsed = canonicalRowSchema.safeParse({
      tier: normalizeName(rawTier),
      effectName: normalizeName(rawEffectName),
      categories: normalizeName(rawCategories),
      description: normalizeName(rawDescription),
      extraComponent: normalizeName(rawExtra),
      legendaryModules: rawModules,
      notes: normalizeNoteValue(rawNotes) ?? undefined,
    });

    if (!parsed.success) {
      continue;
    }

    const { tier, effectName, categories, description, extraComponent, legendaryModules, notes } = parsed.data;

    const tierRecord = await getOrCreateTier(tier);
    const effectRecord = await getOrCreateEffect(datasetVersionId, effectName);
    const effectTier = await upsertEffectTier({
      datasetVersionId,
      effectId: effectRecord.id,
      tierId: tierRecord.id,
      description,
      extraComponent,
      legendaryModules: toIntOrNull(legendaryModules),
      notes,
    });

    row.effectTierId = effectTier.id;

    const categoryNames = splitCategories(categories);
    if (categoryNames.length > 0) {
      const joinRows = [] as { effectTierId: string; categoryId: number }[];
      for (const categoryName of categoryNames) {
        const category = await getOrCreateCategory(categoryName);
        joinRows.push({ effectTierId: effectTier.id, categoryId: category.id });
      }
      if (joinRows.length > 0) {
        await prisma.effectTierCategory.createMany({
          data: joinRows
        });
      }
    }
  }
}

async function ingestDataset(datasetVersionId: string, filePath: string) {
  const fileName = path.basename(filePath);
  const fileKind = detectDatasetKind(fileName);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const headerLine = lines[0] ?? "";
  if (!isTsvLike(headerLine)) {
    return;
  }

  const { header, rows } = readTsvFile(filePath);
  const headerIndex = buildHeaderIndex(header);

  const dataset = await upsertDataset(
    datasetVersionId,
    fileName,
    path.relative(process.cwd(), filePath),
    fileName === canonicalFileName,
    header,
  );

  const parsedRows: ParsedRow[] = rows.map((rawColumns, rowIndex) => {
    const tierLabel = getColumnValue(rawColumns, headerIndex, "Tier") ?? getTierLabelFromFileName(fileName);
    const effectName = getColumnValue(rawColumns, headerIndex, "Effect Name");
    const categories = getColumnValue(rawColumns, headerIndex, "Categories");
    const description = getColumnValue(rawColumns, headerIndex, "Description");
    const extraComponent = getColumnValue(rawColumns, headerIndex, "Extra Component");
    const legendaryModulesRaw = getColumnValue(rawColumns, headerIndex, "Legendary Modules");
    const unlockedRaw = getColumnValue(rawColumns, headerIndex, "Unlocked");
    const notes = getColumnValue(rawColumns, headerIndex, "Notes");

    return {
      rowIndex,
      rawColumns,
      tierLabel,
      effectName,
      categories,
      description,
      extraComponent,
      legendaryModules: toIntOrNull(legendaryModulesRaw),
      unlockedRaw,
      notes: normalizeNoteValue(notes) ?? undefined,
    };
  });

  if (fileKind === "all-tiers") {
    await seedNormalizedFromCanonical(datasetVersionId, parsedRows, headerIndex);
  }

  if (parsedRows.length > 0) {
    await prisma.sourceEffectRow.createMany({
      data: parsedRows.map((row) => ({
        datasetId: dataset.id,
        rowIndex: row.rowIndex,
        rawColumns: row.rawColumns,
        tierLabel: row.tierLabel,
        effectName: row.effectName,
        categories: row.categories,
        description: row.description,
        extraComponent: row.extraComponent,
        legendaryModules: row.legendaryModules,
        unlockedRaw: row.unlockedRaw,
        notes: row.notes,
        effectTierId: row.effectTierId,
      })),
    });
  }
}

async function migrateProgressAndBaselines(previousVersionId: string, newVersionId: string) {
  console.log(`Migrating user progress and baselines from version ${previousVersionId} to ${newVersionId}...`);

  const oldEffectTiers = await prisma.effectTier.findMany({
    where: { datasetVersionId: previousVersionId },
    include: { effect: true, tier: true }
  });

  const newEffectTiers = await prisma.effectTier.findMany({
    where: { datasetVersionId: newVersionId },
    include: { effect: true, tier: true }
  });

  const oldKeyById = new Map(
    oldEffectTiers.map((row) => [row.id, `${row.tier.label}||${row.effect.name}`.toLowerCase()])
  );
  const newMap = new Map(
    newEffectTiers.map((row) => [`${row.tier.label}||${row.effect.name}`.toLowerCase(), row.id])
  );

  // Migrate UserProgress
  const oldProgress = await prisma.userProgress.findMany({
    where: { effectTierId: { in: Array.from(oldKeyById.keys()) } }
  });

  const migratedProgress = oldProgress
    .map((progress) => {
      const key = oldKeyById.get(progress.effectTierId);
      if (!key) return null;
      const newEffectTierId = newMap.get(key);
      if (!newEffectTierId) return null;
      return {
        userId: progress.userId,
        characterId: progress.characterId,
        effectTierId: newEffectTierId,
        unlocked: progress.unlocked,
        notes: progress.notes ?? undefined,
        isSeeking: progress.isSeeking,
        modCount: progress.modCount,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (migratedProgress.length > 0) {
    const newProgressTierIds = migratedProgress.map(p => p.effectTierId);
    await prisma.userProgress.deleteMany({
      where: { effectTierId: { in: newProgressTierIds } }
    });

    await prisma.userProgress.createMany({ data: migratedProgress, skipDuplicates: true });
    console.log(`Successfully migrated ${migratedProgress.length} user progress records.`);
  }

  // Migrate UserImportBaseline
  const oldBaselines = await prisma.userImportBaseline.findMany({
    where: { datasetVersionId: previousVersionId }
  });

  const migratedBaselines = oldBaselines
    .map((baseline) => {
      const key = oldKeyById.get(baseline.effectTierId);
      if (!key) return null;
      const newEffectTierId = newMap.get(key);
      if (!newEffectTierId) return null;
      return {
        userId: baseline.userId,
        characterId: baseline.characterId,
        datasetVersionId: newVersionId,
        effectTierId: newEffectTierId,
        unlocked: baseline.unlocked,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  if (migratedBaselines.length > 0) {
    const newBaselineTierIds = migratedBaselines.map(b => b.effectTierId);
    await prisma.userImportBaseline.deleteMany({
      where: {
        datasetVersionId: newVersionId,
        effectTierId: { in: newBaselineTierIds }
      }
    });

    await prisma.userImportBaseline.createMany({ data: migratedBaselines, skipDuplicates: true });
    console.log(`Successfully migrated ${migratedBaselines.length} user import baselines.`);
  }
}

async function main() {
  const previous = await prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });

  const datasetVersion = await prisma.datasetVersion.create({
    data: {
      label: `TSV Seed ${new Date().toISOString()}`,
      sourceType: "tsv",
      isActive: true
    }
  });

  if (previous) {
    await prisma.datasetVersion.update({ where: { id: previous.id }, data: { isActive: false } });
  }

  const root = path.join(process.cwd(), "data");
  if (!fs.existsSync(root)) {
    throw new Error(`Seed data directory not found: ${root}`);
  }
  const fileNames = fs.readdirSync(root).filter((name) => name.endsWith(".txt"));
  const filePaths = fileNames.map((name) => path.join(root, name));

  for (const filePath of filePaths) {
    await ingestDataset(datasetVersion.id, filePath);
  }

  await seedBuilderCatalog(prisma);

  // Migrate progress and baselines from the most recent version that has progress
  let previousVersionId = previous?.id;
  if (!previousVersionId) {
    const fallbackVersion = await prisma.datasetVersion.findFirst({
      where: { id: { not: datasetVersion.id } },
      orderBy: { importedAt: "desc" }
    });
    previousVersionId = fallbackVersion?.id;
  }

  if (previousVersionId) {
    let sourceVersionId = previousVersionId;
    const hasProgress = await prisma.userProgress.findFirst({
      where: {
        effectTier: { datasetVersionId: previousVersionId }
      }
    });

    if (!hasProgress) {
      console.log(`Version ${previousVersionId} has no user progress records. Scanning for older versions with progress...`);
      const allVersions = await prisma.datasetVersion.findMany({
        where: { id: { not: datasetVersion.id } },
        orderBy: { importedAt: "desc" }
      });
      for (const ver of allVersions) {
        const checkProgress = await prisma.userProgress.findFirst({
          where: {
            effectTier: { datasetVersionId: ver.id }
          }
        });
        if (checkProgress) {
          console.log(`Found user progress records in older version ${ver.id} (${ver.label}). Using this version as migration source.`);
          sourceVersionId = ver.id;
          break;
        }
      }
    }

    await migrateProgressAndBaselines(sourceVersionId, datasetVersion.id);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });



