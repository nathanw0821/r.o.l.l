import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeNoteValue, parseUnlockedValue } from "@/lib/import-normalize";
import { convertXlsToXlsx } from "@/lib/convert-xls";

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

function toArrayBuffer(buffer: Uint8Array) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

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
  const dataRoot = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataRoot)) {
    return [];
  }
  const files = fs
    .readdirSync(dataRoot)
    .filter((name) => name.toLowerCase().endsWith(".txt"));

  return files.map((fileName) => {
    const fullPath = path.join(dataRoot, fileName);
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

function normalizeSheetName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getSheetAliases(name: string): string[] {
  const aliases = new Set<string>();
  aliases.add(name);

  const dashParts = name.split(" - ");
  if (dashParts.length > 1) {
    aliases.add(dashParts[dashParts.length - 1]);
  }

  const prefix = "Fallout76 Tracker Personal - ";
  if (name.startsWith(prefix)) {
    aliases.add(name.slice(prefix.length));
  }

  return Array.from(aliases);
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
    .split(/\||,|;|\u2022|\u00e2\u20ac\u00a2|\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a2/g)
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
    const key = name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, index);
    }
  });
  return map;
}

function getColumnValue(row: (string | number | boolean | null)[], headerIndex: Map<string, number>, name: string) {
  const index = headerIndex.get(name.trim().toLowerCase());
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
    await prisma.userProgress.createMany({ data: migrated, skipDuplicates: true });
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

function normalizeCellValue(value: ExcelJS.CellValue): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const typed = value as {
      text?: string;
      richText?: { text?: string }[];
      result?: string | number | boolean | null;
      hyperlink?: string;
    };
    if (typeof typed.text === "string") return typed.text;
    if (Array.isArray(typed.richText)) {
      return typed.richText.map((part) => part.text ?? "").join("");
    }
    if (typeof typed.result === "string" || typeof typed.result === "number" || typeof typed.result === "boolean") {
      return typed.result;
    }
    if (typeof typed.hyperlink === "string") return typed.hyperlink;
  }
  return String(value);
}

async function parseWorkbook(buffer: Uint8Array): Promise<ParsedSheet[]> {
  const workbook = new ExcelJS.Workbook();
  const workbookSource = Buffer.from(toArrayBuffer(buffer)) as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(workbookSource);

  return workbook.worksheets.map((worksheet) => {
    const rows: (string | number | boolean | null)[][] = [];
    let header: string[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      const normalized = values.map((value) => normalizeCellValue(value as ExcelJS.CellValue));
      if (rowNumber === 1) {
        header = normalizeHeader(normalized);
      } else {
        rows.push(normalized);
      }
    });

    return { name: worksheet.name, header, rows };
  });
}

function findParsedMatch(expected: ExpectedSheet, parsedSheets: ParsedSheet[], usedSheets: Set<string>) {
  const aliasKeys = getSheetAliases(expected.name).map(normalizeSheetName);
  for (const sheet of parsedSheets) {
    if (usedSheets.has(sheet.name)) continue;
    if (aliasKeys.includes(normalizeSheetName(sheet.name))) {
      return sheet;
    }
  }

  const headerMatches = parsedSheets.filter((sheet) => {
    if (usedSheets.has(sheet.name)) return false;
    return getHeaderMismatch(expected.header, sheet.header) === null;
  });

  if (headerMatches.length === 1) {
    return headerMatches[0];
  }

  return undefined;
}

