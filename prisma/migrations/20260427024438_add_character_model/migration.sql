-- DropIndex
DROP INDEX "UserImportBaseline_userId_datasetVersionId_idx";

-- DropIndex
DROP INDEX "UserLearnedBasePiece_userId_idx";

-- AlterTable
ALTER TABLE "LegendaryMod" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SharedBuild" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserImportBaseline" ADD COLUMN     "characterId" TEXT;

-- AlterTable
ALTER TABLE "UserLearnedBasePiece" ADD COLUMN     "characterId" TEXT;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "characterId" TEXT;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "activeCharacterId" TEXT;

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_name_key" ON "Character"("userId", "name");

-- CreateIndex
CREATE INDEX "UserImportBaseline_characterId_datasetVersionId_idx" ON "UserImportBaseline"("characterId", "datasetVersionId");

-- CreateIndex
CREATE INDEX "UserLearnedBasePiece_characterId_idx" ON "UserLearnedBasePiece"("characterId");

-- CreateIndex
CREATE INDEX "UserProgress_characterId_idx" ON "UserProgress"("characterId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_activeCharacterId_fkey" FOREIGN KEY ("activeCharacterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearnedBasePiece" ADD CONSTRAINT "UserLearnedBasePiece_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserImportBaseline" ADD CONSTRAINT "UserImportBaseline_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
