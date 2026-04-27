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
  unlocked: z.boolean().nullable()
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
  revalidatePath("/overview/achievements");
  revalidatePath("/screenshot-assist");
  revalidatePath("/still-need");
  revalidatePath("/summary");
  revalidatePath("/achievements");
}

export async function updateProgress(input: { effectTierId: string; unlocked: boolean | null }) {
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

  const { effectTierId, unlocked } = parsed.data;

  if (unlocked === null) {
    await prisma.userProgress.deleteMany({
      where: {
        characterId,
        effectTierId
      }
    });
  } else {
    // Wait, the unique constraint is currently on userId_effectTierId. We need to use characterId_effectTierId if it was renamed, or we can use findFirst and update, but upsert needs a unique index. Let's check what the unique index is. It is @@unique([userId, effectTierId]) in the schema.prisma. So we can still upsert by userId_effectTierId for now, but also pass characterId.
    // Wait, in schema.prisma, we changed it to: @@unique([userId, effectTierId]). So upsert still needs userId_effectTierId.
    const existing = await prisma.userProgress.findUnique({
      where: { characterId_effectTierId: { characterId, effectTierId } }
    });
    if (existing) {
      await prisma.userProgress.update({
        where: { id: existing.id },
        data: { unlocked }
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          characterId,
          effectTierId,
          unlocked
        }
      });
    }
  }

  await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
}

export async function bulkUpdateProgress(input: { entries: { effectTierId: string; unlocked: boolean | null }[] }) {
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
            effectTierId: entry.effectTierId
          }
        });
      }
      return prisma.userProgress.upsert({
        where: {
          characterId_effectTierId: {
            characterId,
            effectTierId: entry.effectTierId
          }
        },
        update: { unlocked: entry.unlocked },
        create: {
          userId: session.user.id,
          characterId,
          effectTierId: entry.effectTierId,
          unlocked: entry.unlocked
        }
      });
    })
  );

  await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
}

export async function resetToImportedProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await applyImportedProfile(session.user.id, { force: true });

  await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
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

  await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
}
