"use server";

import { safeRevalidatePath } from "@/lib/revalidate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { awardAchievements } from "@/lib/achievements";

const createCharacterSchema = z.object({
  name: z.string().min(1).max(30),
  gameAccountId: z.string().optional(),
});

const renameCharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(30),
});

export async function createCharacter(input: { name: string, gameAccountId?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = createCharacterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const characterCount = await prisma.character.count({
    where: { userId: session.user.id }
  });

  if (characterCount >= 15) {
    throw new Error("Maximum of 15 characters allowed across all accounts.");
  }

  // If gameAccountId provided, check limit for that account
  if (parsed.data.gameAccountId) {
    const accountCharCount = await prisma.character.count({
      where: { gameAccountId: parsed.data.gameAccountId }
    });
    if (accountCharCount >= 5) {
      throw new Error("Maximum of 5 characters allowed per Game Account.");
    }
  }

  const character = await prisma.character.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      gameAccountId: parsed.data.gameAccountId || null,
    }
  });

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { activeCharacterId: character.id },
    create: { userId: session.user.id, activeCharacterId: character.id }
  });

  // Achievements
  const earned: string[] = [];
  if (characterCount === 1) earned.push("second_life");
  if (characterCount === 4) earned.push("full_roster"); // 4 prior + 1 new = 5
  const achievements = await awardAchievements(session.user.id, earned);

  safeRevalidatePath("/", "layout");
  return { achievements };
}

export async function renameCharacter(input: { id: string, name: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = renameCharacterSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const character = await prisma.character.findUnique({
    where: { id: parsed.data.id }
  });

  if (!character || character.userId !== session.user.id) {
    throw new Error("Character not found");
  }

  await prisma.character.update({
    where: { id: parsed.data.id },
    data: { name: parsed.data.name }
  });

  // Achievements
  const earned: string[] = ["a_new_name"];
  if (parsed.data.name.toLowerCase() === "gary") earned.push("gary");
  if (parsed.data.name.toLowerCase() === "main character") earned.push("identity_theft");
  const achievements = await awardAchievements(session.user.id, earned);

  safeRevalidatePath("/", "layout");
  return { achievements };
}

export async function setActiveCharacter(characterId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId }
  });

  if (!character || character.userId !== session.user.id) {
    throw new Error("Character not found");
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { activeCharacterId: characterId },
    create: { userId: session.user.id, activeCharacterId: characterId }
  });

  // Achievements
  const achievements = await awardAchievements(session.user.id, ["changing_gears"]);

  safeRevalidatePath("/", "layout");
  return { achievements };
}

export async function deleteCharacter(characterId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId }
  });

  if (!character || character.userId !== session.user.id) {
    throw new Error("Character not found");
  }

  const characterCount = await prisma.character.count({
    where: { userId: session.user.id }
  });

  if (characterCount <= 1) {
    throw new Error("Cannot delete your only character.");
  }

  await prisma.character.delete({
    where: { id: characterId }
  });

  // Pick a new active character
  const remaining = await prisma.character.findFirst({
    where: { userId: session.user.id }
  });

  if (remaining) {
    await prisma.userSettings.update({
      where: { userId: session.user.id },
      data: { activeCharacterId: remaining.id }
    });
  }

  // Achievements
  const earned: string[] = ["spring_cleaning"];
  if (characterCount === 2) earned.push("the_one"); // Deleted from 2 to 1
  const achievements = await awardAchievements(session.user.id, earned);

  safeRevalidatePath("/", "layout");
  return { achievements };
}

export async function linkCharacterToAccount(characterId: string, gameAccountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId }
  });

  if (!character || character.userId !== session.user.id) {
    throw new Error("Character not found");
  }

  const gameAccount = await prisma.gameAccount.findUnique({
    where: { id: gameAccountId }
  });

  if (!gameAccount || gameAccount.userId !== session.user.id) {
    throw new Error("Game account not found");
  }

  // Check character limit for target account
  const accountCharCount = await prisma.character.count({
    where: { gameAccountId: gameAccountId }
  });
  if (accountCharCount >= 5) {
    throw new Error("Maximum of 5 characters allowed per Game Account.");
  }

  await prisma.character.update({
    where: { id: characterId },
    data: { gameAccountId }
  });

  // Also set as active
  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: { activeCharacterId: characterId },
    create: { userId: session.user.id, activeCharacterId: characterId }
  });

  safeRevalidatePath("/", "layout");
}
