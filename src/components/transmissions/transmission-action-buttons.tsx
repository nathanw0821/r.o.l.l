"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Edit3,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LocalTransmissionRecord } from "@/components/transmissions/transmissions-vault-client";

interface TransmissionActionButtonsProps {
  transmissionId: string;
  slug: string;
  title: string;
  initialIsOwner?: boolean;
}

export default function TransmissionActionButtons({
  transmissionId,
  slug,
  title,
  initialIsOwner = false,
}: TransmissionActionButtonsProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(initialIsOwner);
  const [localToken, setLocalToken] = React.useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("roll_my_transmissions");
      if (raw) {
        const list: LocalTransmissionRecord[] = JSON.parse(raw);
        const match = list.find(
          (item) => item.id === transmissionId || item.slug === slug
        );
        if (match) {
          setIsOwner(true);
          if (match.editToken) {
            setLocalToken(match.editToken);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [transmissionId, slug]);

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/builder/transmissions/${transmissionId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ editToken: localToken }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete transmission");
      }

      // Remove from localStorage
      try {
        const raw = localStorage.getItem("roll_my_transmissions");
        if (raw) {
          const list: LocalTransmissionRecord[] = JSON.parse(raw);
          const updated = list.filter(
            (item) => item.id !== transmissionId && item.slug !== slug
          );
          localStorage.setItem("roll_my_transmissions", JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      setIsDeleteModalOpen(false);
      router.push("/transmissions");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-2">
        {/* Load into Workbench */}
        <Button
          asChild
          size="sm"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
        >
          <Link href={`/build?load=${encodeURIComponent(slug)}`}>
            <Wrench className="h-3.5 w-3.5" />
            <span>Load into Workbench</span>
          </Link>
        </Button>

        {/* Edit in Workbench (if owner) */}
        {isOwner && (
          <Button
            asChild
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5"
          >
            <Link href={`/build?edit=${encodeURIComponent(slug)}`}>
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Transmission</span>
            </Link>
          </Button>
        )}

        {/* Delete Transmission (if owner) */}
        {isOwner && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="border-red-500/40 text-red-400 hover:bg-red-950/40 hover:text-red-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        )}

        {/* Copy Share Link */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className="border-border/40 text-foreground/80 hover:bg-foreground/5 hover:text-foreground font-mono text-xs uppercase transition-all flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </Button>

        {/* Vault Browse Link */}
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="text-foreground/60 hover:text-foreground font-mono text-xs uppercase"
        >
          <Link href="/transmissions">
            <Radio className="h-3.5 w-3.5 mr-1 text-accent" />
            <span>Transmissions Vault</span>
          </Link>
        </Button>
      </div>

      {/* Deletion Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="border-red-500/40 bg-slate-950 font-mono text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400 text-lg uppercase tracking-wider">
              <AlertTriangle className="h-5 w-5" />
              Decommission Transmission
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-2 space-y-2">
              <p>
                Are you sure you want to delete <strong className="text-white">&ldquo;{title}&rdquo;</strong>?
              </p>
              <p className="text-red-300/80">
                This action will permanently purge this loadout from the public transmissions vault and cannot be undone.
              </p>
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="rounded border border-red-500/60 bg-red-950/80 px-3 py-2 text-xs text-red-300 font-bold">
              &gt;&gt; ERROR: {deleteError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="text-slate-400 hover:text-white text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              {isDeleting ? "DECOMMISSIONING..." : "CONFIRM DELETION"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
