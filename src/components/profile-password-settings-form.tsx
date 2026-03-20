"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ProfilePasswordSettingsForm({
  hasPassword
}: {
  hasPassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [nextPassword, setNextPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    if (nextPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      setPending(false);
      return;
    }

    const response = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: currentPassword || undefined,
        newPassword: nextPassword
      })
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to update password.");
      setPending(false);
      return;
    }

    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setMessage(hasPassword ? "Password updated." : "Password created.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {hasPassword ? (
        <label className="flex flex-col gap-2 text-sm">
          <span>Current Password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span>{hasPassword ? "New Password" : "Set Password"}</span>
        <input
          type="password"
          value={nextPassword}
          onChange={(event) => setNextPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Confirm Password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-foreground/60">
        Use a long unique password. OAuth users can set one here for direct sign-in.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : hasPassword ? "Update Password" : "Create Password"}
      </Button>
      {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </form>
  );
}
