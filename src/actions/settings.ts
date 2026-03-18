"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  accent: z.enum(["ember", "vault", "radburst", "glow"]).optional(),
  density: z.enum(["comfortable", "compact"]).optional(),
  colorBlind: z
    .enum(["none", "deuteranopia", "protanopia", "tritanopia", "high-contrast"])
    .optional()
});

export async function updateUserSettings(input: {
  theme?: "light" | "dark" | "system";
  accent?: "ember" | "vault" | "radburst" | "glow";
  density?: "comfortable" | "compact";
  colorBlind?: "none" | "deuteranopia" | "protanopia" | "tritanopia" | "high-contrast";
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return;
  }

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return;
  }

  await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data }
  });
}
