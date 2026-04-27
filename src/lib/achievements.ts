import { prisma } from "@/lib/prisma";
import { getAllEffectTiers } from "@/lib/data";

export type AchievementGroup = "visible" | "hidden" | "easterEgg";

export type AchievementDefinition = {
  key: string;
  name: string;
  description: string;
  group: AchievementGroup;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: "logging_in",
    name: "Logging in!",
    description: "Thanks for enjoying the tool enough to login! I'll never sell your data!!",
    group: "visible"
  },
  {
    key: "curious",
    name: "Curious",
    description: "You viewed the Achievements!",
    group: "visible"
  },
  {
    key: "first_unlock",
    name: "Fresh from the Bench",
    description: "Unlock your first legendary.",
    group: "visible"
  },
  {
    key: "progress_10",
    name: "Getting Warm",
    description: "Reach 10% completion.",
    group: "visible"
  },
  {
    key: "progress_25",
    name: "Quartermaster",
    description: "Reach 25% completion.",
    group: "visible"
  },
  {
    key: "progress_50",
    name: "Halfway There",
    description: "Reach 50% completion.",
    group: "visible"
  },
  {
    key: "progress_75",
    name: "Almost Appalachia",
    description: "Reach 75% completion.",
    group: "visible"
  },
  {
    key: "armor_complete",
    name: "Suit Up",
    description: "Unlock every armor legendary.",
    group: "visible"
  },
  {
    key: "power_armor_complete",
    name: "Tin Titan",
    description: "Unlock every power armor legendary.",
    group: "visible"
  },
  {
    key: "ranged_complete",
    name: "Deadeye Depot",
    description: "Unlock every ranged weapon legendary.",
    group: "visible"
  },
  {
    key: "melee_complete",
    name: "Up Close and Personal",
    description: "Unlock every melee weapon legendary.",
    group: "visible"
  },
  {
    key: "progress_100",
    name: "Registry Complete",
    description: "Reach 100% completion.",
    group: "visible"
  },
  {
    key: "imported_memory",
    name: "Imported Memory",
    description: "Load in a personal baseline.",
    group: "hidden"
  },
  {
    key: "tier_1_complete",
    name: "One and Done",
    description: "Unlock every 1-Star legendary.",
    group: "hidden"
  },
  {
    key: "tier_2_complete",
    name: "Double Tap",
    description: "Unlock every 2-Star legendary.",
    group: "hidden"
  },
  {
    key: "tier_3_complete",
    name: "Triple Threat",
    description: "Unlock every 3-Star legendary.",
    group: "hidden"
  },
  {
    key: "tier_4_complete",
    name: "Fourth Time's the Charm",
    description: "Unlock every 4-Star legendary.",
    group: "hidden"
  },
  {
    key: "vault_chic",
    name: "Vault-Tec Paint",
    description: "Dress the terminal in vault colors.",
    group: "easterEgg"
  },
  {
    key: "midnight_oil",
    name: "Midnight Oil",
    description: "Flip the lights low and keep tinkering.",
    group: "easterEgg"
  },
  {
    key: "glow_up",
    name: "Glow Up",
    description: "Crank the terminal into full radioactive mode.",
    group: "easterEgg"
  },
  {
    key: "second_life",
    name: "Second Life",
    description: "Create your second character.",
    group: "visible"
  },
  {
    key: "full_roster",
    name: "Full Roster",
    description: "Max out your character slots (5 characters).",
    group: "visible"
  },
  {
    key: "a_new_name",
    name: "A New Name",
    description: "Rename a character.",
    group: "visible"
  },
  {
    key: "changing_gears",
    name: "Changing Gears",
    description: "Switch your active character.",
    group: "visible"
  },
  {
    key: "spring_cleaning",
    name: "Spring Cleaning",
    description: "Delete a character.",
    group: "visible"
  },
  {
    key: "gary",
    name: "Gaaaaary...",
    description: "Rename a character to Gary.",
    group: "easterEgg"
  },
  {
    key: "the_one",
    name: "There Can Be Only One",
    description: "Delete characters until only one remains.",
    group: "hidden"
  },
  {
    key: "identity_theft",
    name: "Identity Theft",
    description: "Rename a character to 'Main Character'.",
    group: "hidden"
  }
];

