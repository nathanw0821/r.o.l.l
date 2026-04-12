-- Builder catalog + shareable loadouts (R.O.L.L. sandbox)

CREATE TABLE "LegendaryMod" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "starRank" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "effectMath" JSONB NOT NULL DEFAULT '{}',
    "craftingCost" JSONB NOT NULL DEFAULT '{}',
    "allowedOnPowerArmor" BOOLEAN NOT NULL DEFAULT true,
    "allowedOnArmor" BOOLEAN NOT NULL DEFAULT true,
    "allowedOnWeapon" BOOLEAN NOT NULL DEFAULT true,
    "infestationOnly" BOOLEAN NOT NULL DEFAULT false,
    "fifthStarEligible" BOOLEAN NOT NULL DEFAULT false,
    "ghoulSpecialCap" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegendaryMod_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LegendaryMod_slug_key" ON "LegendaryMod"("slug");

CREATE INDEX "LegendaryMod_starRank_category_idx" ON "LegendaryMod"("starRank", "category");

CREATE TABLE "SharedBuild" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "description" TEXT,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedBuild_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SharedBuild_slug_key" ON "SharedBuild"("slug");

CREATE INDEX "SharedBuild_slug_idx" ON "SharedBuild"("slug");

CREATE INDEX "SharedBuild_createdAt_idx" ON "SharedBuild"("createdAt");

ALTER TABLE "SharedBuild" ADD CONSTRAINT "SharedBuild_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
