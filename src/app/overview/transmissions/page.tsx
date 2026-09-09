import type { Metadata } from "next";
import Link from "next/link";
import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BuilderPayload } from "@/lib/builder/types";
import TransmissionsVaultClient from "@/components/transmissions/transmissions-vault-client";
import { deriveArchetypeTags, type TransmissionSummary } from "@/lib/builder/transmissions-engine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Transmissions | R.O.L.L.",
  description: "View, edit, and decommission your published Fallout 76 loadout transmissions.",
};

export default async function OverviewTransmissionsPage() {
  const session = await getAppSession();
  const currentUserId = session?.user?.id;

  let initialTransmissions: TransmissionSummary[] = [];
  let initialTotalCount = 0;

  if (currentUserId) {
    try {
      const [totalCount, records] = await Promise.all([
        prisma.sharedBuild.count({
          where: { published: true, userId: currentUserId },
        }),
        prisma.sharedBuild.findMany({
          where: { published: true, userId: currentUserId },
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
          userId: rec.userId,
          isOwner: true,
          author: rec.user
            ? {
                id: rec.userId,
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
      console.error("Failed to query user transmissions:", e);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-panel">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase tracking-wider">
                <Radio className="h-3.5 w-3.5 text-accent animate-pulse" />
                <span>[ TRANSMISSIONS VAULT ARCHIVES ]</span>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground/95 mt-1 font-mono uppercase">
                My Transmissions
              </CardTitle>
              <CardDescription className="text-xs text-foreground/60 font-mono mt-0.5">
                Track, modify, and delete the character builds you have broadcast to the Appalachian Community Transmissions Vault.
              </CardDescription>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Link href="/build">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Create New Transmission</span>
              </Link>
            </Button>
          </div>
        </CardHeader>
        {!currentUserId && (
          <CardContent className="pt-0">
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 text-xs font-mono text-amber-200/90 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>Unauthenticated Workbench Session</span>
              </div>
              <p>
                Showing transmissions saved in this browser&rsquo;s local storage. To synchronize your builds across multiple devices and permanently bind them to your account, sign in to R.O.L.L.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <TransmissionsVaultClient
        initialTransmissions={initialTransmissions}
        initialTotalCount={initialTotalCount}
        initialScope="mine"
      />
    </div>
  );
}
