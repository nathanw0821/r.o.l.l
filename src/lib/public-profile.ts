import { prisma } from "@/lib/prisma";
import { getAllEffectTiers } from "@/lib/data";

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

  // Get full merged catalog including imported baseline + user progress edits
  const allTiers = await getAllEffectTiers(user.id);
  const learnedMods = allTiers.filter((t) => t.unlocked);

  return {
    user: {
      username: user.username,
      displayName: user.name || user.username
    },
    stats: {
      total: allTiers.length,
      unlocked: learnedMods.length,
      percent: allTiers.length > 0 ? Math.round((learnedMods.length / allTiers.length) * 100) : 0
    },
    learnedMods
  };
}
