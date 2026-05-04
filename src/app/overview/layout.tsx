import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PageHeader from "@/components/page-header";
import OverviewTabs from "@/components/overview-tabs";
import { getUserCharacters, getActiveCharacterId, getUserGameAccounts } from "@/lib/character";
import { CharacterManager } from "@/components/character-manager";

export default async function OverviewLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  let characters: any[] = [];
  let gameAccounts: any[] = [];
  let activeCharacterId: string | undefined = undefined;

  if (session?.user?.id) {
    characters = await getUserCharacters(session.user.id);
    gameAccounts = await getUserGameAccounts(session.user.id);
    activeCharacterId = await getActiveCharacterId(session.user.id);
  }

  return (
    <div className="overview-shell max-w-6xl mx-auto">
      <div className="mb-6">
        <PageHeader title="Overview" description="Account profile, achievements, and in-app readme.">
          {session?.user?.id && (characters.length > 0 || gameAccounts.length > 0) && (
            <CharacterManager 
              characters={characters} 
              gameAccounts={gameAccounts} 
              activeCharacterId={activeCharacterId} 
            />
          )}
        </PageHeader>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <OverviewTabs />
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
