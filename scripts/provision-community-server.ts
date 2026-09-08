import dotenv from "dotenv";
import path from "path";

// Load local environment files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ Missing DISCORD_BOT_TOKEN in .env / .env.local!");
  process.exit(1);
}

const targetGuildId = process.argv[2];

if (!targetGuildId) {
  console.error("\n❌ Usage: npx tsx scripts/provision-community-server.ts <GUILD_ID>\n");
  console.error("To find your Guild ID in Discord:");
  console.error("1. Enable Developer Mode in Discord (User Settings -> Advanced -> Developer Mode)");
  console.error("2. Right-click your server icon and click 'Copy Server ID'\n");
  process.exit(1);
}

const DISCORD_API = "https://discord.com/api/v10";

async function discordFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${DISCORD_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Discord API Error [${res.status} ${res.statusText}] on ${endpoint}: ${errorText}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id?: string | null;
}

// Channel Types
const CHANNEL_TYPES = {
  GUILD_TEXT: 0,
  GUILD_VOICE: 2,
  GUILD_CATEGORY: 4,
};

// Server Blueprint
interface ChannelConfig {
  name: string;
  type: number;
  topic?: string;
  readOnly?: boolean;
}

interface CategoryConfig {
  name: string;
  channels: ChannelConfig[];
}

const SERVER_BLUEPRINT: CategoryConfig[] = [
  {
    name: "📋 ── WELCOME & INFO ──",
    channels: [
      {
        name: "📌・welcome-and-roles",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Welcome to R.O.L.L. · Record Of Legendary Loadouts community hub.",
        readOnly: true,
      },
      {
        name: "📜・rules-and-guidelines",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Community standards, trading etiquette & rules of engagement.",
        readOnly: true,
      },
      {
        name: "📢・announcements",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Official R.O.L.L. platform updates, site news & patch notes.",
        readOnly: true,
      },
    ],
  },
  {
    name: "💬 ── COMMUNITY HUB ──",
    channels: [
      {
        name: "☕・general-lounge",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Main hangout & wasteland banter. Keep it friendly!",
        readOnly: false,
      },
      {
        name: "🎮・fallout76-chat",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "General Fallout 76 discussions, live events, CAMP showcases & gameplay.",
        readOnly: false,
      },
      {
        name: "⚖️・build-theorycraft",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Share B.U.I.L.D. sandbox links, perk card deck loadouts & weapon/armor synergies.",
        readOnly: false,
      },
      {
        name: "📦・trading-post",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Fallout 76 legendary box mod trades, crafting exchanges & plan sharing.",
        readOnly: false,
      },
      {
        name: "💻・tech-and-homelab",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "PC hardware, Linux, CachyOS, self-hosting & AI chat.",
        readOnly: false,
      },
    ],
  },
  {
    name: "🤖 ── BOT & TRANSMISSIONS ──",
    channels: [
      {
        name: "🤖・bot-commands",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Run R.O.L.L. commands: /effect, /craft, /perk, /scrip, /daily, /build.",
        readOnly: false,
      },
      {
        name: "📡・vault-transmissions",
        type: CHANNEL_TYPES.GUILD_TEXT,
        topic: "Automated site updates, datamines & patch delta feeds.",
        readOnly: true,
      },
    ],
  },
  {
    name: "🔊 ── VOICE CHANNELS ──",
    channels: [
      {
        name: "🎙️ Wasteland Lounge",
        type: CHANNEL_TYPES.GUILD_VOICE,
      },
      {
        name: "🎮 Strike Team Comms",
        type: CHANNEL_TYPES.GUILD_VOICE,
      },
    ],
  },
];

