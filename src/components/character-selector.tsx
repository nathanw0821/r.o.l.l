"use client";

import * as React from "react";
import { User, ChevronDown, Monitor, Smartphone, Layout, Server, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterManager } from "@/components/character-manager";
import { setActiveCharacter } from "@/actions/character";
import { emitAchievementUnlocked } from "@/lib/achievement-events";

type GameAccount = {
  id: string;
  name: string;
  platform: string;
  characters: Character[];
};

type Character = {
  id: string;
  name: string;
  gameAccountId: string | null;
  createdAt: Date;
};

export function CharacterSelector({ 
  collapsed = false 
}: { 
  collapsed?: boolean 
}) {
  const [data, setData] = React.useState<{
    characters: Character[];
    gameAccounts: GameAccount[];
    activeCharacterId: string | null;
  } | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/character-selection");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch characters", err);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCharacter = data?.characters.find(c => c.id === data.activeCharacterId);

  const handleSelect = async (charId: string) => {
    if (charId === data?.activeCharacterId) return;
    
    startTransition(async () => {
      try {
        const result = await setActiveCharacter(charId);
        if (result?.achievements) {
          result.achievements.forEach(emitAchievementUnlocked);
        }
        await fetchData();
        setIsExpanded(false);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to switch character");
      }
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "PC": return <Monitor className="h-3 w-3" />;
      case "XBOX": return <Layout className="h-3 w-3" />;
      case "PS": return <Smartphone className="h-3 w-3" />;
      default: return <Server className="h-3 w-3" />;
    }
  };

  if (!data) return null;

  return (
    <div className={cn("flex flex-col gap-1 w-full px-2", collapsed && "items-center px-0")}>
      <div className="text-[9px] uppercase tracking-widest font-bold text-foreground/30 px-2 mb-1">
        {!collapsed && "Active Character"}
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-border/40 bg-panel/30 p-2 text-left transition-all hover:border-accent/40 hover:bg-panel/50",
            isExpanded && "border-accent/40 bg-panel/50",
            collapsed && "justify-center p-2.5"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <User className="h-4 w-4" />
          </div>
          
          {!collapsed && (
            <>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="truncate text-xs font-bold text-foreground/80">
                  {activeCharacter?.name ?? "Guest User"}
                </span>
                <span className="truncate text-[10px] text-foreground/40 uppercase tracking-tight">
                  {data.gameAccounts.find(a => a.id === activeCharacter?.gameAccountId)?.name ?? "Unlinked"}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-foreground/20 transition-transform", isExpanded && "rotate-180")} />
            </>
          )}
        </button>

        {isExpanded && !collapsed && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[320px] overflow-auto rounded-xl border border-border bg-panel p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
            {data.gameAccounts.map(account => (
              <div key={account.id} className="mb-2 last:mb-0">
                <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-foreground/30 bg-foreground/5 rounded-md mb-1">
                  {getPlatformIcon(account.platform)}
                  <span>{account.name}</span>
                </div>
                <div className="space-y-0.5">
                  {account.characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => handleSelect(char.id)}
                      disabled={isPending}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-all",
                        char.id === data.activeCharacterId 
                          ? "bg-accent/10 text-accent" 
                          : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                      )}
                    >
                      <span className="truncate text-xs font-medium">{char.name}</span>
                      {char.id === data.activeCharacterId && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-1 border-t border-border/40 pt-1">
              <CharacterManager 
                characters={data.characters} 
                gameAccounts={data.gameAccounts} 
                activeCharacterId={data.activeCharacterId ?? undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
