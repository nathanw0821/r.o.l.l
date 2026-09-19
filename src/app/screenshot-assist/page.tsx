import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import ScreenshotAssistClient from "@/components/screenshot-assist-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screenshot import | R.O.L.L.",
  description: "Paste a screenshot of your Fallout 76 legendary crafting bench and R.O.L.L. reads which mods you have learned, on your device.",
};

export default async function ScreenshotAssistPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Screenshot import</h1>
      <p className="text-sm text-foreground/65">
        Paste a screenshot of the <strong>Legendary Crafting Bench</strong> (any star tab) and R.O.L.L. reads which mods you have learned, then you confirm the matches. Reading happens in your browser; nothing is uploaded unless you choose the vision option. (This tool is also called S.C.A.N.)
      </p>
      <ScreenshotAssistClient rows={rows} />
    </div>
  );
}
