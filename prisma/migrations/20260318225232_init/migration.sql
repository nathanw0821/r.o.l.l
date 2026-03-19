-- CreateTable
CREATE TABLE "DatasetVersion" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DatasetVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDataset" (
    "id" TEXT NOT NULL,
    "datasetVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourcePath" TEXT,
    "canonical" BOOLEAN NOT NULL DEFAULT false,
    "headerColumns" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceEffectRow" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "rawColumns" JSONB NOT NULL,
    "tierLabel" TEXT,
    "effectName" TEXT,
    "categories" TEXT,
    "description" TEXT,
    "extraComponent" TEXT,
    "legendaryModules" INTEGER,
    "unlockedRaw" TEXT,
    "notes" TEXT,
    "effectTierId" TEXT,

    CONSTRAINT "SourceEffectRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tier" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Effect" (
    "id" TEXT NOT NULL,
    "datasetVersionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Effect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EffectTier" (
    "id" TEXT NOT NULL,
    "datasetVersionId" TEXT NOT NULL,
    "effectId" TEXT NOT NULL,
    "tierId" INTEGER NOT NULL,
    "description" TEXT,
    "extraComponent" TEXT,
    "legendaryModules" INTEGER,
    "notes" TEXT,

    CONSTRAINT "EffectTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EffectTierCategory" (
    "effectTierId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "EffectTierCategory_pkey" PRIMARY KEY ("effectTierId","categoryId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "accent" TEXT NOT NULL DEFAULT 'ember',
    "density" TEXT NOT NULL DEFAULT 'comfortable',
    "colorBlind" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "effectTierId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "datasetVersionId" TEXT,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ImportAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceDataset_datasetVersionId_name_key" ON "SourceDataset"("datasetVersionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SourceEffectRow_datasetId_rowIndex_key" ON "SourceEffectRow"("datasetId", "rowIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Tier_label_key" ON "Tier"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Effect_datasetVersionId_name_key" ON "Effect"("datasetVersionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EffectTier_datasetVersionId_effectId_tierId_key" ON "EffectTier"("datasetVersionId", "effectId", "tierId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_effectTierId_key" ON "UserProgress"("userId", "effectTierId");

-- AddForeignKey
ALTER TABLE "SourceDataset" ADD CONSTRAINT "SourceDataset_datasetVersionId_fkey" FOREIGN KEY ("datasetVersionId") REFERENCES "DatasetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEffectRow" ADD CONSTRAINT "SourceEffectRow_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "SourceDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceEffectRow" ADD CONSTRAINT "SourceEffectRow_effectTierId_fkey" FOREIGN KEY ("effectTierId") REFERENCES "EffectTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Effect" ADD CONSTRAINT "Effect_datasetVersionId_fkey" FOREIGN KEY ("datasetVersionId") REFERENCES "DatasetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EffectTier" ADD CONSTRAINT "EffectTier_effectId_fkey" FOREIGN KEY ("effectId") REFERENCES "Effect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EffectTier" ADD CONSTRAINT "EffectTier_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EffectTier" ADD CONSTRAINT "EffectTier_datasetVersionId_fkey" FOREIGN KEY ("datasetVersionId") REFERENCES "DatasetVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EffectTierCategory" ADD CONSTRAINT "EffectTierCategory_effectTierId_fkey" FOREIGN KEY ("effectTierId") REFERENCES "EffectTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EffectTierCategory" ADD CONSTRAINT "EffectTierCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_effectTierId_fkey" FOREIGN KEY ("effectTierId") REFERENCES "EffectTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportAudit" ADD CONSTRAINT "ImportAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportAudit" ADD CONSTRAINT "ImportAudit_datasetVersionId_fkey" FOREIGN KEY ("datasetVersionId") REFERENCES "DatasetVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
