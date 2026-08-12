import { getAppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PerkBuilder from "@/components/perks/perk-builder";

export const metadata = {
  title: "P.E.R.K. Loadout Manager | R.O.L.L.",
  description: "Fallout 76 Perk Equipment & Reconfiguration Kit (P.E.R.K.) with 6 Punch Card Machine loadout slots per character."
};

export default async function PerksPage() {
  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Session fallback
  }

  let activeCharacterId: string | null = null;
  let activeCharacterName: string | null = null;

  if (session?.user?.id) {
    try {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
        include: { activeCharacter: true }
      });
      if (userSettings?.activeCharacter) {
        activeCharacterId = userSettings.activeCharacter.id;
        activeCharacterName = userSettings.activeCharacter.name;
      }
    } catch {
      // Database fallback
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PerkBuilder characterId={activeCharacterId} characterName={activeCharacterName} />
    </div>
  );
}
