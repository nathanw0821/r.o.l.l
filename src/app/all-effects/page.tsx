import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AllEffectsPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Effects</CardTitle>
          <CardDescription>
            Full registry across all tiers. Toggle unlocks if you are signed in.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
      <EffectTable rows={rows} canEdit={Boolean(session)} />
    </div>
  );
}
