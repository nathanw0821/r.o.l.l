import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import SummaryClient from "@/components/summary-client";

export default async function SummaryPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);
  return <SummaryClient rows={rows} />;
}
