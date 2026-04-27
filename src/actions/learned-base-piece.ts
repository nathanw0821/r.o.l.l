"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isTrackableBasePieceId } from "@/lib/builder/base-gear";
import { getActiveCharacterId } from "@/lib/character";
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

  const characterId = await getActiveCharacterId(session.user.id);
  if (!characterId) {
    throw new Error("No active character found");
  }

  if (!learned) {
    await prisma.userLearnedBasePiece.delete({
      where: {
        characterId_basePieceId: {
          characterId,
          basePieceId
        }
      }
    }).catch(() => {}); // Ignore if not found
  } else {
    await prisma.userLearnedBasePiece.upsert({
      where: {
        characterId_basePieceId: {
          characterId,
          basePieceId
        }
      },
      create: {
        userId: session.user.id,
        characterId,
        basePieceId
      },
      update: {}
    });
  }

  revalidatePath("/build");
}
