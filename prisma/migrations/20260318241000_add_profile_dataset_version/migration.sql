-- Track which dataset version has had its profile data applied for a user
ALTER TABLE "User" ADD COLUMN "profileDatasetVersionId" TEXT;