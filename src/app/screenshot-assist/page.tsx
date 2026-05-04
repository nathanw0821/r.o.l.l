import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import ScreenshotAssistClient from "@/components/screenshot-assist-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screenshot Assist | R.O.L.L.",
  description: "Synchronize your learned legendary mods from Fallout 76 crafting bench screenshots using client-side OCR.",
};

export default async function ScreenshotAssistPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <p className="text-sm text-foreground/65">
        Optimized for <strong>Legendary Crafting Bench</strong> tabs (1*-4*). Snip, Paste, and Sync your learned mods.
      </p>
      <ScreenshotAssistClient rows={rows} />
    </div>
  );
}
