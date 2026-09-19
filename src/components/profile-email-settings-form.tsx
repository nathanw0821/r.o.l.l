"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type ApiPayload = {
  data?: { email?: string; verificationSent?: boolean; signedOut?: boolean; delivered?: boolean; alreadyVerified?: boolean };
  error?: { message?: string };
} | null;

export default function ProfileEmailSettingsForm({
  initialEmail,
  emailVerified = false,
  hasPassword = false
}: {
  initialEmail: string | null | undefined;
  emailVerified?: boolean;
  hasPassword?: boolean;
}) {
  const [email, setEmail] = React.useState(initialEmail ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const changed = email.trim().toLowerCase() !== (initialEmail ?? "").trim().toLowerCase();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/profile/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, currentPassword: hasPassword ? currentPassword : undefined })
    });
    const payload = (await response.json().catch(() => null)) as ApiPayload;

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to update email.");
      setPending(false);
      return;
    }

    if (payload?.data?.signedOut) {
      // Changing the email ends every session, this one included.
      await signOut({ callbackUrl: "/auth/sign-in?notice=email-changed" });
      return;
    }
    setMessage("Email unchanged.");
    setPending(false);
  }

  async function resendVerification() {
    setResending(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/profile/email/verify", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as ApiPayload;
    if (!response.ok) setError(payload?.error?.message ?? "Could not send the verification email.");
    else if (payload?.data?.alreadyVerified) setMessage("Your email is already verified.");
    else setMessage("Verification link sent. Check your inbox (and spam folder).");
    setResending(false);
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
          autoCapitalize="none"
          spellCheck={false}
          placeholder="user@example.com"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      {initialEmail ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {emailVerified ? (
            <span className="text-foreground/70">Verified</span>
          ) : (
            <>
              <span className="text-[color:var(--color-warning)]">Not verified</span>
              <Button type="button" variant="outline" size="sm" onClick={resendVerification} disabled={resending}>
                {resending ? "Sending..." : "Send verification link"}
              </Button>
            </>
          )}
        </div>
      ) : null}
      {hasPassword && changed ? (
        <label className="flex flex-col gap-2 text-sm">
          <span>Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
          />
        </label>
      ) : null}
      <p className="text-xs text-foreground/60">
        Used for sign-in recovery and account notices. Verify it before linking Google or Discord. Changing it signs
        you out on every device and sends a new verification link.
      </p>
      <Button type="submit" disabled={pending || !changed}>
        {pending ? "Saving..." : "Save Email"}
      </Button>
      {message ? <p className="text-xs text-foreground/70">{message}</p> : null}
      {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </form>
  );
}
