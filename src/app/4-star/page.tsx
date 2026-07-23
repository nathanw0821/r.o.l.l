import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEffectTiersByTierLabel } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { formatTierStars } from "@/lib/tier-format";

const tierLabel = "4 Star";

export default async function TierFourPage() {
  const session = await getServerSession(authOptions);
  const rows = await getEffectTiersByTierLabel(tierLabel, session?.user?.id);

  return (
    <EffectTable
      rows={rows}
      canEdit={Boolean(session)}
      title={`${formatTierStars(tierLabel)} 4-Star Legendaries`}
      description="Browse all 4-Star Legendaries."
    />
  );
}
