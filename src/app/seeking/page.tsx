import { getAppSession } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getAllEffectTiers } from "@/lib/data";
import SummaryClient from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default async function SeekingPage() {
  const session = await getAppSession();
  const isAdmin = isAdminUser(session?.user);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <div className="rounded-full bg-accent/10 p-2 text-accent">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Seeking Effects</CardTitle>
            <CardDescription>Track the legendary effects you are currently hunting for.</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      {/* 
        We pass a prop or use searchParams to tell SummaryClient to start on the 'seeking' tab.
        For now, let's just make it work via the tab state in SummaryClient, 
        but we can enhance SummaryClient to accept an initialTab prop.
      */}
      <SummaryClient 
        rows={rows} 
        isSignedIn={Boolean(session?.user?.id)} 
        isAdmin={isAdmin}
        initialTab="seeking"
      />
    </div>
  );
}
