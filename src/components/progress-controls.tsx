"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { resetToImportedProfile, resetToPublicDefaults } from "@/actions/progress";
import { Button } from "@/components/ui/button";

export default function ProgressControls({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<"imported" | "default" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleReset(kind: "imported" | "default") {
    if (!enabled) return;
    setPending(kind);
    setError(null);
    setMessage(null);
    try {
      if (kind === "imported") {
        await resetToImportedProfile();
        setMessage("Profile reset to imported selections.");
      } else {
        await resetToPublicDefaults();
        setMessage("Profile reset to public defaults.");
      }
      router.refresh();
    } catch {
      setError("Reset failed. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={!enabled || pending !== null}
          onClick={() => handleReset("imported")}
        >
          {pending === "imported" ? "Resetting..." : "Reset to Imported Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!enabled || pending !== null}
          onClick={() => handleReset("default")}
        >
          {pending === "default" ? "Resetting..." : "Reset to Public Defaults"}
        </Button>
      </div>
      {!enabled ? (
        <div className="text-xs text-foreground/60">Sign in to reset your progress.</div>
      ) : null}
      {message ? <div className="text-xs text-emerald-300">{message}</div> : null}
      {error ? <div className="text-xs text-amber-300">{error}</div> : null}
    </div>
  );
}
