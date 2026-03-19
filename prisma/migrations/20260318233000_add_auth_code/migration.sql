-- Add authCode to users for auth-code login
ALTER TABLE "User" ADD COLUMN "authCode" TEXT;

-- Enforce uniqueness for non-null codes
CREATE UNIQUE INDEX "User_authCode_key" ON "User"("authCode");