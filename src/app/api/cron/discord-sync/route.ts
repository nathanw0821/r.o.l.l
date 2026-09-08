import { requireCronSecret } from "@/lib/api/cron";
import { internalError, ok } from "@/lib/api/responses";
import { reconcileDiscordVault } from "@/lib/discord/sync-engine";

export async function GET(request: Request) {
  const auth = requireCronSecret(request);
  if ("response" in auth) return auth.response;

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return internalError("DISCORD_BOT_TOKEN is not configured.");
  }

  try {
    const result = await reconcileDiscordVault(botToken);
    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discord vault sync failed";
    return internalError(message);
  }
}

export async function POST(request: Request) {
  return GET(request);
}
