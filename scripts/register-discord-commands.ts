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
        required: true
      }
    ]
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
        required: true
      },
      {
        name: "second",
        description: "Second legendary effect name or shorthand (e.g. Anti-Armor)",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: "progress",
    description: "Look up a R.O.L.L. user's public tracker progress & completion rank",
    options: [
      {
        name: "username",
        description: "R.O.L.L. username",
        type: 3,
        required: true
      }
    ]
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
  console.log(`🚀 Registering ${commands.length} slash commands for Client ID ${CLIENT_ID}...`);
  const response = await fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}/commands`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });

  if (response.ok) {
    const data = await response.json();
    console.log("✅ Successfully registered slash commands with Discord API!");
    console.log(`Registered ${data.length} commands.`);
  } else {
    const errorText = await response.text();
    console.error("❌ Failed to register commands:", response.status, errorText);
  }
}

register();
