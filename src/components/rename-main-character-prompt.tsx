"use client";

import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renameCharacter } from "@/actions/character";
import { Sparkles, Check } from "lucide-react";

export function RenameMainCharacterPrompt({
  characterId: initialCharacterId
}: {
  characterId?: string | null;
}) {
  const [characterId, setCharacterId] = useState<string | null>(initialCharacterId || null);
  const [isOpen, setIsOpen] = useState(Boolean(initialCharacterId));
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  // Asynchronously verify if a legacy "Main Character" exists without blocking layout SSR
  useEffect(() => {
    if (typeof window === "undefined" || initialCharacterId) return;
    let active = true;
    fetch("/api/character-selection")
      .then((res) => res.json() as Promise<{ success?: boolean; data?: { characters?: Array<{ id: string; name: string }> } }>)
      .then((res) => {
        if (!active || !res?.success || !Array.isArray(res?.data?.characters)) return;
        const main = res.data.characters.find((c) => c.name === "Main Character");
        if (main) {
          setCharacterId(main.id);
          setIsOpen(true);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [initialCharacterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length > 30 || !characterId) return;
    
    startTransition(async () => {
      try {
        await renameCharacter({ id: characterId, name: name.trim() });
        setIsOpen(false);
        window.location.reload();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to rename character");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Force user to rename before closing
      if (!open && isOpen) return;
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            New Feature: Multiple Characters!
          </DialogTitle>
          <DialogDescription>
            You can now make up to 5 characters per game account! To get started, please name your original saved character containing all your prior tracked data.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="characterName" className="text-sm font-medium">
              Character Name?
            </label>
            <Input
              id="characterName"
              placeholder="e.g. Heavy Gunner, Commando..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
              maxLength={30}
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isPending || !name.trim()}>
            <Check className="h-4 w-4" />
            Save Name
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
