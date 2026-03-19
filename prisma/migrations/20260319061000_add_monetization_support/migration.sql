ALTER TABLE "User"
ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastAdWatchAt" TIMESTAMP(3),
ADD COLUMN "dailyPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dailyPointsDate" TIMESTAMP(3);

ALTER TABLE "UserSettings"
ADD COLUMN "adsEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "AdRewardLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "adSessionToken" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "rewardAmount" INTEGER NOT NULL,
  "grantedPoints" INTEGER,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "metadata" JSONB,

  CONSTRAINT "AdRewardLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserStoreUnlock" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "cost" INTEGER NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserStoreUnlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdRewardLog_adSessionToken_key" ON "AdRewardLog"("adSessionToken");
CREATE INDEX "AdRewardLog_userId_status_startedAt_idx" ON "AdRewardLog"("userId", "status", "startedAt");
CREATE INDEX "AdRewardLog_userId_completedAt_idx" ON "AdRewardLog"("userId", "completedAt");
CREATE UNIQUE INDEX "UserStoreUnlock_userId_itemId_key" ON "UserStoreUnlock"("userId", "itemId");
CREATE INDEX "UserStoreUnlock_userId_unlockedAt_idx" ON "UserStoreUnlock"("userId", "unlockedAt");

ALTER TABLE "AdRewardLog"
ADD CONSTRAINT "AdRewardLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserStoreUnlock"
ADD CONSTRAINT "UserStoreUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
