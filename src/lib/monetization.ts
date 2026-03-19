import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const truthyValues = new Set(["1", "true", "yes", "on"]);

export type RewardProviderKind = "disabled" | "adsense" | "video";

export type StoreItem = {
  id: string;
  name: string;
  cost: number;
  type: "theme" | "perk";
  description: string;
  unlocks?: {
    accent?: string;
  };
};

export const STORE_ITEMS: StoreItem[] = [
  {
    id: "accent-sunset",
    name: "Sunset Accent",
    cost: 45,
    type: "theme",
    description: "Warm coral highlights for the terminal shell.",
    unlocks: { accent: "sunset" }
  },
  {
    id: "accent-mint",
    name: "Mint Accent",
    cost: 45,
    type: "theme",
    description: "Cool green highlights for a cleaner workbench vibe.",
    unlocks: { accent: "mint" }
  },
  {
    id: "accent-nightfall",
    name: "Nightfall Accent",
    cost: 60,
    type: "theme",
    description: "Deep blue-violet highlights for late-night sessions.",
    unlocks: { accent: "nightfall" }
  }
];

function readInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isEnabled(value: string | undefined) {
  return truthyValues.has((value ?? "").trim().toLowerCase());
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSameDay(left: Date | null | undefined, right: Date) {
  return Boolean(
    left &&
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
  );
}

export function getSupportUrl() {
  return process.env.SUPPORT_URL?.trim() || null;
}

export function getRewardConfig() {
  const provider = ((process.env.AD_PROVIDER ?? "disabled").trim().toLowerCase() || "disabled") as RewardProviderKind;
  const rewardedEnabled = isEnabled(process.env.REWARDED_AD_ENABLED);
  const rewardPointsMin = readInt(process.env.REWARD_POINTS_MIN, 5);
  const rewardPointsMax = Math.max(readInt(process.env.REWARD_POINTS_MAX, 15), rewardPointsMin);
  const cooldownMinutes = Math.max(readInt(process.env.AD_COOLDOWN_MINUTES, 5), 1);
  const dailyCap = Math.max(readInt(process.env.DAILY_POINTS_CAP, 100), rewardPointsMin);
  const rewardedVideoUrl = process.env.REWARDED_VIDEO_URL?.trim() || null;
  const googleRewardedAdUnit = process.env.GOOGLE_REWARDED_AD_UNIT?.trim() || null;
  const minimumViewSeconds = Math.max(readInt(process.env.REWARDED_AD_MIN_SECONDS, 15), 5);

  const providerConfigured =
    rewardedEnabled &&
    ((provider === "video" && Boolean(rewardedVideoUrl)) ||
      (provider === "adsense" && Boolean(googleRewardedAdUnit)));

  return {
    provider,
    rewardedEnabled,
    rewardPointsMin,
    rewardPointsMax,
    cooldownMinutes,
    dailyCap,
    rewardedVideoUrl,
    googleRewardedAdUnit,
    providerConfigured,
    minimumViewSeconds,
    supportUrl: getSupportUrl()
  };
}

function nextCooldownAt(lastAdWatchAt: Date | null | undefined, cooldownMinutes: number) {
  if (!lastAdWatchAt) return null;
  return new Date(lastAdWatchAt.getTime() + cooldownMinutes * 60_000);
}

function getDailyPointsUsed(currentPoints: number, pointsDate: Date | null | undefined) {
  return isSameDay(pointsDate, startOfToday()) ? currentPoints : 0;
}

function getStoreItem(itemId: string) {
  return STORE_ITEMS.find((item) => item.id === itemId) ?? null;
}

export function getUnlockedAccentChoices(unlockIds: string[]) {
  return STORE_ITEMS.filter((item) => unlockIds.includes(item.id))
    .map((item) => item.unlocks?.accent)
    .filter((value): value is string => Boolean(value));
}

export async function getRewardsStatus(userId?: string) {
  const config = getRewardConfig();
  if (!userId) {
    return {
      signedIn: false,
      supportUrl: config.supportUrl,
      provider: config.provider,
      providerConfigured: config.providerConfigured,
      rewardedEnabled: config.rewardedEnabled,
      rewardRange: [config.rewardPointsMin, config.rewardPointsMax] as const,
      cooldownMinutes: config.cooldownMinutes,
      dailyCap: config.dailyCap,
      minimumViewSeconds: config.minimumViewSeconds,
      points: 0,
      dailyPoints: 0,
      adsEnabled: false,
      supportThanks: false,
      cooldownRemainingSeconds: 0,
      availableNow: false,
      storeItems: STORE_ITEMS.map((item) => ({ ...item, unlocked: false }))
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      points: true,
      lastAdWatchAt: true,
      dailyPoints: true,
      dailyPointsDate: true,
      settings: { select: { adsEnabled: true } },
      storeUnlocks: { select: { itemId: true } }
    }
  });

  if (!user) {
    return {
      signedIn: false,
      supportUrl: config.supportUrl,
      provider: config.provider,
      providerConfigured: config.providerConfigured,
      rewardedEnabled: config.rewardedEnabled,
      rewardRange: [config.rewardPointsMin, config.rewardPointsMax] as const,
      cooldownMinutes: config.cooldownMinutes,
      dailyCap: config.dailyCap,
      minimumViewSeconds: config.minimumViewSeconds,
      points: 0,
      dailyPoints: 0,
      adsEnabled: false,
      supportThanks: false,
      cooldownRemainingSeconds: 0,
      availableNow: false,
      storeItems: STORE_ITEMS.map((item) => ({ ...item, unlocked: false }))
    };
  }

  const dailyPoints = getDailyPointsUsed(user.dailyPoints, user.dailyPointsDate);
  const cooldownAt = nextCooldownAt(user.lastAdWatchAt, config.cooldownMinutes);
  const cooldownRemainingSeconds = cooldownAt
    ? Math.max(Math.ceil((cooldownAt.getTime() - Date.now()) / 1000), 0)
    : 0;
  const unlockedItemIds = user.storeUnlocks.map((item) => item.itemId);

  return {
    signedIn: true,
    supportUrl: config.supportUrl,
    provider: config.provider,
    providerConfigured: config.providerConfigured,
    rewardedEnabled: config.rewardedEnabled,
    rewardRange: [config.rewardPointsMin, config.rewardPointsMax] as const,
    cooldownMinutes: config.cooldownMinutes,
    dailyCap: config.dailyCap,
    minimumViewSeconds: config.minimumViewSeconds,
    points: user.points,
    dailyPoints,
    adsEnabled: user.settings?.adsEnabled ?? false,
    supportThanks: false,
    cooldownRemainingSeconds,
    availableNow:
      config.rewardedEnabled &&
      config.providerConfigured &&
      (user.settings?.adsEnabled ?? false) &&
      cooldownRemainingSeconds === 0 &&
      dailyPoints < config.dailyCap,
    storeItems: STORE_ITEMS.map((item) => ({
      ...item,
      unlocked: unlockedItemIds.includes(item.id)
    })),
    unlockedItemIds
  };
}

