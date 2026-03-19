/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "UserImportBaseline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "datasetVersionId" TEXT NOT NULL,
    "effectTierId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserImportBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserImportBaseline_userId_datasetVersionId_idx" ON "UserImportBaseline"("userId", "datasetVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImportBaseline_userId_effectTierId_key" ON "UserImportBaseline"("userId", "effectTierId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserImportBaseline" ADD CONSTRAINT "UserImportBaseline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImportBaseline" ADD CONSTRAINT "UserImportBaseline_effectTierId_fkey" FOREIGN KEY ("effectTierId") REFERENCES "EffectTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
