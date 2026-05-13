import { prisma } from "@/lib/prisma";

export async function getActiveCharacterId(userId: string | undefined): Promise<string | undefined> {
  if (!userId) return undefined;

  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { activeCharacterId: true, user: { select: { characters: { take: 1, select: { id: true } } } } }
  });

  if (settings?.activeCharacterId) {
    return settings.activeCharacterId;
  }

  // Check if any character already exists
  const existingChar = await prisma.character.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });

  if (existingChar) {
    await prisma.userSettings.upsert({
      where: { userId },
      update: { activeCharacterId: existingChar.id },
      create: { userId, activeCharacterId: existingChar.id }
    });
    return existingChar.id;
  }

  // Create a default character if literally none exist
  const newChar = await prisma.character.create({
    data: {
      userId,
      name: "Main Character"
    }
  });

  await prisma.userSettings.upsert({
    where: { userId },
    update: { activeCharacterId: newChar.id },
    create: { userId, activeCharacterId: newChar.id }
  });

  return newChar.id;
}

export async function getUserCharacters(userId: string) {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });
}

export async function getUserGameAccounts(userId: string) {
  return prisma.gameAccount.findMany({
    where: { userId },
    include: {
      characters: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}
