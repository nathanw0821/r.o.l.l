"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ResetPasswordResponse =
  | { success: true; data: { reset: true } }
  | { success: false; error?: { message?: string } };

function getResetErrorMessage(payload: ResetPasswordResponse | null) {
  if (!payload || payload.success) return "Unable to reset password.";
  return payload.error?.message ?? "Unable to reset password.";
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password.trim()) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const payload = (await response.json().catch(() => null)) as ResetPasswordResponse | null;

    if (!response.ok || !payload?.success) {
      setError(getResetErrorMessage(payload));
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
  }

  if (!token) {
    return <p className="text-sm text-foreground/70">Missing reset token.</p>;
  }

  if (done) {
    return (
      <div className="space-y-3 rounded-[var(--radius)] border border-border bg-panel px-4 py-3">
        <p className="text-sm text-foreground/70">Password reset complete. You can sign in now.</p>
        <Link href="/auth/sign-in" className="text-sm text-accent hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>New Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          placeholder="Repeat password"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Resetting..." : "Reset Password"}
      </Button>
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </form>
  );
}
