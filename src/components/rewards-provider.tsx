"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { RewardedAdConfig } from "@/lib/rewarded-ads";

type RewardStatus = {
  signedIn: boolean;
  supportUrl: string | null;
  provider: "disabled" | "adsense" | "video";
  providerConfigured: boolean;
  rewardedEnabled: boolean;
  rewardRange: readonly [number, number];
  cooldownMinutes: number;
  dailyCap: number;
  minimumViewSeconds: number;
  points: number;
  dailyPoints: number;
  adsEnabled: boolean;
  supportThanks: boolean;
  cooldownRemainingSeconds: number;
  availableNow: boolean;
  unlockedItemIds?: string[];
  storeItems: {
    id: string;
    name: string;
    cost: number;
    type: "theme" | "perk";
    description: string;
    unlocked: boolean;
  }[];
};

type RewardsContextValue = {
  status: RewardStatus | null;
  loading: boolean;
  actionPending: boolean;
  setAdsEnabled: (enabled: boolean) => Promise<void>;
  watchRewardedAd: () => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  message: string | null;
  clearMessage: () => void;
};

const RewardsContext = React.createContext<RewardsContextValue | null>(null);

async function fetchJson<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json()) as T & {
    success?: boolean;
    error?: { message?: string };
  };
  if (!response.ok || ("success" in payload && payload.success === false)) {
    throw new Error(payload.error?.message ?? "Request failed.");
  }
  return payload;
}

type VideoDialogState = {
  adSessionToken: string;
  config: Extract<RewardedAdConfig, { kind: "video" }>;
};

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = React.useState<RewardStatus | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [actionPending, setActionPending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [videoDialog, setVideoDialog] = React.useState<VideoDialogState | null>(null);
  const [videoReady, setVideoReady] = React.useState(false);
  const finishResolver = React.useRef<((result: "completed" | "skipped" | "error") => void) | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchJson<{ success: true; data: RewardStatus }>("/api/rewards", {
        cache: "no-store"
      });
      setStatus(payload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load rewards.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (sessionStatus === "authenticated" || sessionStatus === "unauthenticated") {
      refresh();
      return;
    }
  }, [refresh, sessionStatus]);

  React.useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refresh();
    }, 30 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [refresh, sessionStatus]);

  React.useEffect(() => {
    if (!status?.cooldownRemainingSeconds) return;
    const timer = window.setInterval(() => {
      setStatus((current) =>
        current
          ? {
              ...current,
              cooldownRemainingSeconds: Math.max(current.cooldownRemainingSeconds - 1, 0),
              availableNow:
                current.rewardedEnabled &&
                current.providerConfigured &&
                current.adsEnabled &&
                Math.max(current.cooldownRemainingSeconds - 1, 0) === 0 &&
                current.dailyPoints < current.dailyCap
            }
          : current
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status?.cooldownRemainingSeconds]);

  const setAdsEnabled = React.useCallback(async (enabled: boolean) => {
    if (!session?.user?.id) return;
    setActionPending(true);
    setMessage(null);
    try {
      const payload = await fetchJson<{ success: true; data: RewardStatus }>("/api/rewards", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adsEnabled: enabled })
      });
      setStatus(payload.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update rewarded ad setting.");
    } finally {
      setActionPending(false);
    }
  }, [session?.user?.id]);

  async function finishReward(adSessionToken: string, result: "completed" | "skipped" | "error") {
    const payload = await fetchJson<{
      success: true;
      data: {
        reward: { status: string; grantedPoints: number };
        status: RewardStatus;
      };
    }>("/api/rewards/finish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adSessionToken, result })
    });

    setStatus(payload.data.status);
    if (payload.data.reward.grantedPoints > 0) {
      setMessage(`Reward complete. +${payload.data.reward.grantedPoints} points.`);
    } else if (result === "completed") {
      setMessage("Reward completed, but no points were available from the current cap.");
    }
  }

  function waitForVideoResult() {
    return new Promise<"completed" | "skipped" | "error">((resolve) => {
      finishResolver.current = resolve;
    });
  }

  function resolveVideo(result: "completed" | "skipped" | "error") {
    const resolve = finishResolver.current;
    finishResolver.current = null;
    setVideoDialog(null);
    setVideoReady(false);
    resolve?.(result);
  }

  const watchRewardedAd = React.useCallback(async () => {
    if (!session?.user?.id) {
      setMessage("Sign in to earn points.");
      return;
    }

    setActionPending(true);
    setMessage(null);

    try {
      const payload = await fetchJson<{
        success: true;
        data: {
          adSessionToken: string;
          rewardAmount: number;
          provider: RewardedAdConfig;
        };
      }>("/api/rewards/start", {
        method: "POST"
      });

      if (payload.data.provider.kind === "video") {
        setVideoDialog({
          adSessionToken: payload.data.adSessionToken,
          config: payload.data.provider
        });
        const result = await waitForVideoResult();
        await finishReward(payload.data.adSessionToken, result);
      } else {
        await finishReward(payload.data.adSessionToken, "error");
        setMessage("This rewarded provider needs additional live publisher setup before it can run here.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start rewarded ad.");
    } finally {
      setActionPending(false);
    }
  }, [session?.user?.id]);

  const purchaseItem = React.useCallback(async (itemId: string) => {
    if (!session?.user?.id) {
      setMessage("Sign in to unlock store items.");
      return;
    }

    setActionPending(true);
    setMessage(null);
    try {
      const payload = await fetchJson<{
        success: true;
        data: {
          item: { name: string };
          status: RewardStatus;
        };
      }>("/api/rewards/purchase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId })
      });
      setStatus(payload.data.status);
      setMessage(`${payload.data.item.name} unlocked.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not unlock store item.");
    } finally {
      setActionPending(false);
    }
  }, [session?.user?.id]);

  const value = React.useMemo(
    () => ({
      status,
      loading,
      actionPending,
      setAdsEnabled,
      watchRewardedAd,
      purchaseItem,
      refresh,
      message,
      clearMessage: () => setMessage(null)
    }),
    [status, loading, actionPending, setAdsEnabled, watchRewardedAd, purchaseItem, refresh, message]
  );

  return (
    <RewardsContext.Provider value={value}>
      {children}
      {videoDialog ? (
        <div className="rewarded-video-backdrop">
          <div className="rewarded-video-dialog">
            <div className="rewarded-video-dialog__title">Rewarded Video</div>
            <div className="rewarded-video-dialog__copy">
              Finish the video to claim your points. Closing early counts as skipped.
            </div>
            <video
              className="rewarded-video-dialog__player"
              src={videoDialog.config.videoUrl}
              controls
              autoPlay
              playsInline
              onEnded={() => setVideoReady(true)}
            />
            <div className="rewarded-video-dialog__meta">
              Minimum watch time: {videoDialog.config.minimumViewSeconds}s
            </div>
            <div className="rewarded-video-dialog__actions">
              <Button type="button" variant="outline" size="sm" onClick={() => resolveVideo("skipped")}>
                Skip
              </Button>
              <Button type="button" size="sm" disabled={!videoReady} onClick={() => resolveVideo("completed")}>
                Claim Reward
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = React.useContext(RewardsContext);
  if (!context) {
    throw new Error("useRewards must be used within RewardsProvider");
  }
  return context;
}
