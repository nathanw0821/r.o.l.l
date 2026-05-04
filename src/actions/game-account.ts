"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAccountSchema = z.object({
  name: z.string().min(1).max(50),
  platform: z.enum(["PC", "XBOX", "PS"]),
});

export async function createGameAccount(input: { name: string; platform: "PC" | "XBOX" | "PS" }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = createAccountSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const accountCount = await prisma.gameAccount.count({
    where: { userId: session.user.id }
  });

  if (accountCount >= 10) {
    throw new Error("Maximum of 10 game accounts allowed.");
  }

  await prisma.gameAccount.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      platform: parsed.data.platform,
    }
  });

  revalidatePath("/", "layout");
}

export async function deleteGameAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const account = await prisma.gameAccount.findUnique({
    where: { id: accountId }
  });

  if (!account || account.userId !== session.user.id) {
    throw new Error("Account not found");
  }

  // Delete all characters in this account
  await prisma.character.deleteMany({
    where: { gameAccountId: accountId }
  });

  await prisma.gameAccount.delete({
    where: { id: accountId }
  });

  revalidatePath("/", "layout");
}

export async function createGameAccountAndLinkCharacter(input: { 
  name: string; 
  platform: "PC" | "XBOX" | "PS";
  characterId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = createAccountSchema.safeParse({ name: input.name, platform: input.platform });
  if (!parsed.success) throw new Error("Invalid input");

  const accountCount = await prisma.gameAccount.count({
    where: { userId: session.user.id }
  });

  if (accountCount >= 10) {
    throw new Error("Maximum of 10 game accounts allowed.");
  }

  // Transaction to create account and update character
  await prisma.$transaction(async (tx) => {
    const account = await tx.gameAccount.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        platform: parsed.data.platform,
      }
    });

    await tx.character.update({
      where: { id: input.characterId },
      data: { gameAccountId: account.id }
    });

    // Also set as active
    await tx.userSettings.upsert({
      where: { userId: session.user.id },
      update: { activeCharacterId: input.characterId },
      create: { userId: session.user.id, activeCharacterId: input.characterId }
    });
  });

  revalidatePath("/", "layout");
}
