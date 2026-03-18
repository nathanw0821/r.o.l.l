import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEffectTiersByTierLabel } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tierLabel = "1 Star";

export default async function TierOnePage() {
  const session = await getServerSession(authOptions);
  const rows = await getEffectTiersByTierLabel(tierLabel, session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1 Star Effects</CardTitle>
          <CardDescription>Single-star legendary effects for quick crafting runs.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
      <EffectTable rows={rows} canEdit={Boolean(session)} />
    </div>
  );
}
