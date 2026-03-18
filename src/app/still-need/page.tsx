import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStillNeed } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StillNeedPage() {
  const session = await getServerSession(authOptions);
  const rows = await getStillNeed(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Still Need</CardTitle>
          <CardDescription>
            Your locked effects across all tiers. Sign in to track progress.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
      <EffectTable rows={rows} canEdit={Boolean(session)} />
    </div>
  );
}
