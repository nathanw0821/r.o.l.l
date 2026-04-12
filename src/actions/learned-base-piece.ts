"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isTrackableBasePieceId } from "@/lib/builder/base-gear";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  basePieceId: z.string().min(1),
  learned: z.boolean()
});

export async function updateLearnedBasePiece(input: { basePieceId: string; learned: boolean }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const { basePieceId, learned } = parsed.data;
  if (!isTrackableBasePieceId(basePieceId)) {
    throw new Error("Unknown base piece");
  }

  if (!learned) {
    await prisma.userLearnedBasePiece.deleteMany({
      where: { userId: session.user.id, basePieceId }
    });
  } else {
    await prisma.userLearnedBasePiece.upsert({
      where: {
        userId_basePieceId: {
          userId: session.user.id,
          basePieceId
        }
      },
      create: { userId: session.user.id, basePieceId },
      update: {}
    });
  }

  revalidatePath("/build");
}
