import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type ImportError = {
  type: "missing-sheet" | "header-mismatch" | "invalid" | "exception";
  message: string;
  sheet?: string;
};

type ExpectedSheet = {
  name: string;
  header: string[];
  required: boolean;
  canonical: boolean;
};

type ParsedSheet = {
  name: string;
  header: string[];
  rows: (string | number | boolean | null)[][];
};

const canonicalRowSchema = z.object({
  tier: z.string().min(1),
  effectName: z.string().min(1),
  categories: z.string().optional(),
  description: z.string().optional(),
  extraComponent: z.string().optional(),
  legendaryModules: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional()
});

function readExpectedSheetsFromTsv(): ExpectedSheet[] {
  const root = process.cwd();
  const files = fs
    .readdirSync(root)
    .filter((name) => name.toLowerCase().endsWith(".txt"));

  return files.map((fileName) => {
    const fullPath = path.join(root, fileName);
    const firstLine = fs.readFileSync(fullPath, "utf8").split(/\r?\n/)[0] ?? "";
    const header = firstLine.split("\t");
    const baseName = fileName.replace(/\.txt$/i, "");
    const canonical = fileName.includes("All Tiers.txt");
    const required = !fileName.includes("Cover") && !fileName.includes("Chart");

    return {
      name: baseName,
      header,
      required,
      canonical
    };
  });
}

function normalizeHeader(raw: unknown[]): string[] {
  return raw.map((value) => (value === null || value === undefined ? "" : String(value)));
}

function getHeaderMismatch(expected: string[], actual: string[]) {
  const nonEmptyIndices = expected
    .map((value, index) => (value.trim().length ? index : -1))
    .filter((index) => index >= 0);

  for (const index of nonEmptyIndices) {
    if ((actual[index] ?? "").trim() !== expected[index].trim()) {
      return `Header mismatch at column ${index + 1}. Expected "${expected[index]}", got "${actual[index] ?? ""}".`;
    }
  }

  const lastIndex = Math.max(...nonEmptyIndices, 0);
  if (actual.length <= lastIndex) {
    return `Header length too short. Expected at least ${lastIndex + 1} columns.`;
  }

  return null;
}

function splitCategories(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split("•")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function toIntOrNull(raw?: string | number): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildHeaderIndex(header: string[]) {
  const map = new Map<string, number>();
  header.forEach((name, index) => {
    if (!map.has(name)) {
      map.set(name, index);
    }
  });
  return map;
}

function getColumnValue(row: (string | number | boolean | null)[], headerIndex: Map<string, number>, name: string) {
  const index = headerIndex.get(name);
  if (index === undefined) return undefined;
  const value = row[index];
  if (value === null || value === undefined) return undefined;
  return String(value);
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

async function cleanupDatasetVersion(datasetVersionId: string) {
  await prisma.effectTierCategory.deleteMany({
    where: { effectTier: { datasetVersionId } }
  });
  await prisma.userProgress.deleteMany({
    where: { effectTier: { datasetVersionId } }
  });
  await prisma.effectTier.deleteMany({
    where: { datasetVersionId } }
  );
  await prisma.effect.deleteMany({
    where: { datasetVersionId } }
  );
  await prisma.sourceEffectRow.deleteMany({
    where: { dataset: { datasetVersionId } }
  });
  await prisma.sourceDataset.deleteMany({
    where: { datasetVersionId } }
  );
  await prisma.datasetVersion.delete({
    where: { id: datasetVersionId }
  });
}

function parseWorkbook(buffer: Buffer): ParsedSheet[] {
  const workbook = XLSX.read(buffer, { type: "buffer", raw: true });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
      header: 1,
      raw: true,
      defval: null
    });
    const header = normalizeHeader(rows[0] ?? []);
    const dataRows = rows.slice(1);

    return { name, header, rows: dataRows };
  });
}

