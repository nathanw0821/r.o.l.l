"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Check, X, Users, Monitor, Smartphone, Layout, Server, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCharacter, renameCharacter, setActiveCharacter, deleteCharacter, linkCharacterToAccount } from "@/actions/character";
import { createGameAccount, deleteGameAccount, createGameAccountAndLinkCharacter } from "@/actions/game-account";
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
  
  // Linking Logic
  const [linkingCharId, setLinkingCharId] = useState<string | null>(null);
  const [linkingStep, setLinkingStep] = useState<"options" | "create" | "existing" | null>(null);


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

  const handleSelect = async (char: Character) => {
    if (char.id === activeCharacterId) return;
    
    // If character is unlinked, trigger linking flow
    if (!char.gameAccountId) {
      setLinkingCharId(char.id);
      setLinkingStep("options");
      return;
    }

    startTransition(async () => {
      try {
        await setActiveCharacter(char.id);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to select character");
      }
    });
  };

  const handleLinkToExisting = async (gameAccountId: string) => {
    if (!linkingCharId) return;
    startTransition(async () => {
      try {
        await linkCharacterToAccount(linkingCharId, gameAccountId);
        setLinkingCharId(null);
        setLinkingStep(null);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to link character");
      }
    });
  };

  const handleCreateAndLink = async () => {
    if (!linkingCharId || !newAccountName.trim()) return;
    startTransition(async () => {
      try {
        await createGameAccountAndLinkCharacter({ 
          name: newAccountName.trim(), 
          platform: newAccountPlatform,
          characterId: linkingCharId
        });
        setLinkingCharId(null);
        setLinkingStep(null);
        setNewAccountName("");
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create account and link character");
      }
    });
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    startTransition(async () => {
      try {
        await renameCharacter({ id, name: editName.trim() });
        setEditingId(null);
        setEditName("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to rename character");
      }
    });
  };

  const handleDeleteChar = async (char: Character) => {
    const nameConfirm = window.prompt(`To delete this character, type their name exactly: "${char.name}"`);
    if (nameConfirm !== char.name) {
      if (nameConfirm !== null) alert("Name mismatch. Deletion cancelled.");
      return;
    }

    const phraseConfirm = window.prompt('Type "DELETE MY CHARACTER FOREVER" to confirm permanent deletion.');
    if (phraseConfirm !== "DELETE MY CHARACTER FOREVER") {
      if (phraseConfirm !== null) alert("Confirmation phrase mismatch. Deletion cancelled.");
      return;
    }

    startTransition(async () => {
      try {
        await deleteCharacter(char.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete character");
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
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 h-9 text-[10px] uppercase font-bold text-foreground/40 hover:text-accent hover:bg-accent/5 px-3"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Manage Registry</span>
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
                  onChange={(e) => setNewAccountPlatform(e.target.value as "PC" | "XBOX" | "PS")}
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
                    size="sm" 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/40 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 pl-7">
                  {account.characters.map(char => (
                    <div key={char.id} className="group/char relative">
                      {editingId === char.id ? (
                        <div className="flex items-center gap-2 p-1">
                          <Input 
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename(char.id)}
                            className="h-8 text-sm"
                          />
                          <Button size="sm" onClick={() => handleRename(char.id)} className="h-8 px-2"><Check className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 px-2"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelect(char)}
                            className={cn(
                              "flex-1 flex items-center justify-between p-3 rounded-lg border transition-all text-left",
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
                          <div className="flex flex-col gap-1 opacity-0 group-hover/char:opacity-100 transition-opacity pr-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setEditingId(char.id); setEditName(char.name); }}
                              className="h-6 w-6 p-0 text-foreground/40 hover:text-accent"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteChar(char)}
                              className="h-6 w-6 p-0 text-foreground/40 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                    <div key={char.id} className="group/char relative">
                      {editingId === char.id ? (
                        <div className="flex items-center gap-2 p-1">
                          <Input 
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRename(char.id)}
                            className="h-8 text-sm"
                          />
                          <Button size="sm" onClick={() => handleRename(char.id)} className="h-8 px-2"><Check className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 px-2"><X className="h-3 w-3" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSelect(char)}
                            className={cn(
                              "flex-1 flex items-center justify-between p-3 rounded-lg border transition-all text-left border-border/40 bg-panel/30 hover:border-accent/40"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{char.name}</span>
                              <span className="text-[10px] text-foreground/40 italic">Legacy / Unlinked</span>
                            </div>
                          </button>
                          <div className="flex flex-col gap-1 opacity-0 group-hover/char:opacity-100 transition-opacity pr-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setEditingId(char.id); setEditName(char.name); }}
                              className="h-6 w-6 p-0 text-foreground/40 hover:text-accent"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteChar(char)}
                              className="h-6 w-6 p-0 text-foreground/40 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Linking Modal Overlay (Simplified for MVP) */}
        {linkingCharId && (
          <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold tracking-tight">Link Character</h3>
                <p className="text-xs text-foreground/60">
                  &quot;{characters.find(c => c.id === linkingCharId)?.name}&quot; needs to be linked to a game account.
                </p>
              </div>

              {linkingStep === "options" && (
                <div className="grid gap-2">
                  {gameAccounts.length > 0 && (
                    <Button onClick={() => setLinkingStep("existing")} variant="outline" className="h-12 justify-start gap-3">
                      <Users className="h-4 w-4 text-accent" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm">Use Existing Account</span>
                        <span className="text-[10px] opacity-50">Select one of your {gameAccounts.length} accounts</span>
                      </div>
                    </Button>
                  )}
                  <Button onClick={() => setLinkingStep("create")} variant="outline" className="h-12 justify-start gap-3">
                    <Plus className="h-4 w-4 text-accent" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm">Create New Account</span>
                      <span className="text-[10px] opacity-50">Start a fresh account for this character</span>
                    </div>
                  </Button>
                  <Button variant="ghost" onClick={() => { setLinkingCharId(null); setLinkingStep(null); }} className="mt-2 text-xs">
                    Cancel
                  </Button>
                </div>
              )}

              {linkingStep === "existing" && (
                <div className="space-y-4">
                  <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {gameAccounts.map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => handleLinkToExisting(acc.id)}
                        disabled={acc.characters.length >= 5}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border text-left transition-all",
                          acc.characters.length >= 5 ? "opacity-50 cursor-not-allowed grayscale" : "hover:border-accent/40 hover:bg-accent/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded bg-panel">{getPlatformIcon(acc.platform)}</div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{acc.name}</span>
                            <span className="text-[10px] opacity-50">{acc.characters.length}/5 Characters</span>
                          </div>
                        </div>
                        {acc.characters.length >= 5 && <span className="text-[10px] font-bold text-destructive">FULL</span>}
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={() => setLinkingStep("options")} className="w-full text-xs">Back</Button>
                </div>
              )}

              {linkingStep === "create" && (
                <div className="space-y-4 p-4 border border-accent/20 bg-accent/5 rounded-xl">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/40">Account Name</label>
                      <Input 
                        placeholder="e.g. Steam Main" 
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="h-9 bg-panel/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-foreground/40">Platform</label>
                      <select 
                        value={newAccountPlatform}
                        onChange={(e) => setNewAccountPlatform(e.target.value as "PC" | "XBOX" | "PS")}
                        className="w-full h-9 bg-panel/50 border border-input rounded-md px-2 text-xs outline-none"
                      >
                        <option value="PC">PC</option>
                        <option value="XBOX">XBOX</option>
                        <option value="PS">PS</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={handleCreateAndLink} disabled={!newAccountName.trim() || isPending}>
                      Create & Link
                    </Button>
                    <Button variant="ghost" onClick={() => setLinkingStep("options")} className="text-xs">
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="p-4 bg-accent/5 border-t border-border/40 text-[10px] text-center text-foreground/40 font-medium">
          Multi-Platform characters share account achievements but maintain separate loadouts.
        </div>
      </DialogContent>
    </Dialog>
  );
}
