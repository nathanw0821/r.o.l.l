import { prisma } from "@/lib/prisma";

export async function getImportedBaselineMap(userId: string) {
  if (!userId) return new Map<string, boolean>();

  const rows = await prisma.userImportBaseline.findMany({
    where: { userId },
    select: { 
      effectTierId: true, 
      unlocked: true,
      effectTier: {
        select: {
          effect: { select: { name: true } },
          tier: { select: { label: true } }
        }
      }
    }
  });

  const map = new Map<string, boolean>();
  for (const row of rows) {
    if (row.unlocked) {
      map.set(row.effectTierId, true);
      const name = row.effectTier?.effect?.name?.toLowerCase().trim();
      if (name) {
        map.set(name, true);
        const clean = name.replace(/[^a-z0-9]/g, "");
        map.set(clean, true);
        const tier = row.effectTier?.tier?.label?.toLowerCase().trim();
        const starNum = (tier?.match(/\d/) || [""])[0];
        if (starNum) {
          const slug = name.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          map.set(`effect-${starNum}star-${slug}`, true);
          map.set(`${starNum}star-${slug}`, true);
        }
      }
    }
  }

  return map;
}

export async function applyImportedProfile(userId: string, options?: { force?: boolean }) {
  const [user, dataset] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: userId }, include: { settings: true } }),
    prisma.datasetVersion.findFirst({ where: { isActive: true }, orderBy: { importedAt: "desc" } })
  ]);

  if (!user || !dataset) return;

  const characterId = user.settings?.activeCharacterId;
  if (!characterId) return;

  const baselineMap = await getImportedBaselineMap(userId);
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
