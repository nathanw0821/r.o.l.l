import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BuilderPayload } from "@/lib/builder/types";

export const dynamic = "force-dynamic";

export type TransmissionSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  createdAt: string;
  author: {
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
  isGhoul: boolean;
  equipmentKind: "weapon" | "armor" | "powerArmor" | "underarmor";
  basePieceId: string;
  weaponSub: string | null;
  legendaryModIds: (string | null)[];
  specials: {
    S: number;
    P: number;
    E: number;
    C: number;
    I: number;
    A: number;
    L: number;
  };
  equippedPerkCount: number;
  mutationCount: number;
  archetypeTags: string[];
};

/**
 * Derives archetype tags from a build's payload (e.g. Bloodied, Commando, Power Armor, Ghoul, etc.).
 */
export function deriveArchetypeTags(payload: Partial<BuilderPayload>): string[] {
  const tags = new Set<string>();

  if (payload.ghoul) {
    tags.add("Ghoul");
  } else {
    tags.add("Human");
  }

  if (payload.equipmentKind === "powerArmor") {
    tags.add("Power Armor");
    tags.add("Tank");
  } else if (payload.equipmentKind === "armor") {
    tags.add("Regular Armor");
  }

  // Check weapon mods for legendary effects
  const mods = payload.legendaryModIds || [];
  if (mods.some((m) => m?.toLowerCase().includes("bloodied"))) {
    tags.add("Bloodied");
  }
  if (mods.some((m) => m?.toLowerCase().includes("anti-armor") || m?.toLowerCase().includes("antiarmor"))) {
    tags.add("Anti-Armor");
  }
  if (mods.some((m) => m?.toLowerCase().includes("quad"))) {
    tags.add("Quad");
  }
  if (mods.some((m) => m?.toLowerCase().includes("vampire"))) {
    tags.add("Vampire's");
  }
  if (mods.some((m) => m?.toLowerCase().includes("aristocrat"))) {
    tags.add("Aristocrat's");
  }

  // Check weapon type
  const baseId = payload.basePieceId?.toLowerCase() || "";
  if (baseId.includes("fixer") || baseId.includes("handmade") || baseId.includes("railway") || baseId.includes("assault")) {
    tags.add("Commando");
    tags.add("Rifleman");
  } else if (baseId.includes("plasma-caster") || baseId.includes("holy-fire") || baseId.includes("cremator") || baseId.includes("gatling") || baseId.includes("50cal") || baseId.includes("flamer")) {
    tags.add("Heavy Gunner");
  } else if (baseId.includes("axe") || baseId.includes("chainsaw") || baseId.includes("hammer") || baseId.includes("gauntlet") || baseId.includes("sword") || payload.weaponSub === "melee") {
    tags.add("Melee");
  } else if (baseId.includes("shotgun") || baseId.includes("cold-shoulder")) {
    tags.add("Shotgunner");
  } else if (baseId.includes("alien-blaster") || baseId.includes("revolver") || baseId.includes("10mm")) {
    tags.add("Gunslinger");
  }

  // Check unyielding in armor
  if (payload.armorLegendaryModIds?.some((row) => row.some((m) => m?.toLowerCase().includes("unyielding")))) {
    tags.add("Unyielding");
  }
  if (payload.armorLegendaryModIds?.some((row) => row.some((m) => m?.toLowerCase().includes("overeater")))) {
    tags.add("Overeater's");
  }

  return Array.from(tags);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase() || "";
    const species = searchParams.get("species") || "all";
    const kind = searchParams.get("kind") || "all";
    const tag = searchParams.get("tag") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "18", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      published: true,
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [totalCount, records] = await Promise.all([
      prisma.sharedBuild.count({ where }),
      prisma.sharedBuild.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const transmissions: TransmissionSummary[] = records.map((rec) => {
      const payload = (rec.payload as unknown as BuilderPayload) || {};
      const baseSpecial = payload.baseSpecial || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
      const archetypeTags = deriveArchetypeTags(payload);

      return {
        id: rec.id,
        slug: rec.slug,
        title: rec.title,
        description: rec.description,
        createdAt: rec.createdAt.toISOString(),
        author: rec.user ? {
          name: rec.user.name,
          username: rec.user.username,
          image: rec.user.image,
        } : null,
        isGhoul: Boolean(payload.ghoul),
        equipmentKind: payload.equipmentKind || "weapon",
        basePieceId: payload.basePieceId || "the-fixer",
        weaponSub: payload.weaponSub || null,
        legendaryModIds: payload.legendaryModIds || [null, null, null, null],
        specials: {
          S: Number(baseSpecial.S ?? baseSpecial.str ?? 1),
          P: Number(baseSpecial.P ?? baseSpecial.per ?? 1),
          E: Number(baseSpecial.E ?? baseSpecial.end ?? 1),
          C: Number(baseSpecial.C ?? baseSpecial.cha ?? 1),
          I: Number(baseSpecial.I ?? baseSpecial.int ?? 1),
          A: Number(baseSpecial.A ?? baseSpecial.agi ?? 1),
          L: Number(baseSpecial.L ?? baseSpecial.lck ?? 1),
        },
        equippedPerkCount: Array.isArray(payload.legendaryPerkIds) ? payload.legendaryPerkIds.length : 0,
        mutationCount: Array.isArray(payload.mutationIds) ? payload.mutationIds.length : 0,
        archetypeTags,
      };
    });

    // In-memory filter for species or tag if specified
    let filtered = transmissions;
    if (species === "ghoul") {
      filtered = filtered.filter((t) => t.isGhoul);
    } else if (species === "human") {
      filtered = filtered.filter((t) => !t.isGhoul);
    }

    if (kind !== "all") {
      filtered = filtered.filter((t) => t.equipmentKind === kind);
    }

    if (tag !== "all") {
      filtered = filtered.filter((t) => t.archetypeTags.includes(tag));
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Transmissions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transmissions." },
      { status: 500 }
    );
  }
}
