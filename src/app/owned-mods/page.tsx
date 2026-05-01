import { getAppSession } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getAllEffectTiers } from "@/lib/data";
import SummaryClient from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default async function OwnedModsPage() {
  const session = await getAppSession();
  const isAdmin = isAdminUser(session?.user);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="rounded-full bg-accent/10 p-2 text-accent">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Owned Mod Boxes</CardTitle>
            <CardDescription>View all the legendary mod boxes you currently have in your inventory.</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <SummaryClient 
        rows={rows} 
        isSignedIn={Boolean(session?.user?.id)} 
        isAdmin={isAdmin}
        initialTab="owned"
      />
    </div>
  );
}
