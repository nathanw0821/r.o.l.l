"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { unlinkAccount } from "@/actions/accounts";

const providerLabels: Record<string, string> = {
  google: "Google / YouTube",
  discord: "Discord",
  twitch: "Twitch",
  reddit: "Reddit",
  "azure-ad": "Microsoft / Xbox",
  credentials: "Local Username"
};

export default function AccountLinks() {
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/account-links`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success) setAccounts(payload.data.providers ?? []);
      })
      .catch(() => {});
  }, []);

  async function handleUnlink(provider: string) {
    setPendingProvider(provider);
    setError(null);
    try {
      await unlinkAccount({ provider });
      setAccounts((current) => current.filter((item) => item !== provider));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unlink.");
    } finally {
      setPendingProvider(null);
    }
  }

  const availableOauthProviders = [
    { id: "google", name: "Google / YouTube" },
    { id: "discord", name: "Discord" }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-xs font-medium text-foreground/60">Linked Accounts</div>
        {accounts.length === 0 ? (
          <div className="text-xs text-foreground/50">No external accounts linked yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {accounts.map((provider) => (
              <div key={provider} className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs">
                <span>{providerLabels[provider] ?? provider}</span>
                <button
                  type="button"
                  onClick={() => handleUnlink(provider)}
                  disabled={pendingProvider === provider}
                  className="ml-1 text-[0.75rem] text-foreground/50 hover:text-foreground hover:underline"
                >
                  {pendingProvider === provider ? "..." : "Unlink"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-foreground/60">Connect Another Provider</div>
        <div className="flex flex-wrap gap-2">
          {availableOauthProviders.map((provider) => {
            const isLinked = accounts.includes(provider.id);
            return (
              <Button
                key={provider.id}
                size="sm"
                variant={isLinked ? "ghost" : "outline"}
                onClick={() => !isLinked && signIn(provider.id)}
                disabled={isLinked}
                className={isLinked ? "opacity-60 cursor-default" : "hover:border-accent hover:text-accent"}
              >
                {isLinked ? `✓ ${provider.name} Linked` : `Connect ${provider.name}`}
              </Button>
            );
          })}
        </div>
      </div>

      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </div>
  );
}
