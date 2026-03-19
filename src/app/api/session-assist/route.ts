import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";

export async function GET() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return NextResponse.json({
    rows: rows.map((row) => ({
      id: row.id,
      effect: row.effect,
      tier: row.tier,
      categories: row.categories,
      unlocked: row.unlocked,
      selectionSource: row.selectionSource
    }))
  });
}
