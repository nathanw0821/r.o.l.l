import { useState, useTransition } from "react";
import { User, Plus, Edit2, Trash2, Check, X, Users, Monitor, Smartphone, Layout, Globe, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCharacter, renameCharacter, setActiveCharacter, deleteCharacter } from "@/actions/character";
import { createGameAccount, deleteGameAccount } from "@/actions/game-account";
import { cn } from "@/lib/utils";

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

export function CharacterManager({
  characters,
  gameAccounts,
  activeCharacterId
}: {
  characters: Character[];
  gameAccounts: GameAccount[];
  activeCharacterId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  // Character Creation
  const [isCreatingChar, setIsCreatingChar] = useState<string | null>(null); // accountId or "orphan"
  const [newCharName, setNewCharName] = useState("");

  // Account Creation
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPlatform, setNewAccountPlatform] = useState<"PC" | "XBOX" | "PS">("PC");

  const activeCharacter = characters.find(c => c.id === activeCharacterId);

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) return;
    startTransition(async () => {
      try {
        await createGameAccount({ name: newAccountName.trim(), platform: newAccountPlatform });
        setIsCreatingAccount(false);
        setNewAccountName("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create account");
      }
    });
  };

  const handleCreateChar = async (gameAccountId?: string) => {
    if (!newCharName.trim()) return;
    startTransition(async () => {
      try {
        await createCharacter({ name: newCharName.trim(), gameAccountId });
        setIsCreatingChar(null);
        setNewCharName("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create character");
      }
    });
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm("Delete this account and ALL its characters? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteGameAccount(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete account");
      }
    });
  };

  const handleSelect = async (id: string) => {
    if (id === activeCharacterId) return;
    startTransition(async () => {
      try {
        await setActiveCharacter(id);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to select character");
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-panel/50 border-border/50 hover:bg-panel hover:border-accent/30 transition-all">
          <User className="h-4 w-4 text-accent" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-wider text-foreground/40 font-bold">Character</span>
            <span className="max-w-[120px] truncate text-xs font-medium">{activeCharacter?.name ?? "Select Character"}</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-panel border-border shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl tracking-tight">
            <Users className="h-5 w-5 text-accent" />
            Character Registry
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-0 max-h-[70vh] overflow-y-auto p-6 pt-4 custom-scrollbar">
          {/* Account Creation Toggle */}
          {!isCreatingAccount ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsCreatingAccount(true)}
              className="mb-4 h-8 gap-1.5 text-[10px] uppercase tracking-[0.15em] font-bold text-foreground/40 hover:text-accent hover:bg-accent/5"
            >
              <Plus className="h-3 w-3" /> Add Game Account
            </Button>
          ) : (
            <div className="mb-6 p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Account Name (e.g. Main PC)" 
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="h-9 bg-panel/50"
                />
                <select 
                  value={newAccountPlatform}
                  onChange={(e) => setNewAccountPlatform(e.target.value as any)}
                  className="h-9 bg-panel/50 border border-input rounded-md px-2 text-xs outline-none"
                >
                  <option value="PC">PC</option>
                  <option value="XBOX">XBOX</option>
                  <option value="PS">PS</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCreatingAccount(false)} className="h-8">Cancel</Button>
                <Button size="sm" onClick={handleCreateAccount} disabled={!newAccountName.trim() || isPending} className="h-8">Create Account</Button>
              </div>
            </div>
          )}

          {/* Render Accounts & Grouped Characters */}
          <div className="space-y-6">
            {gameAccounts.map(account => (
              <div key={account.id} className="space-y-3">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-accent">
                      {getPlatformIcon(account.platform)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">{account.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/40 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 pl-7">
                  {account.characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => handleSelect(char.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                        char.id === activeCharacterId 
                          ? "border-accent bg-accent/10 ring-1 ring-accent/20" 
                          : "border-border/40 bg-panel/30 hover:border-accent/40 hover:bg-panel/50"
                      )}
                    >
                      <span className={cn("text-sm font-medium", char.id === activeCharacterId ? "text-accent" : "text-foreground/80")}>
                        {char.name}
                      </span>
                      {char.id === activeCharacterId && <Check className="h-4 w-4 text-accent" />}
                    </button>
                  ))}
                  
                  {account.characters.length < 5 && isCreatingChar !== account.id && (
                    <button 
                      onClick={() => setIsCreatingChar(account.id)}
                      className="flex items-center gap-2 p-2.5 text-[10px] uppercase font-bold text-foreground/30 hover:text-accent/60 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> New Character
                    </button>
                  )}

                  {isCreatingChar === account.id && (
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        autoFocus
                        placeholder="Character Name..."
                        value={newCharName}
                        onChange={(e) => setNewCharName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateChar(account.id)}
                        className="h-8 text-xs bg-panel/50"
                      />
                      <Button size="sm" onClick={() => handleCreateChar(account.id)} className="h-8 px-3">Add</Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsCreatingChar(null)} className="h-8 p-1"><X className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Orphaned Characters (if any) */}
            {characters.filter(c => !c.gameAccountId).length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/40">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">Unlinked Characters</div>
                <div className="grid grid-cols-1 gap-2 pl-7">
                  {characters.filter(c => !c.gameAccountId).map(char => (
                    <button
                      key={char.id}
                      onClick={() => handleSelect(char.id)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                        char.id === activeCharacterId ? "border-accent bg-accent/10" : "border-border/40 bg-panel/30"
                      )}
                    >
                      <span className="text-sm font-medium">{char.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-accent/5 border-t border-border/40 text-[10px] text-center text-foreground/40 font-medium">
          Multi-Platform characters share account achievements but maintain separate loadouts.
        </div>
      </DialogContent>
    </Dialog>
  );
}
