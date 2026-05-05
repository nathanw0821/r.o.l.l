"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { applyImportedProfile } from "@/lib/profile";
import { getActiveCharacterId } from "@/lib/character";
import { z } from "zod";

const toggleSchema = z.object({
  effectTierId: z.string().min(1),
  unlocked: z.boolean().nullable().optional(),
  isSeeking: z.boolean().optional(),
  modCount: z.number().int().min(0).optional()
});

const bulkToggleSchema = z.object({
  entries: z.array(toggleSchema).min(1).max(500)
});

function revalidateTrackerPaths() {
  revalidatePath("/");
  revalidatePath("/all-effects");
  revalidatePath("/1-star");
  revalidatePath("/2-star");
  revalidatePath("/3-star");
  revalidatePath("/4-star");
  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath("/overview/achievements");
  revalidatePath("/screenshot-assist");
  revalidatePath("/achievements");
}

export async function updateProgress(input: { 
  effectTierId: string; 
  unlocked?: boolean | null; 
  isSeeking?: boolean; 
  modCount?: number; 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const characterId = await getActiveCharacterId(session.user.id);
  if (!characterId) {
    throw new Error("No active character found");
  }

  const { effectTierId, unlocked, isSeeking, modCount } = parsed.data;

  if (unlocked === null) {
    await prisma.userProgress.deleteMany({
      where: {
        characterId,
        effectTierId,
        isSeeking: false,
        modCount: 0
      }
    });
  } else {
    await prisma.userProgress.upsert({
      where: {
        characterId_effectTierId: {
          characterId,
          effectTierId
        }
      },
      update: { 
        ...(unlocked !== undefined && { unlocked: unlocked ?? undefined }),
        ...(isSeeking !== undefined && { isSeeking }),
        ...(modCount !== undefined && { modCount })
      },
      create: {
        userId: session.user.id,
        characterId,
        effectTierId,
        unlocked: unlocked ?? false,
        isSeeking: isSeeking ?? false,
        modCount: modCount ?? 0
      }
    });
  }

  const achievements = await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
  return { achievements };
}

export async function bulkUpdateProgress(input: { 
  entries: { 
    effectTierId: string; 
    unlocked?: boolean | null; 
    isSeeking?: boolean; 
    modCount?: number; 
  }[] 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = bulkToggleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const characterId = await getActiveCharacterId(session.user.id);
  if (!characterId) {
    throw new Error("No active character found");
  }

  await prisma.$transaction(
    parsed.data.entries.map((entry) => {
      if (entry.unlocked === null) {
        return prisma.userProgress.deleteMany({
          where: {
            characterId,
            effectTierId: entry.effectTierId,
            isSeeking: false,
            modCount: 0
          }
        });
      }
      return prisma.userProgress.upsert({
        where: {
          characterId_effectTierId: {
            characterId: characterId as string,
            effectTierId: entry.effectTierId
          }
        },
        update: { 
          ...(entry.unlocked !== undefined && { unlocked: entry.unlocked ?? undefined }),
          ...(entry.isSeeking !== undefined && { isSeeking: entry.isSeeking }),
          ...(entry.modCount !== undefined && { modCount: entry.modCount })
        },
        create: {
          userId: session.user.id,
          characterId: characterId as string,
          effectTierId: entry.effectTierId,
          unlocked: entry.unlocked ?? false,
          isSeeking: entry.isSeeking ?? false,
          modCount: entry.modCount ?? 0
        }
      });
    })
  );

  const achievements = await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
  return { achievements };
}

export async function resetToImportedProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await applyImportedProfile(session.user.id, { force: true });

  const achievements = await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
  return { achievements };
}

export async function resetToPublicDefaults() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const dataset = await prisma.datasetVersion.findFirst({
    where: { isActive: true },
    orderBy: { importedAt: "desc" }
  });

  const characterId = await getActiveCharacterId(session.user.id);
  if (!characterId) {
    throw new Error("No active character found");
  }

  if (dataset) {
    await prisma.userProgress.deleteMany({
      where: { characterId, effectTier: { datasetVersionId: dataset.id } }
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileDatasetVersionId: dataset.id }
    });
  } else {
    await prisma.userProgress.deleteMany({
      where: { characterId }
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileDatasetVersionId: null }
    });
  }

  const achievements = await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
  return { achievements };
}
