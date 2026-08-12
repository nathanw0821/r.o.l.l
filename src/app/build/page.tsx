import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";

const BuilderExperimentClient = dynamic(
  () => import("@/components/builder/builder-experiment-client"),
  {
    ssr: true,
    loading: () => <p className="text-sm text-foreground/60">Loading builder…</p>
  }
);

import { isAdminUser } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "B.U.I.L.D | R.O.L.L",
  description:
    "Battle Utility & Inventory Logistics Diagnostic (Experimental)"
};

export default async function BuildPage() {
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Fallback session
  }
  const isAdmin = isAdminUser(session?.user);

  const initialLearnedBasePieceIds = await getLearnedBasePieceIdsForUser(session?.user?.id);

  return (
    <BuilderExperimentClient 
      initialLearnedBasePieceIds={initialLearnedBasePieceIds} 
      isAdmin={isAdmin}
    />
  );
}
