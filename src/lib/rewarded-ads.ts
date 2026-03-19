export interface AdProvider {
  load(): Promise<void>;
  showRewardedAd(): Promise<"completed" | "skipped" | "error">;
}

export type RewardedVideoConfig = {
  kind: "video";
  videoUrl: string;
  minimumViewSeconds: number;
};

export type RewardedAdsenseConfig = {
  kind: "adsense";
  adUnitPath: string;
  minimumViewSeconds: number;
};

export type RewardedAdConfig = RewardedVideoConfig | RewardedAdsenseConfig;
