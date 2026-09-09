import { getServerSession } from "next-auth";
import { ok } from "@/lib/api/responses";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import { computeLegendaryTrackerUnlockByModId } from "@/lib/builder/legendary-tracker-unlock";
import type { BuilderModDTO } from "@/lib/builder/types";
import { getCachedBuilderModCatalog } from "@/lib/builder/get-builder-mod-catalog";




function toDto(
  row: {
    id: string;
    slug: string;
    name: string;
    starRank: number;
    category: string;
    subCategory: string | null;
    description: string;
    effectMath: unknown;
    craftingCost: unknown;
    allowedOnPowerArmor: boolean;
    allowedOnArmor: boolean;
    allowedOnWeapon: boolean;
    infestationOnly: boolean;
    fifthStarEligible: boolean;
    ghoulSpecialCap: number | null;
  },
  trackerUnlock: BuilderModDTO["trackerUnlock"]
): BuilderModDTO {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    starRank: row.starRank,
    category: row.category,
    subCategory: row.subCategory,
    description: row.description,
    effectMath: typeof row.effectMath === "object" && row.effectMath !== null ? (row.effectMath as Record<string, unknown>) : {},
    craftingCost:
      typeof row.craftingCost === "object" && row.craftingCost !== null ? (row.craftingCost as Record<string, unknown>) : {},
    allowedOnPowerArmor: row.allowedOnPowerArmor,
    allowedOnArmor: row.allowedOnArmor,
    allowedOnWeapon: row.allowedOnWeapon,
    infestationOnly: row.infestationOnly,
    fifthStarEligible: row.fifthStarEligible,
    ghoulSpecialCap: row.ghoulSpecialCap,
    extraComponent:
      typeof row.craftingCost === "object" && row.craftingCost !== null && "extraComponent" in row.craftingCost
        ? (String((row.craftingCost as Record<string, unknown>).extraComponent || "") || null)
        : null,
    trackerUnlock
  };
}

/** Mod catalog + tracker unlock hints (matched by effect name + tier star in the active dataset). */
export async function GET() {
  let userId: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
  } catch {
    // Unauthenticated or non-session context
  }

  try {
    const rows = await getCachedBuilderModCatalog();
    let unlockById: Record<string, BuilderModDTO["trackerUnlock"]> = {};
    if (userId) {
      try {
        const merged = await getAllEffectTiers(userId);
        unlockById = computeLegendaryTrackerUnlockByModId(rows, merged);
      } catch {
        // Tracker unlock mapping fallback
      }
    }
    const mods = rows.map((row) => toDto(row, unlockById[row.id] ?? "unknown"));
    const response = ok({ mods });
    if (userId) {
      response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    } else {
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, s-maxage=120, stale-while-revalidate=600"
      );
    }
    return response;
  } catch (error) {
    console.error("[GET /api/builder/mods error]", error);
    return ok({ mods: [] });
  }
}