import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getAppSession } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";

function BuildSkeleton() {
  return (
    <div className="space-y-6 min-h-[80vh] animate-pulse">
      <div className="rounded-xl border border-amber-500/20 bg-slate-950/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-56 bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-850 rounded" />
        </div>
        <div className="h-10 w-full bg-slate-900 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl border border-slate-800 bg-slate-900/40" />
        ))}
      </div>
    </div>
  );
}

const BuilderExperimentClient = dynamic(
  () => import("@/components/builder/builder-experiment-client"),
  {
    ssr: true,
    loading: () => <BuildSkeleton />
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