async function main() {
  console.log(`\n🚀 Initializing R.O.L.L. Community Server Architect for Guild: ${targetGuildId}`);

  // 1. Fetch current server details
  const guild = await discordFetch<{ name: string; owner_id: string }>(`/guilds/${targetGuildId}`);
  console.log(`🏰 Connected to Server: "${guild.name}" (Owner ID: ${guild.owner_id})\n`);

  // 2. Fetch existing channels
  const existingChannels: DiscordChannel[] = await discordFetch(`/guilds/${targetGuildId}/channels`);
  console.log(`Found ${existingChannels.length} existing channels/categories in server.`);

  // Find @everyone role ID (same as guild ID in Discord)
  const everyoneRoleId = targetGuildId;

  // Track created channel IDs for posting embeds
  let welcomeChannelId: string | null = null;
  let rulesChannelId: string | null = null;

  // 3. Process categories and channels
  for (const catConfig of SERVER_BLUEPRINT) {
    let category = existingChannels.find(
      (c) => c.type === CHANNEL_TYPES.GUILD_CATEGORY && c.name.toLowerCase() === catConfig.name.toLowerCase()
    );

    if (!category) {
      console.log(`📁 Creating Category: "${catConfig.name}"...`);
      category = await discordFetch(`/guilds/${targetGuildId}/channels`, {
        method: "POST",
        body: JSON.stringify({
          name: catConfig.name,
          type: CHANNEL_TYPES.GUILD_CATEGORY,
        }),
      });
      // Small delay to prevent rate limits
      await new Promise((r) => setTimeout(r, 300));
    } else {
      console.log(`✔ Category already exists: "${catConfig.name}"`);
    }

    for (const chConfig of catConfig.channels) {
      const existing = existingChannels.find(
        (c) => c.name.toLowerCase() === chConfig.name.toLowerCase() && c.parent_id === category?.id
      );

      if (existing) {
        console.log(`   ✔ Channel already exists: "${chConfig.name}"`);
        if (chConfig.name.includes("welcome")) welcomeChannelId = existing.id;
        if (chConfig.name.includes("rules")) rulesChannelId = existing.id;
        continue;
      }

      console.log(`   🔨 Creating Channel: "${chConfig.name}"...`);

      // Permissions: Deny Send Messages for @everyone if readOnly
      const permissionOverwrites = chConfig.readOnly
        ? [
            {
              id: everyoneRoleId,
              type: 0, // role
              deny: "2048", // SEND_MESSAGES
              allow: "66560", // VIEW_CHANNEL + READ_MESSAGE_HISTORY
            },
          ]
        : [];

      const createdChannel: DiscordChannel = await discordFetch(`/guilds/${targetGuildId}/channels`, {
        method: "POST",
        body: JSON.stringify({
          name: chConfig.name,
          type: chConfig.type,
          parent_id: category?.id,
          topic: chConfig.topic,
          permission_overwrites: permissionOverwrites,
        }),
      });

      if (chConfig.name.includes("welcome")) welcomeChannelId = createdChannel.id;
      if (chConfig.name.includes("rules")) rulesChannelId = createdChannel.id;

      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // 4. Post Welcome Embed if welcome channel exists
  if (welcomeChannelId) {
    console.log(`\n📄 Posting Vault-Tec Welcome Embed to #welcome-and-roles...`);
    try {
      await discordFetch(`/channels/${welcomeChannelId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          embeds: [
            {
              title: "📻 WELCOME TO THE R.O.L.L. COMMUNITY VAULT",
              url: "https://fallout76.wiki",
              description:
                "Welcome to the official Discord home for **R.O.L.L. (Record Of Legendary Loadouts)**!\n\n" +
                "Whether you're crafting legendary box mods, fine-tuning your perk card deck, or testing damage numbers in the B.U.I.L.D. sandbox, this server is dedicated to Fallout 76 mechanics, theorycrafting, and wasteland survival.",
              color: 0xf59e0b, // Vault-Tec Amber Gold
              fields: [
                {
                  name: "🌐 Live Platform Links",
                  value:
                    "• **Home & Effect Tracker**: [fallout76.wiki](https://fallout76.wiki)\n" +
                    "• **B.U.I.L.D. Sandbox**: [fallout76.wiki/build](https://fallout76.wiki/build)\n" +
                    "• **P.E.R.K. Deck Deckbuilder**: [fallout76.wiki/perks](https://fallout76.wiki/perks)\n" +
                    "• **Combat Firepower Matrix**: [fallout76.wiki/calculator](https://fallout76.wiki/calculator)",
                  inline: false,
                },
                {
                  name: "🤖 Integrated Discord Bot Commands",
                  value:
                    "Try using slash commands in <#123456> or anywhere in the server:\n" +
                    "`/effect` · Search 148+ legendary effects & star ranks\n" +
                    "`/craft` · View Tinkerer's Bench crafting materials\n" +
                    "`/perk` · Search all 319 official Vault Boy perk cards\n" +
                    "`/scrip` · Calculate legendary module & scrip costs\n" +
                    "`/daily` · Live Daily Reset & Minerva countdowns",
                  inline: false,
                },
                {
                  name: "🧭 Getting Started",
                  value:
                    "1. Check out <#rules-and-guidelines> for server etiquette.\n" +
                    "2. Say hello in <#general-lounge>.\n" +
                    "3. Share your build codes in <#build-theorycraft>!",
                  inline: false,
                },
              ],
              footer: {
                text: "Vault-Tec Certified · Pip-Boy Synchronized · fallout76.wiki",
                icon_url: "https://fallout76.wiki/favicon-v3.png",
              },
            },
          ],
        }),
      });
      console.log("✔ Welcome embed posted successfully.");
    } catch (e) {
      console.warn("Could not post welcome embed:", e);
    }
  }

  // 5. Post Rules Embed if rules channel exists
  if (rulesChannelId) {
    console.log(`\n📄 Posting Rules Embed to #rules-and-guidelines...`);
    try {
      await discordFetch(`/channels/${rulesChannelId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          embeds: [
            {
              title: "📜 COMMUNITY RULES & GUIDELINES",
              description:
                "To ensure a helpful, high-signal environment for all wastelanders, please adhere to these core principles:",
              color: 0x10b981, // Terminal Green
              fields: [
                {
                  name: "1. Respect & Clean Conduct",
                  value: "Treat fellow vault dwellers with respect. No harassment, hate speech, or toxicity.",
                  inline: false,
                },
                {
                  name: "2. Fair & Honest Trading",
                  value: "Keep mod box trades in <#trading-post>. Real-money trading (RMT) or scamming is strictly prohibited.",
                  inline: false,
                },
                {
                  name: "3. Keep Channels Organized",
                  value: "Post build theories in <#build-theorycraft>, tech discussions in <#tech-and-homelab>, and bot commands in <#bot-commands>.",
                  inline: false,
                },
                {
                  name: "4. No Game Exploits or Harmful Bugs",
                  value: "Discussing game mechanics and verified datamines is welcomed; sharing harmful duplication exploits is not.",
                  inline: false,
                },
                {
                  name: "5. Official Bethesda Fan Content Policy",
                  value: "Fallout 76 and related trademarks belong to Bethesda Softworks / ZeniMax Media. R.O.L.L. is an independent community fan tool.",
                  inline: false,
                },
              ],
              footer: {
                text: "Overseer Directives · R.O.L.L. Community",
                icon_url: "https://fallout76.wiki/favicon-v3.png",
              },
            },
          ],
        }),
      });
      console.log("✔ Rules embed posted successfully.");
    } catch (e) {
      console.warn("Could not post rules embed:", e);
    }
  }

  console.log("\n🎉 Community Discord Server provisioning complete! All channels and embeds are ready.");
}

main().catch((err) => {
  console.error("❌ Fatal Error in Server Provisioner:", err);
  process.exit(1);
});
