import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1530017912520445962";

if (!BOT_TOKEN) {
  console.error("❌ Missing DISCORD_BOT_TOKEN in environment!");
  process.exit(1);
}

const commands = [
  {
    name: "effect",
    description: "Look up any Fallout 76 legendary mod effect, star rank, materials & math",
    options: [
      {
        name: "query",
        description: "Mod name or shorthand (e.g. Bloodied, Unyielding, VATS Optimized, WWR, 25LVC)",
        type: 3,
        required: true,
        autocomplete: true
      }
    ]
  },
  {
    name: "craft",
    description: "Look up Tinkerer's Bench crafting material requirements & acquisition for any mod",
    options: [
      {
        name: "query",
        description: "Mod name or shorthand (e.g. Pinpointer's, Bloodied, Unyielding, WWR)",
        type: 3,
        required: true,
        autocomplete: true
      }
    ]
  },
  {
    name: "daily",
    description: "View live Fallout 76 Daily Reset countdowns & Minerva's location status",
    options: []
  },
  {
    name: "scrip",
    description: "Calculate modular legendary crafting scrip & module cost breakdown",
    options: [
      {
        name: "mods",
        description: "Number of legendary box modifications (1 to 50)",
        type: 4,
        required: true
      }
    ]
  },
  {
    name: "build",
    description: "Fetch a 1:1 B.U.I.L.D. character loadout transmission from fallout76.wiki",
    options: [
      {
        name: "slug",
        description: "Build loadout slug or link (e.g. b-u-i-l-d-loadout-33ded6)",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "compare",
    description: "Compare two legendary mod effects side-by-side",
    options: [
      {
        name: "first",
        description: "First legendary effect name or shorthand (e.g. Bloodied)",
        type: 3,
        required: true,
        autocomplete: true
      },
      {
        name: "second",
        description: "Second legendary effect name or shorthand (e.g. Anti-Armor)",
        type: 3,
        required: true,
        autocomplete: true
      }
    ]
  },
  {
    name: "progress",
    description: "Look up a R.O.L.L. user's public tracker progress (or leave blank for your linked account)",
    options: [
      {
        name: "username",
        description: "R.O.L.L. username (optional if your Discord is linked)",
        type: 3,
        required: false
      }
    ]
  },
  {
    name: "perk",
    description: "Look up Fallout 76 perk cards, S.P.E.C.I.A.L. categories, costs & rank stats",
    options: [
      {
        name: "query",
        description: "Perk card name (e.g. Heavy Gunner, Commando, Serendipity, Adrenaline)",
        type: 3,
        required: true,
        autocomplete: true
      },
      {
        name: "rank",
        description: "Specific rank level (1 to 5)",
        type: 4,
        required: false
      }
    ]
  },
  {
    name: "rules",
    description: "Display official Vault-Tec Community Rules & Code of Conduct",
    options: []
  },
  {
    name: "random",
    description: "Generate a random 3★ or 4★ Fallout 76 legendary god-roll challenge",
    options: [
      {
        name: "category",
        description: "Filter by Weapon or Armor",
        type: 3,
        required: false,
        choices: [
          { name: "Weapon", value: "weapon" },
          { name: "Armor", value: "armor" }
        ]
      }
    ]
  }
];

async function register() {
  const guildId = process.env.DISCORD_GUILD_ID;
  console.log(`🚀 Registering ${commands.length} slash commands for Application ID ${CLIENT_ID}...`);

  // 1. Global Command Registration
  const globalRes = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });

  if (globalRes.ok) {
    const data = await globalRes.json();
    console.log(`✅ Global Commands Registered (${data.length} commands).`);
  } else {
    console.error("❌ Global registration error:", await globalRes.text());
  }

  // 2. Guild-Specific Instant Registration (if DISCORD_GUILD_ID is set or passed as arg)
  const targetGuild = guildId || process.argv[2];
  if (targetGuild) {
    console.log(`⚡ Instant Guild Registration for Server ID ${targetGuild}...`);
    const guildRes = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${targetGuild}/commands`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commands)
    });
    if (guildRes.ok) {
      const data = await guildRes.json();
      console.log(`⚡ Instant Server Commands Registered (${data.length} commands).`);
    } else {
      console.error("❌ Guild registration error:", await guildRes.text());
    }
  }
}

register();
