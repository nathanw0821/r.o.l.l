# 🤖 R.O.L.L. Discord Bot & Slash Commands Integration

Integrate **R.O.L.L.** directly into any Fallout 76 Discord server.

---

## ⚡ Quick Setup Instructions

### 1. Set the Interactions Endpoint URL
1. Go to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Select your **R.O.L.L.** Application.
3. On the **General Information** page, set **INTERACTIONS ENDPOINT URL** to:
   ```
   https://fallout76.wiki/api/discord/interactions
   ```
4. Click **Save Changes**. Discord will automatically send a verification ping to `https://fallout76.wiki/api/discord/interactions` and mark it as **Verified** ✅.

---

### 2. Generate the Bot Invite URL
1. Go to **OAuth2 → URL Generator** in the left sidebar menu.
2. Under **Scopes**, check:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, check:
   - `Send Messages`
   - `Embed Links`
   - `Use External Emojis`
4. Copy the generated **Invite URL** at the bottom and open it in your browser to invite the bot to your Discord server!

---

### 3. Register Slash Commands
Run the registration script using Node/tsx to register `/effect`, `/scrip`, `/build`, `/compare`, `/progress`, and `/random` across Discord:

```bash
npx tsx scripts/register-discord-commands.ts
```

Or make a direct PUT request to the Discord API:

```bash
curl -X PUT "https://discord.com/api/v10/applications/1530017912520445962/commands" \
  -H "Authorization: Bot <YOUR_DISCORD_BOT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "effect",
      "description": "Look up any Fallout 76 legendary mod effect, star rank, materials & math",
      "options": [{ "name": "query", "description": "Mod name (e.g. Bloodied, Unyielding, VATS Optimized, WWR)", "type": 3, "required": true }]
    },
    {
      "name": "scrip",
      "description": "Calculate modular legendary crafting scrip cost breakdown",
      "options": [{ "name": "mods", "description": "Number of legendary box modifications (1 to 50)", "type": 4, "required": true }]
    },
    {
      "name": "build",
      "description": "Fetch a 1:1 B.U.I.L.D. character loadout transmission from fallout76.wiki",
      "options": [{ "name": "slug", "description": "Build loadout slug or link (e.g. b-u-i-l-d-loadout-33ded6)", "type": 3, "required": true }]
    },
    {
      "name": "compare",
      "description": "Compare two legendary mod effects side-by-side",
      "options": [
        { "name": "first", "description": "First legendary effect name or shorthand", "type": 3, "required": true },
        { "name": "second", "description": "Second legendary effect name or shorthand", "type": 3, "required": true }
      ]
    },
    {
      "name": "progress",
      "description": "Look up a R.O.L.L. user's public tracker progress & completion rank",
      "options": [{ "name": "username", "description": "R.O.L.L. username", "type": 3, "required": true }]
    },
    {
      "name": "random",
      "description": "Generate a random 3★ or 4★ Fallout 76 legendary god-roll challenge",
      "options": [
        { "name": "category", "description": "Filter by Weapon or Armor", "type": 3, "required": false, "choices": [{ "name": "Weapon", "value": "weapon" }, { "name": "Armor", "value": "armor" }] }
      ]
    }
  ]'
```

---

## 🎮 Available Discord Slash Commands

| Command | Description | Example |
| :--- | :--- | :--- |
| `/effect <query>` | Look up any 1★–4★ legendary effect, star rank, materials & math | `/effect Bloodied` |
| `/compare <first> <second>` | Compare two legendary mod effects side-by-side | `/compare Bloodied Anti-Armor` |
| `/scrip <mods>` | Calculate modular legendary crafting scrip & module costs | `/scrip 5` |
| `/build <slug>` | Embedded 1:1 B.U.I.L.D. loadout card & stats | `/build b-u-i-l-d-loadout-33ded6` |
| `/progress <username>` | Look up a R.O.L.L. user's public tracker progress & rank badge | `/progress VaultDweller` |
| `/random [category]` | Generate a random 3★ or 4★ god-roll item challenge | `/random weapon` |
