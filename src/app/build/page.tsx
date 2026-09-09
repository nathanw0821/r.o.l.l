import type { Metadata } from "next";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";
import { LazyBuildPageClient } from "@/components/builder/dynamic-builder-wrapper";
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
    <LazyBuildPageClient 
      initialLearnedBasePieceIds={initialLearnedBasePieceIds} 
      isAdmin={isAdmin}
    />
  );
}