export async function importWorkbook(buffer: Uint8Array, filename: string, userId?: string) {
  const errors: ImportError[] = [];
  const baselineCounts = {
    yes: 0,
    no: 0,
    unknown: 0,
    total: 0
  };
  const userBaselineMap = new Map<string, boolean>();

  let workingBuffer = buffer;
  let workingName = filename;
  const lowerName = filename.toLowerCase();
  if (lowerName.endsWith(".xls") && !lowerName.endsWith(".xlsx")) {
    const converted = await convertXlsToXlsx(buffer, filename);
    if (!converted.ok) {
      errors.push({ type: "invalid", message: converted.message });
      return { ok: false, errors } as const;
    }
    workingBuffer = converted.buffer;
    workingName = converted.filename;
  }
  const audit = await prisma.importAudit.create({
    data: {
      userId: userId ?? null,
      filename,
      status: "started"
    }
  });
  const expectedSheets = readExpectedSheetsFromTsv();
  const parsedSheets = await parseWorkbook(workingBuffer);

  const matches = [] as { expected: ExpectedSheet; parsed: ParsedSheet }[];
  const usedSheets = new Set<string>();

  for (const expected of expectedSheets) {
    const matched = findParsedMatch(expected, parsedSheets, usedSheets);
    if (!matched) {
      if (!expected.required) continue;
      errors.push({
        type: "missing-sheet",
        sheet: expected.name,
        message: `Missing required sheet: ${expected.name}`
      });
      continue;
    }
    usedSheets.add(matched.name);
    matches.push({ expected, parsed: matched });
  }

  for (const { expected, parsed } of matches) {
    const mismatch = getHeaderMismatch(expected.header, parsed.header);
    if (mismatch) {
      errors.push({
        type: "header-mismatch",
        sheet: parsed.name,
        message: mismatch
      });
    }
  }

  if (errors.length > 0) {
    await prisma.importAudit.update({
      where: { id: audit.id },
      data: {
        status: "failed",
        errorCount: errors.length,
        errorSummary: errors,
        completedAt: new Date()
      }
    });
    return { ok: false, errors } as const;
  }

  const previous = await prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });

  const datasetVersion = await prisma.datasetVersion.create({
    data: {
      label: `${path.basename(workingName, path.extname(workingName))} ${new Date().toISOString()}`,
      sourceType: "xlsx",
      isActive: true
    }
  });

  await prisma.importAudit.update({
    where: { id: audit.id },
    data: { datasetVersionId: datasetVersion.id }
  });

  const canonicalSheet = expectedSheets.find((sheet) => sheet.canonical)?.name;

  try {
    for (const { expected, parsed } of matches) {

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
          notes: normalizeNoteValue(getColumnValue(rawColumns, headerIndex, "Notes")) ?? undefined,
          effectTierId: undefined as string | undefined
        };
      });

      if (expected.canonical && expected.name === canonicalSheet) {
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

          const parsedUnlock = parseUnlockedValue(row.unlockedRaw ?? undefined);
          if (parsedUnlock === true) baselineCounts.yes += 1;
          else if (parsedUnlock === false) baselineCounts.no += 1;
          else baselineCounts.unknown += 1;
          baselineCounts.total += 1;
          if (userId && parsedUnlock !== null) {
            userBaselineMap.set(effectTier.id, parsedUnlock);
          }

          const categoryNames = splitCategories(categories);
          if (categoryNames.length > 0) {
            const joinRows = [] as { effectTierId: string; categoryId: number }[];
            for (const categoryName of categoryNames) {
              const category = await getOrCreateCategory(categoryName);
              joinRows.push({ effectTierId: effectTier.id, categoryId: category.id });
            }
            if (joinRows.length > 0) {
              await prisma.effectTierCategory.createMany({
                data: joinRows,
                skipDuplicates: true
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

    if (userId && userBaselineMap.size > 0) {
      const baselineRows = Array.from(userBaselineMap.entries()).map(([effectTierId, unlocked]) => ({
        userId,
        datasetVersionId: datasetVersion.id,
        effectTierId,
        unlocked
      }));
      await prisma.userImportBaseline.deleteMany({
        where: { userId, datasetVersionId: datasetVersion.id }
      });
      await prisma.userImportBaseline.createMany({ data: baselineRows });
    }
  } catch (error) {
    errors.push({
      type: "exception",
      message: error instanceof Error ? error.message : "Unknown import error"
    });
    await cleanupDatasetVersion(datasetVersion.id);
    await prisma.importAudit.update({
      where: { id: audit.id },
      data: {
        status: "failed",
        errorCount: errors.length,
        errorSummary: errors,
        completedAt: new Date()
      }
    });
    return { ok: false, errors } as const;
  }

  await prisma.importAudit.update({
    where: { id: audit.id },
    data: {
      status: "success",
      errorCount: 0,
      completedAt: new Date()
    }
  });
  return { ok: true, datasetVersionId: datasetVersion.id, baseline: baselineCounts } as const;
}
