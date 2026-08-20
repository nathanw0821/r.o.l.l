import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";
import { isAdminUser } from "@/lib/app-config";

function PerkBuilderSkeleton() {
  return (
    <div className="space-y-6 min-h-[80vh] animate-pulse">
      <div className="rounded-xl border border-amber-500/20 bg-slate-950/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {["S", "P", "E", "C", "I", "A", "L"].map((stat) => (
            <div
              key={stat}
              className="h-36 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col items-center justify-between p-3"
            >
              <div className="h-20 w-20 rounded bg-slate-800/80" />
              <div className="h-3 w-14 bg-slate-800 rounded" />
              <div className="h-6 w-16 bg-slate-800/90 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/40 bg-panel/30 p-6 space-y-4">
        <div className="h-6 w-64 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      </div>
    </div>
  );
}

const BuilderExperimentClient = nextDynamic(
  () => import("@/components/builder/builder-experiment-client"),
  {
    ssr: true,
    loading: () => <PerkBuilderSkeleton />
  }
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "P.E.R.K. & B.U.I.L.D. Unified Suite | R.O.L.L.",
  description: "Fallout 76 Perk Equipment & Reconfiguration Kit (P.E.R.K.) with synchronized Punch Card Machine, 319 official Vault Boy SVG cards, and live Combat Matrix."
};

export default async function PerksPage() {
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Fallback session
  }
  const isAdmin = isAdminUser(session?.user);
  const initialLearnedBasePieceIds = await getLearnedBasePieceIdsForUser(session?.user?.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <BuilderExperimentClient
        initialLearnedBasePieceIds={initialLearnedBasePieceIds}
        isAdmin={isAdmin}
        initialTab="perks"
      />
    </div>
  );
}
