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

  // Fallback to first character
  if (settings?.user?.characters?.[0]?.id) {
    await prisma.userSettings.update({
      where: { userId },
      data: { activeCharacterId: settings.user.characters[0].id }
    });
    return settings.user.characters[0].id;
  }

  return undefined;
}

export async function getUserCharacters(userId: string) {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" }
  });
}
