-- Add secondaryCode to users and relax authCode uniqueness
ALTER TABLE "User" ADD COLUMN "secondaryCode" TEXT;

DROP INDEX IF EXISTS "User_authCode_key";
CREATE UNIQUE INDEX "User_secondaryCode_key" ON "User"("secondaryCode");