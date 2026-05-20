import 'dotenv/config';
import { prisma } from "../src/lib/prisma";

interface ActivityReportEntry {
  username: string;
  email: string;
  lastActiveDate: Date;
  lastActiveAction: string;
  history: { label: string; date: Date }[];
}

async function main() {
  console.log("Connecting to database and compiling active user logins/activity...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      lastAdWatchAt: true,
    },
  });

  const activityReport: ActivityReportEntry[] = [];

  for (const user of users) {
    // 1. Gather all activity dates
    const dates: { label: string; date: Date }[] = [
      { label: "Account Created", date: new Date(user.createdAt) }
    ];

    if (user.lastAdWatchAt) {
      dates.push({ label: "Ad Watched", date: new Date(user.lastAdWatchAt) });
    }

    // 2. Fetch last UserProgress update
    const lastProgress = await prisma.userProgress.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });
    if (lastProgress) {
      dates.push({ label: "Legendary Progress Updated", date: new Date(lastProgress.updatedAt) });
    }

    // 3. Fetch last Character update
    const lastCharacter = await prisma.character.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });
    if (lastCharacter) {
      dates.push({ label: "Character Profile Updated", date: new Date(lastCharacter.updatedAt) });
    }

    // 4. Fetch last learned base piece
    const lastLearnedPiece = await prisma.userLearnedBasePiece.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    if (lastLearnedPiece) {
      dates.push({ label: "Learned Catalog Piece", date: new Date(lastLearnedPiece.createdAt) });
    }

    // 5. Fetch last unlocked achievement
    const lastAchievement = await prisma.userAchievement.findFirst({
      where: { userId: user.id },
      orderBy: { unlockedAt: 'desc' },
      select: { unlockedAt: true }
    });
    if (lastAchievement) {
      dates.push({ label: "Unlocked Achievement", date: new Date(lastAchievement.unlockedAt) });
    }

    // 6. Fetch last Ad reward log
    const lastAdLog = await prisma.adRewardLog.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true }
    });
    if (lastAdLog) {
      dates.push({ label: "Ad Session Started", date: new Date(lastAdLog.startedAt) });
    }

    // 7. Fetch last Import audit log
    const lastImport = await prisma.importAudit.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    if (lastImport) {
      dates.push({ label: "Profile Data Imported", date: new Date(lastImport.createdAt) });
    }

    // 8. Fetch last Shared Build
    const lastSharedBuild = await prisma.sharedBuild.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });
    if (lastSharedBuild) {
      dates.push({ label: "Shared Custom Build", date: new Date(lastSharedBuild.updatedAt) });
    }

    // Sort all gathered dates in descending order to find the latest
    dates.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latest = dates[0];

    activityReport.push({
      username: user.username || 'unknown',
      email: user.email || 'unknown',
      lastActiveDate: latest.date,
      lastActiveAction: latest.label,
      history: dates
    });
  }

  // Sort report by last active date desc
  activityReport.sort((a, b) => b.lastActiveDate.getTime() - a.lastActiveDate.getTime());

  console.log(`\nUser Activity / Last Login Report:\n`);
  console.log(JSON.stringify(activityReport, null, 2));
}

main()
  .catch((e) => {
    console.error("Error executing query:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
