"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { awardAchievements } from "@/lib/achievements";

export async function triggerBuilderAchievement(key: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;

  const validKeys = [
    "diagnostic_access",
    "build_save",
    "build_full",
    "build_stats",
    "build_perks",
    "undo_clear"
  ];

  if (validKeys.includes(key)) {
    await awardAchievements(session.user.id, [key]);
  }
}
