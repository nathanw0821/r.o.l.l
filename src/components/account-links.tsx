"use client";

import * as React from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { unlinkAccount } from "@/actions/accounts";

type ProviderInfo = {
  id: string;
  name: string;
};

const providerLabels: Record<string, string> = {
  google: "Google / YouTube",
  twitch: "Twitch",
  discord: "Discord",
  reddit: "Reddit",
  "azure-ad": "Microsoft / Xbox",
  credentials: "Local Username"
};

export default function AccountLinks() {
  const [providers, setProviders] = React.useState<Record<string, ProviderInfo>>({});
  const [accounts, setAccounts] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = React.useState<string | null>(null);

  React.useEffect(() => {
    getProviders()
      .then((result) => setProviders(result ?? {}))
      .catch(() => setProviders({}));
  }, []);

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

  const oauthProviders = Object.values(providers).filter((provider) => provider.id !== "credentials");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-xs text-foreground/60">Linked</div>
        {accounts.length === 0 ? (
          <div className="text-xs text-foreground/50">No external accounts linked yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {accounts.map((provider) => (
              <div key={provider} className="rounded-full border border-border px-2 py-1 text-xs">
                {providerLabels[provider] ?? provider}
                <button
                  type="button"
                  onClick={() => handleUnlink(provider)}
                  disabled={pendingProvider === provider}
                  className="ml-2 text-[10px] text-foreground/50 hover:text-foreground"
                >
                  {pendingProvider === provider ? "..." : "Unlink"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs text-foreground/60">Connect another account</div>
        <div className="flex flex-wrap gap-2">
          {oauthProviders.map((provider) => {
            const isLinked = accounts.includes(provider.id);
            return (
              <Button
                key={provider.id}
                size="sm"
                variant="outline"
                onClick={() => signIn(provider.id)}
                disabled={isLinked}
              >
                {isLinked ? "Linked" : `Connect ${providerLabels[provider.id] ?? provider.name}`}
              </Button>
            );
          })}
        </div>
      </div>

      {error ? <div className="text-xs text-[color:var(--color-warning)]">{error}</div> : null}
    </div>
  );
}
