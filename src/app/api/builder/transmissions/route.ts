import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BuilderPayload } from "@/lib/builder/types";
import {
  deriveArchetypeTags,
  type TransmissionSummary,
} from "@/lib/builder/transmissions-engine";

export const dynamic = "force-dynamic";

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