type AchievementRecord = {
  key: string;
  unlockedAt: Date;
};

export type UserAchievementView = AchievementDefinition & {
  unlocked: boolean;
  unlockedAt: Date | null;
  concealed: boolean;
};

const achievementKeys = new Set(ACHIEVEMENTS.map((achievement) => achievement.key));

export async function awardAchievements(userId: string, keys: string[]) {
  const validKeys = Array.from(new Set(keys.filter((key) => achievementKeys.has(key))));
  if (validKeys.length === 0) return;

  await prisma.userAchievement.createMany({
    data: validKeys.map((key) => ({
      userId,
      key
    })),
    skipDuplicates: true
  });
}

function hasFullCategory(
  rows: Awaited<ReturnType<typeof getAllEffectTiers>>,
  categoryName: string
) {
  const matching = rows.filter((row) =>
    row.categories.some((category) => category.category.name === categoryName)
  );
  return matching.length > 0 && matching.every((row) => row.unlocked);
}

function hasFullTier(rows: Awaited<ReturnType<typeof getAllEffectTiers>>, tierLabel: string) {
  const matching = rows.filter((row) => row.tier?.label === tierLabel);
  return matching.length > 0 && matching.every((row) => row.unlocked);
}

export async function syncUserAchievements(userId: string) {
  const [rows, importedBaselineCount] = await Promise.all([
    getAllEffectTiers(userId),
    prisma.userImportBaseline.count({ where: { userId } })
  ]);

  const unlockedCount = rows.filter((row) => row.unlocked).length;
  const total = rows.length;
  const percent = total > 0 ? Math.floor((unlockedCount / total) * 100) : 0;
  const earned: string[] = [];

  if (importedBaselineCount > 0) earned.push("imported_memory");
  if (unlockedCount >= 1) earned.push("first_unlock");
  if (percent >= 10) earned.push("progress_10");
  if (percent >= 25) earned.push("progress_25");
  if (percent >= 50) earned.push("progress_50");
  if (percent >= 75) earned.push("progress_75");
  if (percent >= 100 && total > 0) earned.push("progress_100");
  if (hasFullCategory(rows, "Armor")) earned.push("armor_complete");
  if (hasFullCategory(rows, "Power Armor")) earned.push("power_armor_complete");
  if (hasFullCategory(rows, "Weapon: Ranged")) earned.push("ranged_complete");
  if (hasFullCategory(rows, "Weapon: Melee")) earned.push("melee_complete");
  if (hasFullTier(rows, "1 Star")) earned.push("tier_1_complete");
  if (hasFullTier(rows, "2 Star")) earned.push("tier_2_complete");
  if (hasFullTier(rows, "3 Star")) earned.push("tier_3_complete");
  if (hasFullTier(rows, "4 Star")) earned.push("tier_4_complete");

  await awardAchievements(userId, earned);
}

export async function awardLoginAchievement(userId: string) {
  await awardAchievements(userId, ["logging_in"]);
}

export async function awardAchievementsView(userId: string) {
  await awardAchievements(userId, ["curious"]);
}

export async function awardSettingsAchievements(userId: string, input: {
  theme?: "light" | "dark" | "system";
  accent?: "ember" | "vault" | "radburst" | "glow" | "brass" | "frost" | "sunset" | "mint" | "nightfall";
}) {
  const earned: string[] = [];
  if (input.theme === "dark") earned.push("midnight_oil");
  if (input.accent === "vault") earned.push("vault_chic");
  if (input.accent === "glow") earned.push("glow_up");
  await awardAchievements(userId, earned);
}

export async function getUserAchievements(userId: string) {
  const unlockedRows = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "asc" }
  });

  const unlockedMap = new Map<string, AchievementRecord>(
    unlockedRows.map((row: { key: string; unlockedAt: Date }) => [row.key, { key: row.key, unlockedAt: row.unlockedAt }])
  );

  return ACHIEVEMENTS.map((achievement): UserAchievementView => {
    const unlocked = unlockedMap.get(achievement.key);
    const concealed = !unlocked && achievement.group !== "visible";
    return {
      ...achievement,
      unlocked: Boolean(unlocked),
      unlockedAt: unlocked?.unlockedAt ?? null,
      concealed
    };
  });
}
