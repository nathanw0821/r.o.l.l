"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function ProfileEmailSettingsForm({
  initialEmail
}: {
  initialEmail: string | null | undefined;
}) {
  const [email, setEmail] = React.useState(initialEmail ?? "");
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/profile/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to update email.");
      setPending(false);
      return;
    }

    setEmail((payload?.data?.email as string | undefined) ?? email.trim().toLowerCase());
    setMessage("Email updated.");
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="flex flex-col gap-2 text-sm">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="user@example.com"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs text-foreground/60">Used for sign-in recovery and account notices.</p>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Email"}
      </Button>
      {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </form>
  );
}
