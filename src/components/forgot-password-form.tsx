"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ForgotPasswordResponse =
  | { success: true; data: { accepted: true; delivered: boolean; resetUrl: string | null } }
  | { success: false; error?: { message?: string } };

function getForgotPasswordErrorMessage(payload: ForgotPasswordResponse | null) {
  if (!payload || payload.success) return "Unable to request reset.";
  return payload.error?.message ?? "Unable to request reset.";
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ delivered: boolean; resetUrl: string | null } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email })
    });
    const payload = (await response.json().catch(() => null)) as ForgotPasswordResponse | null;

    if (!response.ok || !payload?.success) {
      setError(getForgotPasswordErrorMessage(payload));
      setPending(false);
      return;
    }

    setResult({ delivered: payload.data.delivered, resetUrl: payload.data.resetUrl });
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send secure link"}
      </Button>
      {result ? (
        <div className="space-y-2 rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
          <p>If an account exists for that email, we sent a link to set or reset the password.</p>
          {!result.delivered && result.resetUrl ? (
            <p>
              Email was not sent from this environment; open the link directly:{" "}
              <a href={result.resetUrl} className="text-accent hover:underline">
                set password
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
      <p className="text-center text-xs text-foreground/60">
        <Link href="/auth/sign-in" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
