import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import ScreenshotAssistClient from "@/components/screenshot-assist-client";

export default async function ScreenshotAssistPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <p className="text-sm text-foreground/65">
        Shortlist + optional OpenAI (your key). Nothing persists until you save.
      </p>
      <ScreenshotAssistClient rows={rows} />
    </div>
  );
}
