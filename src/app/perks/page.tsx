import type { Metadata } from "next";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";
import { isAdminUser } from "@/lib/app-config";
import { LazyPerkPageClient } from "@/components/builder/dynamic-builder-wrapper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "P.E.R.K. & B.U.I.L.D. Unified Suite | R.O.L.L.",
  description: "Fallout 76 Perk Equipment & Reconfiguration Kit (P.E.R.K.) with synchronized Punch Card Machine, 1:1 bitmapped Pip-Boy curved in-game perk cards with dynamic multi-rank progression, and live Combat Matrix."
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
      <LazyPerkPageClient
        initialLearnedBasePieceIds={initialLearnedBasePieceIds}
        isAdmin={isAdmin}
        initialTab="perks"
      />
    </div>
  );
}
