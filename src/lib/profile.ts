import { prisma } from "@/lib/prisma";
import { parseUnlockedValue } from "@/lib/import-normalize";
export async function getImportedBaselineMap(datasetVersionId: string, characterId?: string) {
  if (!characterId) return new Map<string, boolean>();
  
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) return new Map<string, boolean>();

  const rows = await prisma.userImportBaseline.findMany({
    where: { characterId, datasetVersionId },
    select: { effectTierId: true, unlocked: true }
  });

  if (rows.length > 0) {
    return new Map(rows.map((row) => [row.effectTierId, row.unlocked]));
  }

  const audit = await prisma.importAudit.findFirst({
    where: { userId: character.userId, datasetVersionId, status: "success" }
  });
  if (!audit) return new Map<string, boolean>();

  const sourceRows = await prisma.sourceEffectRow.findMany({
    where: {
      dataset: { datasetVersionId },
      effectTierId: { not: null }
    },
    select: { effectTierId: true, unlockedRaw: true }
  });

  const legacyMap = new Map<string, boolean>();
  for (const row of sourceRows) {
    const effectTierId = row.effectTierId;
    if (!effectTierId) continue;
    const parsed = parseUnlockedValue(row.unlockedRaw ?? undefined);
    if (parsed === null) continue;
    legacyMap.set(effectTierId, parsed);
  }

  if (legacyMap.size > 0) {
    await prisma.userImportBaseline.createMany({
      data: Array.from(legacyMap.entries()).map(([effectTierId, unlocked]) => ({
        userId: character.userId,
        characterId,
        datasetVersionId,
        effectTierId,
        unlocked
      }))
    });
  }

  return legacyMap;
}

export async function applyImportedProfile(userId: string, options?: { force?: boolean }) {
  const [user, dataset] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: userId }, include: { settings: true } }),
    prisma.datasetVersion.findFirst({ where: { isActive: true }, orderBy: { importedAt: "desc" } })
  ]);

  if (!user || !dataset) return;

  const characterId = user.settings?.activeCharacterId;
  if (!characterId) return;

  const baselineMap = await getImportedBaselineMap(dataset.id, characterId);
  const hasBaseline = baselineMap.size > 0;
  if (!hasBaseline && !options?.force) {
    return;
  }

  const progressCount = await prisma.userProgress.count({
    where: { characterId, effectTier: { datasetVersionId: dataset.id } }
  });

  if (!options?.force) {
    if (user.profileDatasetVersionId === dataset.id) {
      if (!hasBaseline) return;
      if (progressCount > 0) return;
    }
    if (progressCount > 0) return;
  }

  if (options?.force) {
    await prisma.userProgress.deleteMany({
      where: { characterId, effectTier: { datasetVersionId: dataset.id } }
    });
  }

  const createRows = Array.from(baselineMap.entries()).map(([effectTierId, unlocked]) => ({
    userId,
    characterId,
    effectTierId,
    unlocked
  }));

  if (createRows.length > 0) {
    await prisma.userProgress.createMany({ data: createRows });
  }

  if (hasBaseline || options?.force) {
    await prisma.user.update({
      where: { id: userId },
      data: { profileDatasetVersionId: dataset.id }
    });
  }
}

export async function applyImportedProfileIfNeeded(userId: string) {
  return applyImportedProfile(userId);
}
