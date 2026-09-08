import { NextResponse } from "next/server";
import { fetchNukeCodes, getMinervaSchedule, getDailyResetTimers } from "@/lib/discord/vault-intel";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [nukeCodes, minerva, resets] = await Promise.all([
      fetchNukeCodes(),
      Promise.resolve(getMinervaSchedule()),
      Promise.resolve(getDailyResetTimers()),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        nukeCodes,
        minerva,
        resets,
        timestamp: Math.floor(Date.now() / 1000),
      },
    });
  } catch (error) {
    console.error("[api/radar] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Appalachian radar intelligence" },
      { status: 500 }
    );
  }
}
