import dotenv from "dotenv";
import path from "path";
import { reconcileDiscordVault } from "../src/lib/discord/sync-engine";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ Missing DISCORD_BOT_TOKEN in environment!");
  process.exit(1);
}

async function main() {
  console.log("\n☢️ R.O.L.L. Cloud Vault Synchronization: Reconciling Feeds & Pinned Cards...\n");
  const result = await reconcileDiscordVault(BOT_TOKEN!);
  console.log(`\n🎉 Synchronization complete! Result:`, JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("❌ Error during reconciliation:", err);
  process.exit(1);
});
