import 'dotenv/config';
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    include: { characters: true }
  });

  for (const user of users) {
    let mainCharacter = user.characters[0];
    
    if (!mainCharacter) {
      mainCharacter = await prisma.character.create({
        data: {
          userId: user.id,
          name: "Main Character"
        }
      });
    }

    // Set active character
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: { activeCharacterId: mainCharacter.id },
      create: { userId: user.id, activeCharacterId: mainCharacter.id }
    });

    // Update progress rows
    await prisma.userProgress.updateMany({
      where: { userId: user.id },
      data: { characterId: mainCharacter.id }
    });

    // Update imported baselines
    await prisma.userImportBaseline.updateMany({
      where: { userId: user.id },
      data: { characterId: mainCharacter.id }
    });

    // Update learned base pieces
    const basePieces = await prisma.userLearnedBasePiece.findMany({
      where: { userId: user.id }
    });
    for (const piece of basePieces) {
      await prisma.userLearnedBasePiece.upsert({
        where: {
          characterId_basePieceId: {
            characterId: mainCharacter.id,
            basePieceId: piece.basePieceId
          }
        },
        create: {
          userId: user.id,
          characterId: mainCharacter.id,
          basePieceId: piece.basePieceId
        },
        update: {}
      });
    }
  }

  console.log("Migration completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
