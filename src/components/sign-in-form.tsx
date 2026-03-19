"use client";

import * as React from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInForm({
  allowPublicRegistration = false
}: {
  allowPublicRegistration?: boolean;
}) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [providers, setProviders] = React.useState<Record<string, { id: string; name: string }> | null>(null);

  React.useEffect(() => {
    getProviders()
      .then((result) => setProviders(result ?? {}))
      .catch(() => setProviders({}));
  }, []);

  function handleAutofillAnimation(event: React.AnimationEvent<HTMLInputElement>) {
    if (event.animationName === "autofill-start") {
      setIsAutofilled(true);
    }
    if (event.animationName === "autofill-cancel") {
      setIsAutofilled(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      username,
      password,
      callbackUrl: "/",
      redirect: false
    });

    if (result?.error) {
      setError(
        allowPublicRegistration
          ? "Unable to sign in with that username and password."
          : "Unable to sign in. Check your credentials or ask an admin to provision local access."
      );
      setPending(false);
      return;
    }

    window.location.assign(result?.url ?? "/");
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
          <div className="text-center text-xs text-foreground/50">or sign in with a local username</div>
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span>Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder="Enter your username"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span>Password</span>
        <div className="flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onAnimationStart={handleAutofillAnimation}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="autofill-detect w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
          />
          {isAutofilled ? (
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-[var(--radius)] border border-border px-3 py-2 text-xs text-foreground/70 hover:border-accent"
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Reveal"}
            </button>
          ) : null}
        </div>
        {!isAutofilled ? (
          <span className="text-xs text-foreground/50">
            Reveal is available only for browser-saved passwords.
          </span>
        ) : null}
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : allowPublicRegistration ? "Sign In / Create Account" : "Sign In"}
      </Button>
      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </form>
  );
}
