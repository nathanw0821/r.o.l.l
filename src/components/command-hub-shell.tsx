"use client";

import * as React from "react";
import CommandHub from "@/components/command-hub";

type HubPayload = {
  summary: { total: number; unlocked: number; percent: number };
  tierProgress: {
    tierLabel: string;
    total: number;
    unlocked: number;
    percent: number;
    effectTierIds: string[];
  }[];
  isAdmin?: boolean;
  dataset?: {
    importedAt?: string | null;
    sourceType?: string | null;
    sourceName?: string | null;
  } | null;
};

const EMPTY_HUB: HubPayload = {
  summary: { total: 0, unlocked: 0, percent: 0 },
  tierProgress: [],
  isAdmin: false,
  dataset: null
};

export default function CommandHubShell({
  authKey,
  isSignedIn
}: {
  authKey: string;
  isSignedIn: boolean;
}) {
  const [payload, setPayload] = React.useState<HubPayload>(EMPTY_HUB);

  React.useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      fetch(`/api/command-hub?auth=${encodeURIComponent(authKey)}&t=${Date.now()}`, {
        cache: isSignedIn ? "no-store" : "force-cache"
      })
        .then((response) => response.json())
        .then((body) => {
          if (!active || !body?.success || !body?.data) return;
          setPayload(body.data as HubPayload);
        })
        .catch(() => undefined);
    }, 220);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [authKey, isSignedIn]);

  return (
    <CommandHub
      summary={payload.summary}
      tierProgress={payload.tierProgress}
      isAdmin={payload.isAdmin}
      dataset={payload.dataset}
    />
  );
}
