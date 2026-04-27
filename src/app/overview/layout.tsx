import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/page-header";
import OverviewTabs from "@/components/overview-tabs";
import { getUserCharacters, getActiveCharacterId } from "@/lib/character";
import { CharacterManager } from "@/components/character-manager";

export default async function OverviewLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let characters: any[] = [];
  let activeCharacterId: string | undefined = undefined;

  if (session?.user?.id) {
    characters = await getUserCharacters(session.user.id);
    activeCharacterId = await getActiveCharacterId(session.user.id);
  }

  return (
    <div className="overview-shell">
      <div className="mb-6">
        <PageHeader title="Overview" description="Account profile, achievements, and in-app readme.">
          {session?.user?.id && characters.length > 0 && (
            <CharacterManager characters={characters} activeCharacterId={activeCharacterId} />
          )}
        </PageHeader>
      </div>
      <OverviewTabs />
      {children}
    </div>
  );
}
