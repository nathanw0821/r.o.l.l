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

export const metadata: Metadata = {
  title: "Loadout Builder | R.O.L.L",
  description:
    "Sandbox legendary loadout builder for Fallout 76: slot rules, armor vs weapon, power armor exclusions, shareable links."
};

export default async function BuildPage() {
  const session = await getServerSession(authOptions);
  const initialLearnedBasePieceIds = await getLearnedBasePieceIdsForUser(session?.user?.id);

  return <BuilderExperimentClient initialLearnedBasePieceIds={initialLearnedBasePieceIds} />;
}
