-- Add passive point timestamp tracking on users.
ALTER TABLE "User"
ADD COLUMN "passivePointsAt" TIMESTAMP(3);

-- Enable points earning by default for user settings.
ALTER TABLE "UserSettings"
ALTER COLUMN "adsEnabled" SET DEFAULT true;
