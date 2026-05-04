import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserCharacters, getActiveCharacterId, getUserGameAccounts } from "@/lib/character";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  try {
    const [characters, gameAccounts, activeCharacterId] = await Promise.all([
      getUserCharacters(session.user.id),
      getUserGameAccounts(session.user.id),
      getActiveCharacterId(session.user.id)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        characters,
        gameAccounts,
        activeCharacterId
      }
    });
  } catch (error) {
    console.error("Failed to fetch character selection data:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
