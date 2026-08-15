import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";
import { isAdminUser } from "@/lib/app-config";

const BuilderExperimentClient = nextDynamic(
  () => import("@/components/builder/builder-experiment-client"),
  {
    ssr: true,
    loading: () => <p className="text-sm text-foreground/60 font-mono p-6">Loading P.E.R.K. Command Suite…</p>
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
