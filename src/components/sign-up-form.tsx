"use client";

import * as React from "react";
import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

type SignUpResponse =
  | {
      success: true;
      data: {
        email: string;
        delivered: boolean;
        verificationUrl: string | null;
      };
    }
  | {
      success: false;
      error?: {
        message?: string;
      };
    };

function getErrorMessage(payload: SignUpResponse | null) {
  if (!payload || payload.success) {
    return "Unable to create your account right now.";
  }

  return payload.error?.message ?? "Unable to create your account right now.";
}

export default function SignUpForm() {
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }> | null>(null);
  const [success, setSuccess] = React.useState<{
    email: string;
    delivered: boolean;
    verificationUrl: string | null;
  } | null>(null);

  React.useEffect(() => {
    getProviders()
      .then((result) => setProviders(result ?? {}))
      .catch(() => setProviders({}));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !username.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    setError(null);

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        username,
        password
      })
    });

    const payload = (await response.json().catch(() => null)) as SignUpResponse | null;

    if (!response.ok || !payload?.success) {
      setError(getErrorMessage(payload));
      setPending(false);
      return;
    }

    setSuccess(payload.data);
    setPending(false);
  }

  if (success) {
    return (
      <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-panel/70 p-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Account created</h2>
          <p className="text-sm text-foreground/70">
            Your account for <span className="font-medium text-foreground">{success.email}</span> is ready.
          </p>
          <p className="text-sm text-foreground/70">
            {success.delivered
              ? "A verification link has been queued for email delivery."
              : "Use the verification link below to finish activating your account."}
          </p>
        </div>
        {success.verificationUrl ? (
          <Button asChild className="w-full">
            <a href={success.verificationUrl}>Verify Email</a>
          </Button>
        ) : null}
        <div className="text-center text-xs text-foreground/60">
          <Link href="/auth/sign-in" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {providers ? (
        <div className="space-y-2">
          {[
            { id: "google", label: "Continue with Google / YouTube" },
            { id: "twitch", label: "Continue with Twitch" },
            { id: "discord", label: "Continue with Discord" },
            { id: "reddit", label: "Continue with Reddit" },
            { id: "azure-ad", label: "Continue with Microsoft / Xbox" }
          ]
            .filter((provider) => providers[provider.id])
            .map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                {provider.label}
              </Button>
            ))}
          <div className="text-center text-xs text-foreground/50">or continue with email and password</div>
        </div>
      ) : null}
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
      <label className="flex flex-col gap-2 text-sm">
        <span>Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder="Choose a username"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Create a password"
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
          placeholder="Repeat your password"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Create Account"}
      </Button>
      <div className="text-center text-xs text-foreground/60">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
      </div>
      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </form>
  );
}
