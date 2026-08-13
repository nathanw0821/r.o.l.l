import { Suspense } from "react";
import PtsClient from "@/components/pts/pts-client";

export const metadata = {
  title: "P.T.S. (Provisional Testing System) | R.O.L.L.",
  description: "Track experimental Fallout 76 test server builds, 4-star legendary mods, crafting overhauls, and NukaKnights datamines."
};

export default function PtsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm font-mono text-foreground/60 animate-pulse">Loading P.T.S. Testing System...</div>}>
      <PtsClient />
    </Suspense>
  );
}
