"use client";

import * as React from "react";
import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInForm({
  allowPublicRegistration = false,
  googleOAuthConfigured,
  oauthCallbackBase = null
}: {
  allowPublicRegistration?: boolean;
  googleOAuthConfigured: boolean;
  oauthCallbackBase?: string | null;
}) {
  const [identifier, setIdentifier] = React.useState("");
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
    if (!identifier.trim() || !password.trim()) return;

    setPending(true);
    setError(null);

    const result = await signIn("credentials", {
      identifier,
      password,
      callbackUrl: "/",
      redirect: false
    });

    if (result?.error) {
      const hint =
        " Use the email link below to create or reset a password for the address on your account, then try again with email + password.";
      setError(
        (allowPublicRegistration
          ? "Unable to sign in with that username and password."
          : "Unable to sign in. Check your credentials or ask an admin to provision local access.") + hint
      );
      setPending(false);
      return;
    }

    window.location.assign(result?.url ?? "/");
  }

  const googleCallbackExample = oauthCallbackBase
    ? `${oauthCallbackBase}/api/auth/callback/google`
    : "https://your-site.example/api/auth/callback/google";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        role="region"
        aria-label="Sign-in without Google"
        className="rounded-[var(--radius)] border border-border bg-panel/80 p-3 text-xs leading-relaxed text-foreground/70"
      >
        <p className="font-medium text-foreground/85">Primary account (username or email + password)</p>
        <p className="mt-2">
          If you already chose a password, sign in below. This path does not depend on Google or other OAuth servers.
        </p>
        <p className="mt-2">
          <span className="font-medium text-foreground/85">No password yet</span> (for example you only used Google):{" "}
          <Link href="/auth/forgot-password" className="text-accent underline-offset-2 hover:underline">
            Set password via email
          </Link>
          . Enter the <span className="font-medium text-foreground/80">email on your R.O.L.L account</span>. You will get
          a secure link (same as password reset) to create a password in the browser, then return here and sign in with{" "}
          <span className="font-medium text-foreground/80">email + password</span>.
        </p>
      </div>
      {!googleOAuthConfigured ? (
        <details className="rounded-[var(--radius)] border border-dashed border-border/80 bg-panel/40 p-3 text-xs leading-relaxed text-foreground/55">
          <summary className="cursor-pointer font-medium text-foreground/70">Hosting: enable Google sign-in</summary>
          <p className="mt-2">
            Add <code className="text-foreground/75">GOOGLE_CLIENT_ID</code> and{" "}
            <code className="text-foreground/75">GOOGLE_CLIENT_SECRET</code> to the deployment environment (for
            example Vercel → Project → Settings → Environment Variables). In{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              className="text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Google Cloud Console
            </a>
            , create an OAuth 2.0 Client ID (Web application) and set the authorized redirect URI to:
          </p>
          <p className="mt-2 break-all font-mono text-[11px] text-foreground/75">{googleCallbackExample}</p>
          {!oauthCallbackBase ? (
            <p className="mt-2">
              Replace the host with your real <code className="text-foreground/65">NEXTAUTH_URL</code> / production
              domain. Preview deploys need that preview URL listed as an additional redirect URI.
            </p>
          ) : null}
        </details>
      ) : (
        <p className="text-xs text-foreground/55">
          If Google or another provider is slow or unavailable, use the password fields below or{" "}
          <Link href="/auth/forgot-password" className="text-accent underline-offset-2 hover:underline">
            set password via email
          </Link>
          .
        </p>
      )}
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
          <div className="text-center text-xs text-foreground/50">or sign in with local credentials</div>
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        <span>Username or Email</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          placeholder="Enter your username or email"
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
        {pending ? "Signing in..." : "Sign In"}
      </Button>
      <div className="text-center text-xs text-foreground/60">
        <Link href="/auth/forgot-password" className="text-accent hover:underline">
          Forgot password, or email a secure link to set one
        </Link>
      </div>
      {allowPublicRegistration ? (
        <div className="text-center text-xs text-foreground/60">
          Need an account?{" "}
          <a href="/auth/sign-up" className="text-accent hover:underline">
            Sign up
          </a>
        </div>
      ) : null}
      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </form>
  );
}
