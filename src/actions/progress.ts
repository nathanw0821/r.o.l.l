"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleSchema = z.object({
  effectTierId: z.string().min(1),
  unlocked: z.boolean()
});

export async function updateProgress(input: { effectTierId: string; unlocked: boolean }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { effectTierId, unlocked } = parsed.data;

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

  revalidatePath("/");
  revalidatePath("/all-effects");
  revalidatePath("/1-star");
  revalidatePath("/2-star");
  revalidatePath("/3-star");
  revalidatePath("/4-star");
  revalidatePath("/still-need");
}
