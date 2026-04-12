import { prisma } from "@/lib/prisma";

export async function getLearnedBasePieceIdsForUser(userId: string | null | undefined): Promise<string[]> {
  if (!userId) return [];
  const rows = await prisma.userLearnedBasePiece.findMany({
    where: { userId },
    select: { basePieceId: true }
  });
  return rows.map((r) => r.basePieceId);
}
