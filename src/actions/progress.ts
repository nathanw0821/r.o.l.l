"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { applyImportedProfile } from "@/lib/profile";
import { z } from "zod";

const toggleSchema = z.object({
  effectTierId: z.string().min(1),
  unlocked: z.boolean().nullable()
});

function revalidateTrackerPaths() {
  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/all-effects");
  revalidatePath("/1-star");
  revalidatePath("/2-star");
  revalidatePath("/3-star");
  revalidatePath("/4-star");
  revalidatePath("/still-need");
  revalidatePath("/summary");
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

  const { effectTierId, unlocked } = parsed.data;

  if (unlocked === null) {
    await prisma.userProgress.deleteMany({
      where: {
        userId: session.user.id,
        effectTierId
      }
    });
  } else {
    await prisma.userProgress.upsert({
      where: {
        userId_effectTierId: {
          userId: session.user.id,
          effectTierId
        }
      },
      update: { unlocked },
      create: {
        userId: session.user.id,
        effectTierId,
        unlocked
      }
    });
  }

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

  if (dataset) {
    await prisma.userProgress.deleteMany({
      where: { userId: session.user.id, effectTier: { datasetVersionId: dataset.id } }
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileDatasetVersionId: dataset.id }
    });
  } else {
    await prisma.userProgress.deleteMany({
      where: { userId: session.user.id }
    });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileDatasetVersionId: null }
    });
  }

  await syncUserAchievements(session.user.id);
  revalidateTrackerPaths();
}
