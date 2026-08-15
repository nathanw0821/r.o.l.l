import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { BuilderPayload } from "@/lib/builder/types";
import TransmissionsVaultClient from "@/components/transmissions/transmissions-vault-client";
import { deriveArchetypeTags, type TransmissionSummary } from "@/lib/builder/transmissions-engine";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Transmissions Vault | R.O.L.L.",
  description:
    "Explore, filter, and 1-click clone community character builds, weapons, armor sets, and 37-card perk decks for Fallout 76.",
};

export default async function TransmissionsPage() {
  let initialTransmissions: TransmissionSummary[] = [];
  let initialTotalCount = 0;

  try {
    const [totalCount, records] = await Promise.all([
      prisma.sharedBuild.count({ where: { published: true } }),
      prisma.sharedBuild.findMany({
        where: { published: true },
        take: 18,
        skip: 0,
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

    initialTotalCount = totalCount;
    initialTransmissions = records.map((rec) => {
      const payload = (rec.payload as unknown as BuilderPayload) || {};
      const baseSpecial = payload.baseSpecial || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 };
      const archetypeTags = deriveArchetypeTags(payload);

      return {
        id: rec.id,
        slug: rec.slug,
        title: rec.title,
        description: rec.description,
        createdAt: rec.createdAt.toISOString(),
        author: rec.user
          ? {
              name: rec.user.name,
              username: rec.user.username,
              image: rec.user.image,
            }
          : null,
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
        equippedPerkCount: Array.isArray(payload.legendaryPerkIds)
          ? payload.legendaryPerkIds.length
          : 0,
        mutationCount: Array.isArray(payload.mutationIds)
          ? payload.mutationIds.length
          : 0,
        archetypeTags,
      };
    });
  } catch (e) {
    console.error("TransmissionsPage fetch error:", e);
  }

  return (
    <div className="space-y-6">
      <TransmissionsVaultClient
        initialTransmissions={initialTransmissions}
        initialTotalCount={initialTotalCount}
      />
    </div>
  );
}
