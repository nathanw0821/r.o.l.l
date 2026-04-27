"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { renameCharacter } from "@/actions/character";
import { Sparkles, Check } from "lucide-react";

export function RenameMainCharacterPrompt({
  characterId
}: {
  characterId: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.length > 30) return;
    
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
            You can now make up to 5 multiple characters! To get started, please name your original saved character containing all your prior tracked data.
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
