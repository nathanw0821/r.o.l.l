import { getServerSession } from "next-auth";
import { ok } from "@/lib/api/responses";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import { computeLegendaryTrackerUnlockByModId } from "@/lib/builder/legendary-tracker-unlock";
import type { BuilderModDTO } from "@/lib/builder/types";
import { getCachedBuilderModCatalog } from "@/lib/builder/get-builder-mod-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    trackerUnlock
  };
}

/** Mod catalog + tracker unlock hints (matched by effect name + tier star in the active dataset). */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const rows = await getCachedBuilderModCatalog();
  const merged = await getAllEffectTiers(userId);
  const unlockById = computeLegendaryTrackerUnlockByModId(rows, merged);
  const mods = rows.map((row) => toDto(row, unlockById[row.id] ?? "unknown"));
  const response = ok({ mods });
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}