import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";

async function main() {
  console.log("Starting UUID backfill...");
  
  const usersWithoutUuid = await prisma.user.findMany({
    where: {
      uuid: null
    }
  });

  console.log(`Found ${usersWithoutUuid.length} users without a UUID.`);

  let updatedCount = 0;
  for (const user of usersWithoutUuid) {
    try {
      const newUuid = randomUUID();
      await prisma.user.update({
        where: { id: user.id },
        data: { uuid: newUuid }
      });
      console.log(`Assigned UUID to user ${user.id} (${user.email || user.username})`);
      updatedCount++;
    } catch (error) {
      console.error(`Failed to assign UUID to user ${user.id}:`, error);
    }
  }

  console.log(`Finished UUID backfill. Updated ${updatedCount}/${usersWithoutUuid.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
