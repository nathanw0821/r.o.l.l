import { prisma } from "@/lib/prisma";
import { getActiveDatasetVersion, getAllEffectTiers } from "@/lib/data";

/**
 * Fetches a public profile (Crafting Resume) by username.
 * Shows verified learned mods across all characters without exposing private names.
 */
export async function getPublicCraftingResume(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      createdAt: true
    }
  });

  if (!user) return null;

  const dataset = await getActiveDatasetVersion();
  if (!dataset) return null;

  // Fetch all unique effect tiers unlocked by ANY character of this user
  const progressRows = await prisma.userProgress.findMany({
    where: { 
      userId: user.id, 
      effectTier: { datasetVersionId: dataset.id }, 
      unlocked: true 
    },
    distinct: ['effectTierId'],
    select: { effectTierId: true }
  });

  const unlockedIds = new Set(progressRows.map(r => r.effectTierId));

  // Get full catalog to show what's learned vs not
  const allTiers = await getAllEffectTiers(user.id);

  return {
    user: {
      username: user.username,
      displayName: user.name || user.username
    },
    stats: {
      total: allTiers.length,
      unlocked: unlockedIds.size,
      percent: allTiers.length > 0 ? Math.round((unlockedIds.size / allTiers.length) * 100) : 0
    },
    learnedMods: allTiers.filter(t => unlockedIds.has(t.id))
  };
}
