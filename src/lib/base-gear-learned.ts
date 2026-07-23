import { prisma } from "@/lib/prisma";

export async function getLearnedBasePieceIdsForUser(userId: string | null | undefined): Promise<string[]> {
  if (!userId) return [];
  try {
    const rows = await prisma.userLearnedBasePiece.findMany({
      where: { userId },
      select: { basePieceId: true }
    });
    return rows.map((r) => r.basePieceId);
  } catch (error) {
    // Production often hits this before `prisma migrate deploy` (missing table). Builder still works without persistence.
    if (process.env.NODE_ENV === "development") {
      console.error("[getLearnedBasePieceIdsForUser]", error);
    }
    return [];
  }
}
