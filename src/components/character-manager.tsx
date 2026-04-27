"use client";

import { useState, useTransition } from "react";
import { User, Plus, Edit2, Trash2, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCharacter, renameCharacter, setActiveCharacter, deleteCharacter } from "@/actions/character";

type Character = {
  id: string;
  name: string;
  createdAt: Date;
};

export function CharacterManager({
  characters,
  activeCharacterId
}: {
  characters: Character[];
  activeCharacterId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const activeCharacter = characters.find(c => c.id === activeCharacterId) || characters[0];

  const handleCreate = async () => {
    if (!newName.trim() || newName.length > 30) return;
    startTransition(async () => {
      try {
        await createCharacter({ name: newName.trim() });
        setIsCreating(false);
        setNewName("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create character");
      }
    });
  };

  const handleRename = async (id: string) => {
    if (!editName.trim() || editName.length > 30) return;
    startTransition(async () => {
      try {
        await renameCharacter({ id, name: editName.trim() });
        setEditingId(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to rename character");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this character? All progress for this character will be lost forever.")) return;
    startTransition(async () => {
      try {
        await deleteCharacter(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete character");
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

  if (!characters.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{activeCharacter?.name ?? "Select Character"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Manage Characters
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  char.id === activeCharacterId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                {editingId === char.id ? (
                  <div className="flex flex-1 items-center gap-2 mr-2">
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(char.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-8"
                      disabled={isPending}
                    />
                    <Button variant="ghost" className="h-8 w-8 text-green-500 p-0" onClick={() => handleRename(char.id)} disabled={isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)} disabled={isPending}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex-1 cursor-pointer truncate font-medium flex items-center gap-2"
                    onClick={() => handleSelect(char.id)}
                  >
                    {char.name}
                    {char.id === activeCharacterId && <Badge variant="default" className="text-[10px] px-1.5 py-0">Active</Badge>}
                  </div>
                )}

                {editingId !== char.id && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground p-0"
                      onClick={() => {
                        setEditName(char.name);
                        setEditingId(char.id);
                      }}
                      disabled={isPending}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive p-0"
                      onClick={() => handleDelete(char.id)}
                      disabled={isPending || characters.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {characters.length < 5 && !isCreating && (
            <Button
              variant="outline"
              className="w-full border-dashed gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsCreating(true)}
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
              Create New Character ({characters.length}/5)
            </Button>
          )}

          {isCreating && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/50">
              <Input
                autoFocus
                placeholder="Character Name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                className="h-8 bg-background"
                disabled={isPending}
              />
              <Button variant="ghost" className="h-8 w-8 text-green-500 p-0" onClick={handleCreate} disabled={isPending}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsCreating(false)} disabled={isPending}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {characters.length >= 5 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Maximum character limit reached.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Badge component since it might not be exported perfectly if imported from ui/badge in a specific way
function Badge({ children, className, variant = "default" }: any) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
      variant === "default" ? "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80" : ""
    } ${className}`}>
      {children}
    </span>
  );
}