export async function setAdsOptIn(userId: string, enabled: boolean) {
  await prisma.userSettings.upsert({
    where: { userId },
    update: { adsEnabled: enabled },
    create: { userId, adsEnabled: enabled }
  });
}

export async function startRewardedAdSession(userId: string) {
  const config = getRewardConfig();
  if (!config.rewardedEnabled || !config.providerConfigured || config.provider === "disabled") {
    throw new Error("Rewarded ads are not configured for this build.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastAdWatchAt: true,
      dailyPoints: true,
      dailyPointsDate: true,
      settings: { select: { adsEnabled: true } }
    }
  });

  if (!user) {
    throw new Error("Sign in to earn points.");
  }

  if (!user.settings?.adsEnabled) {
    throw new Error("Turn on rewarded ads first.");
  }

  const pending = await prisma.adRewardLog.findFirst({
    where: {
      userId,
      status: "started",
      startedAt: { gte: new Date(Date.now() - 30 * 60_000) }
    },
    orderBy: { startedAt: "desc" }
  });

  if (pending) {
    throw new Error("Finish the current rewarded ad before starting another.");
  }

  const nextEligibleAt = nextCooldownAt(user.lastAdWatchAt, config.cooldownMinutes);
  if (nextEligibleAt && nextEligibleAt.getTime() > Date.now()) {
    throw new Error("Rewarded ad cooldown is still active.");
  }

  const dailyPoints = getDailyPointsUsed(user.dailyPoints, user.dailyPointsDate);
  if (dailyPoints >= config.dailyCap) {
    throw new Error("Daily points cap reached.");
  }

  const rewardAmount =
    config.rewardPointsMin +
    Math.floor(Math.random() * (config.rewardPointsMax - config.rewardPointsMin + 1));
  const adSessionToken = randomBytes(18).toString("hex");

  await prisma.adRewardLog.create({
    data: {
      userId,
      provider: config.provider,
      status: "started",
      rewardAmount,
      adSessionToken
    }
  });

  return {
    adSessionToken,
    rewardAmount,
    provider:
      config.provider === "video"
        ? {
            kind: "video" as const,
            videoUrl: config.rewardedVideoUrl!,
            minimumViewSeconds: config.minimumViewSeconds
          }
        : {
            kind: "adsense" as const,
            adUnitPath: config.googleRewardedAdUnit!,
            minimumViewSeconds: config.minimumViewSeconds
          }
  };
}

