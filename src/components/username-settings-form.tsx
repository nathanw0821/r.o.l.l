"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function UsernameSettingsForm({
  initialUsername
}: {
  initialUsername: string | null | undefined;
}) {
  const [username, setUsername] = React.useState(initialUsername ?? "");
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/profile/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username })
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to update username.");
      setPending(false);
      return;
    }

    const nextUsername = payload?.data?.username as string | undefined;
    if (nextUsername) {
      setUsername(nextUsername);
    }
    setMessage("Username updated.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="flex flex-col gap-2 text-sm">
        <span>Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="username"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-foreground/60">Use letters, numbers, dots, underscores, and dashes.</p>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Username"}
      </Button>
      {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </form>
  );
}
