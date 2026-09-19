import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { awardAchievements } from "@/lib/achievements";

/**
 * Achievements a client may unlock directly (the "press the button" easter egg). Everything else
 * is awarded by the server when the action happens, so it cannot be claimed with a fetch.
 */
const CLIENT_UNLOCKABLE_ACHIEVEMENTS: ReadonlySet<string> = new Set(["button_masher"]);

export async function POST(req: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { key?: unknown };
    const key = typeof body?.key === "string" ? body.key : null;
    if (!key || !CLIENT_UNLOCKABLE_ACHIEVEMENTS.has(key)) {
      return NextResponse.json({ error: "Invalid achievement key" }, { status: 400 });
    }

    const awarded = await awardAchievements(session.user.id, [key]);
    return NextResponse.json({ success: true, awarded });
  } catch (error) {
    console.error("Unlock achievement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
