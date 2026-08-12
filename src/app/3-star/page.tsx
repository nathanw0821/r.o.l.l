import { getAppSession } from "@/lib/auth";
import { getEffectTiersByTierLabel } from "@/lib/data";
import EffectTable from "@/components/effect-table";
import { formatTierStars } from "@/lib/tier-format";

const tierLabel = "3 Star";

export default async function TierThreePage() {
  const session = await getAppSession();
  const rows = await getEffectTiersByTierLabel(tierLabel, session?.user?.id);

  return (
    <EffectTable
      rows={rows}
      canEdit={Boolean(session)}
      title={`${formatTierStars(tierLabel)} 3-Star Legendaries`}
      description="Browse all 3-Star Legendaries."
    />
  );
}
