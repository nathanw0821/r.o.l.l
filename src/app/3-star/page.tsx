import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEffectTiersByTierLabel } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tierLabel = "3 Star";

export default async function TierThreePage() {
  const session = await getServerSession(authOptions);
  const rows = await getEffectTiersByTierLabel(tierLabel, session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>3 Star Effects</CardTitle>
          <CardDescription>High-impact modifiers for endgame crafting.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
      <EffectTable rows={rows} canEdit={Boolean(session)} />
    </div>
  );
}
