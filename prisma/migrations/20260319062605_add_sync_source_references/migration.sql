-- AlterTable
ALTER TABLE "SyncSource" ADD COLUMN     "lastChangedAt" TIMESTAMP(3),
ADD COLUMN     "lastCheckStatus" TEXT,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastContentHash" TEXT,
ADD COLUMN     "referenceUrl" TEXT;
