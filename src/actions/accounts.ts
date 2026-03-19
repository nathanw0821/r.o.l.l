"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const unlinkSchema = z.object({
  provider: z.string().min(1)
});

export async function unlinkAccount(input: { provider: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const parsed = unlinkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input");
  }

  const userId = session.user.id;
  const [accounts, user] = await prisma.$transaction([
    prisma.account.findMany({ where: { userId }, select: { provider: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  ]);

  if (accounts.length <= 1 && !user?.passwordHash) {
    throw new Error("Cannot unlink the last sign-in method.");
  }

  await prisma.account.deleteMany({
    where: { userId, provider: parsed.data.provider }
  });

  revalidatePath("/settings");
  return { ok: true };
}