export async function importWorkbook(buffer: Buffer, filename: string) {
  const errors: ImportError[] = [];
  const expectedSheets = readExpectedSheetsFromTsv();
  const parsedSheets = parseWorkbook(buffer);

  const expectedMap = new Map(expectedSheets.map((sheet) => [sheet.name, sheet]));
  const parsedMap = new Map(parsedSheets.map((sheet) => [sheet.name, sheet]));

  for (const expected of expectedSheets) {
    if (expected.required && !parsedMap.has(expected.name)) {
      errors.push({
        type: "missing-sheet",
        sheet: expected.name,
        message: `Missing required sheet: ${expected.name}`
      });
    }
  }

  for (const [name, sheet] of parsedMap.entries()) {
    const expected = expectedMap.get(name);
    if (!expected) continue;
    const mismatch = getHeaderMismatch(expected.header, sheet.header);
    if (mismatch) {
      errors.push({
        type: "header-mismatch",
        sheet: name,
        message: mismatch
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors } as const;
  }

  const previous = await prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });

  const datasetVersion = await prisma.datasetVersion.create({
    data: {
      label: `${path.basename(filename, path.extname(filename))} ${new Date().toISOString()}`,
      sourceType: "xlsx",
      isActive: true
    }
  });

  const canonicalSheet = expectedSheets.find((sheet) => sheet.canonical)?.name;

  try {
    for (const parsed of parsedSheets) {
      const expected = expectedMap.get(parsed.name);
      if (!expected) continue;

      const sourceDataset = await prisma.sourceDataset.create({
        data: {
          datasetVersionId: datasetVersion.id,
          name: parsed.name,
          sourcePath: filename,
          canonical: expected.canonical,
          headerColumns: parsed.header
        }
      });

      const headerIndex = buildHeaderIndex(parsed.header);

      const rowsToInsert = parsed.rows.map((row, rowIndex) => {
        const rawColumns = row.map((value) => (value === undefined ? null : value));
        if (rawColumns.length < parsed.header.length) {
          rawColumns.length = parsed.header.length;
          rawColumns.fill(null, row.length);
        }
        return {
          datasetId: sourceDataset.id,
          rowIndex,
          rawColumns,
          tierLabel: getColumnValue(rawColumns, headerIndex, "Tier") ?? undefined,
          effectName: getColumnValue(rawColumns, headerIndex, "Effect Name") ?? undefined,
          categories: getColumnValue(rawColumns, headerIndex, "Categories") ?? undefined,
          description: getColumnValue(rawColumns, headerIndex, "Description") ?? undefined,
          extraComponent: getColumnValue(rawColumns, headerIndex, "Extra Component") ?? undefined,
          legendaryModules: toIntOrNull(getColumnValue(rawColumns, headerIndex, "Legendary Modules")),
          unlockedRaw: getColumnValue(rawColumns, headerIndex, "Unlocked") ?? undefined,
          notes: getColumnValue(rawColumns, headerIndex, "Notes") ?? undefined,
          effectTierId: undefined as string | undefined
        };
      });

      if (expected.canonical && parsed.name === canonicalSheet) {
        for (const row of rowsToInsert) {
          const parsedRow = canonicalRowSchema.safeParse({
            tier: row.tierLabel,
            effectName: row.effectName,
            categories: row.categories,
            description: row.description,
            extraComponent: row.extraComponent,
            legendaryModules: row.legendaryModules,
            notes: row.notes
          });

          if (!parsedRow.success) {
            continue;
          }

          const { tier, effectName, categories, description, extraComponent, legendaryModules, notes } = parsedRow.data;

          const tierRecord = await getOrCreateTier(tier);
          const effect = await getOrCreateEffect(effectName, datasetVersion.id);
          const effectTier = await upsertEffectTier({
            datasetVersionId: datasetVersion.id,
            effectId: effect.id,
            tierId: tierRecord.id,
            description,
            extraComponent,
            legendaryModules: toIntOrNull(legendaryModules),
            notes
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

      if (rowsToInsert.length > 0) {
        await prisma.sourceEffectRow.createMany({ data: rowsToInsert });
      }
    }

    if (previous) {
      await migrateProgress(previous.id, datasetVersion.id);
      await prisma.datasetVersion.update({ where: { id: previous.id }, data: { isActive: false } });
    }
  } catch (error) {
    errors.push({
      type: "exception",
      message: error instanceof Error ? error.message : "Unknown import error"
    });
    await cleanupDatasetVersion(datasetVersion.id);
    return { ok: false, errors } as const;
  }

  return { ok: true, datasetVersionId: datasetVersion.id } as const;
}