export async function finishRewardedAdSession(
  userId: string,
  adSessionToken: string,
  result: "completed" | "skipped" | "error"
) {
  const config = getRewardConfig();
  const log = await prisma.adRewardLog.findUnique({
    where: { adSessionToken },
    select: {
      id: true,
      userId: true,
      status: true,
      rewardAmount: true,
      startedAt: true
    }
  });

  if (!log || log.userId !== userId) {
    throw new Error("Rewarded ad session not found.");
  }

  if (log.status !== "started") {
    throw new Error("Rewarded ad session is already closed.");
  }

  if (result !== "completed") {
    await prisma.adRewardLog.update({
      where: { adSessionToken },
      data: {
        status: result,
        completedAt: new Date()
      }
    });
    return { status: result, grantedPoints: 0 };
  }

  if (Date.now() - log.startedAt.getTime() < config.minimumViewSeconds * 1000) {
    await prisma.adRewardLog.update({
      where: { adSessionToken },
      data: {
        status: "error",
        completedAt: new Date(),
        metadata: { reason: "minimum_view_time_not_met" }
      }
    });
    throw new Error("Rewarded ad was closed too quickly.");
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        lastAdWatchAt: true,
        dailyPoints: true,
        dailyPointsDate: true
      }
    });

    if (!current) {
      throw new Error("Sign in to earn points.");
    }

    const cooldownAt = nextCooldownAt(current.lastAdWatchAt, config.cooldownMinutes);
    if (cooldownAt && cooldownAt.getTime() > Date.now()) {
      await tx.adRewardLog.update({
        where: { adSessionToken },
        data: {
          status: "cooldown",
          completedAt: new Date()
        }
      });
      throw new Error("Rewarded ad cooldown is still active.");
    }

    const today = startOfToday();
    const dailyPoints = getDailyPointsUsed(current.dailyPoints, current.dailyPointsDate);
    const remaining = Math.max(config.dailyCap - dailyPoints, 0);
    const grantedPoints = Math.min(log.rewardAmount, remaining);

    await tx.adRewardLog.update({
      where: { adSessionToken },
      data: {
        status: grantedPoints > 0 ? "completed" : "capped",
        completedAt: new Date(),
        grantedPoints
      }
    });

    if (grantedPoints > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: grantedPoints },
          lastAdWatchAt: new Date(),
          dailyPoints: isSameDay(current.dailyPointsDate, today) ? dailyPoints + grantedPoints : grantedPoints,
          dailyPointsDate: today
        }
      });
    }

    return {
      status: grantedPoints > 0 ? "completed" : "capped",
      grantedPoints
    };
  });
}

export async function purchaseStoreItem(userId: string, itemId: string) {
  const item = getStoreItem(itemId);
  if (!item) {
    throw new Error("Store item not found.");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.userStoreUnlock.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (existing) {
      throw new Error("Item already unlocked.");
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { points: true }
    });

    if (!user) {
      throw new Error("Sign in to unlock store items.");
    }

    if (user.points < item.cost) {
      throw new Error("Not enough points.");
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        points: { decrement: item.cost }
      }
    });

    await tx.userStoreUnlock.create({
      data: {
        userId,
        itemId,
        cost: item.cost
      }
    });

    return item;
  });
}
