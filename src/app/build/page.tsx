import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearnedBasePieceIdsForUser } from "@/lib/base-gear-learned";

const BuilderExperimentClient = dynamic(
  () => import("@/components/builder/builder-experiment-client"),
  {
    ssr: true,
    loading: () => <p className="text-sm text-foreground/60">Loading builder…</p>
  }
);

import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "B.U.I.L.D | R.O.L.L",
  description:
    "Battle Utility & Inventory Logistics Diagnostic (Experimental)"
};

export default async function BuildPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const initialLearnedBasePieceIds = await getLearnedBasePieceIdsForUser(session?.user?.id);

  return <BuilderExperimentClient initialLearnedBasePieceIds={initialLearnedBasePieceIds} />;
}
