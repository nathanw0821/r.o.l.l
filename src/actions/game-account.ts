"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const gameAccountSchema = z.object({
  name: z.string().min(1).max(30),
  platform: z.enum(["PC", "XBOX", "PS"]),
});

export async function createGameAccount(input: { name: string; platform: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const parsed = gameAccountSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const count = await prisma.gameAccount.count({
    where: { userId: session.user.id }
  });

  if (count >= 3) throw new Error("Maximum of 3 Game Accounts allowed.");

  await prisma.gameAccount.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      platform: parsed.data.platform,
    }
  });

  revalidatePath("/", "layout");
}

export async function deleteGameAccount(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not authenticated");

  const account = await prisma.gameAccount.findUnique({
    where: { id, userId: session.user.id }
  });

  if (!account) throw new Error("Account not found");

  await prisma.gameAccount.delete({ where: { id } });

  revalidatePath("/", "layout");
}
