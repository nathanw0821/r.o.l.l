export interface WikiArticleItem {
  id: string | number;
  source: string;
  title: string;
  url: string;
  category: string;
  snippet: string;
  content: string;
  main_image?: string;
}

export const FALLBACK_WIKI_ARTICLES: WikiArticleItem[] = [
  {
    "id": "patch-1-7-11-12",
    "source": "Bethesda Official",
    "title": "Fallout 76 Update Version 1.7.11.12 (April 30, 2024)",
    "url": "https://fallout.bethesda.net/en/article/patch-notes-april-30-2024",
    "category": "Build Mechanics & Damage",
    "snippet": "Official patch notes for Version 1.7.11.12 featuring Cremator DoT rebalance, vendor Max buy/sell option, weapon Ammo Per Shot stat, and bug fixes.",
    "content": "### Fallout 76 Patch Notes - Version 1.7.11.12 (April 30, 2024)\n\n#### Download Sizes\n* **PC (Steam)**: 12.1 GB\n* **PC (Microsoft Store)**: 19.8 GB\n* **Xbox**: 23.1 GB\n* **PlayStation**: 19.2 GB\n\n---\n\n#### Weapons & Cremator Rebalance\n* **Cremator Explosive Bug Fix & Damage Over Time (DoT) Buff**:\n  * *Dev Note*: The Cremator released with a bug that made it stronger than intended due to how damage was calculated with its explosion. Certain perks and mods caused damage much higher than intended. We fixed that bug, which decreased damage for that specific setup, but made multiple tweaks to buff it in different ways. Now, the Damage Over Time (DoT) is a true force to be reckoned with!\n\n---\n\n#### Quality of Life Updates\n* **Max Option for Vendors**: Added a **Max** option when buying from and selling to NPC vendors.\n* **World Activity Sorting**: The World Activity list now sorts alphabetically for easier navigation.\n* **Inventory Scrollbar**: Improved responsiveness and behavior of the inventory scrollbar.\n* **Ammo Per Shot Stat**: Added a new **Ammo Per Shot** stat entry to weapon detail cards.\n\n---\n\n#### Seasonal Events\n* **Repeatable Plan Drops & Trading**: Recipes and plans dropped by seasonal events will continue to drop after you have learned them. These plans are now tradeable to help players complete their collections!\n"
  },
  {
    "id": 5,
    "source": "NukaKnights",
    "title": "Fallout 76 Community Events & Seasonal Calendar Guide",
    "url": "https://nukaknights.com/events-kalender.html",
    "category": "Events & Expeditions",
    "snippet": "Comprehensive guide to rotating weekend events (Double XP, Scrip Surplus, Gold Rush, Mutated Events) and seasonal public events in Fallout 76.",
    "content": "# Fallout 76 Community Events & Seasonal Calendar Guide\n\nFallout 76 features a dynamic rotation of recurring weekend modifiers, mutated public events, and seasonal holiday festivals.\n\n---\n\n### 📅 Recurring Weekend Modifiers\n* **Double XP Weekend**: 100% bonus experience gained from all enemy kills, quests, and events. Stacks additively with Lunchboxes (+100%), Well Rested (+5%), and Food Buffs (+25%).\n* **Scrip Surplus**: Doubles the daily scrip limit at Legendary Exchange Machines from **500 Scrip to 1,000 Scrip** per day.\n* **Gold Rush**: Doubles the daily Treasury Note redemption limit at Gold Press Machines from **400 Gold Bullion (40 Notes) to 800 Gold Bullion (80 Notes)**.\n* **Caps-A-Plenty**: Doubles NPC vendor pool caps from **1,400 Caps to 2,800 Caps** per day.\n* **Double Mutations Weekend**: Public events feature enemies with two simultaneous mutations (e.g., Reflective Skin + Volatile Explosive), rewarding extra Mutated Party Packs.\n\n---\n\n### 🎃 Major Seasonal Events\n1. **Mothman Equinox** (Point Pleasant): Defend pyres, kill cultists, and commune with the Wise Mothman for a +15% XP blessing and exclusive apparel/plans.\n2. **Invaders from Beyond**: Defend extraction points across Appalachia against Zeta alien invaders, earning Alien Disintegrator, Blaster, and Electro Enforcer weapon plans.\n3. **Fasnacht Day** (Helvetia): Escort protectron marchers to burn the Old Man Winter effigy, earning rare glowing and standard Fasnacht masks.\n4. **Meat Week & Grahm's Cook-Out**: Harvest Prime Meat across Appalachia and help Grahm prepare Chally's feast for unique CAMP recipes and weapon plans.\n5. **Spooky & Holiday Scorched**: Hunt costumed Scorched in the exterior wasteland for Mystery Bags and Holiday Gifts containing rare vintage water coolers, plushies, and plans.\n"
  },
  {
    "id": 7,
    "source": "NukaKnights",
    "title": "Action Points (AP) Regeneration & Canned Coffee Stacking Guide",
    "url": "https://nukaknights.com/fallout-76-aktionspunkte-ap-beschleunigungs-rechner.html",
    "category": "Build Mechanics & Damage",
    "snippet": "In-depth breakdown of AP regeneration mechanics, Powered armor effects, Action Boy/Girl formulas, and Canned Coffee AP burst stacking.",
    "content": "# Action Points (AP) Regeneration & Canned Coffee Stacking Guide\n\nAction Points (AP) dictate sprinting, jumping in Power Armor, executing heavy melee power attacks, and aiming in V.A.T.S.\n\n---\n\n### ⚡ Baseline AP Regeneration Formula\n* **Base AP Recovery**: By default, your character recovers **6% of your total maximum AP pool per second** while not performing AP-draining actions.\n* **Agility Impact**: Higher Agility increases your total maximum AP pool (10 AP per Agility point), which naturally increases the flat amount of AP recovered every second.\n\n---\n\n### 🛡️ Gear & Perk AP Recovery Bonuses\n1. **Powered Legendary Armor Mod (2★)**: Adds **+5 AP per second** of flat regeneration per piece. Stacking 5 pieces grants a massive **+25 AP/sec** passive recovery.\n2. **Action Boy / Action Girl (Agility Perk)**:\n   * Rank 1: +15% AP regen speed\n   * Rank 2: +30% AP regen speed\n   * Rank 3: +45% AP regen speed\n3. **Lone Wanderer (Charisma Perk)**: Grants +30% AP regen when playing solo.\n4. **Nerd Rage! (Intelligence Perk)**: Grants +15% AP regen when health drops below 20%.\n5. **Company Tea (Food Buff)**: Grants +25% AP regen (+50% with Herbivore, +62.5% with Herbivore + Strange in Numbers) for 60 minutes.\n\n---\n\n### ☕ Canned Coffee & AP Burst Stacking\n* **How it works**: Unlike standard food buffs that do not stack with themselves, **Canned Coffee stacks multiplicatively with every can consumed**.\n* **Burst Effect**: Consuming 10–15 Canned Coffees in rapid succession restores up to **300–450 AP per second**, effectively allowing continuous, non-stop V.A.T.S. critical fire against raid bosses like the Scorchbeast Queen or Earle Williams without running out of stamina.\n"
  },
  {
    "id": 8,
    "source": "NukaKnights",
    "title": "Fallout 76 Frequently Asked Questions & Legendary Crafting Guide",
    "url": "https://nukaknights.com/fallout-76-faq.html",
    "category": "Weapons & Legendary Mods",
    "snippet": "Essential FAQ covering 1★ to 4★ Legendary Crafting, Scrip and Module currency limits, and Season reset timelines.",
    "content": "# Fallout 76 FAQ & Legendary Crafting Guide\n\n### 🛠️ How Does Legendary Crafting (Milepost Zero & Beyond) Work?\n* **Box Mods vs. Crafting Plans**:\n  * When scrapping legendary gear at a workbench, you have a **1.0% chance to permanently learn the recipe** to craft that legendary mod box, and a **1.5% chance to receive a loose Box Mod**.\n  * Loose Box Mods are tradeable with other players and can be slotted into weapons and armor at any time.\n* **Legendary Modules**:\n  * Tier 1 (1★) Mod Crafting: Costs **15 Legendary Modules** + specific base crafting ingredient (e.g., Blood Pack for Bloodied).\n  * Tier 2 (2★) Mod Crafting: Costs **30 Legendary Modules**.\n  * Tier 3 (3★) Mod Crafting: Costs **60 Legendary Modules**.\n  * Tier 4 (4★) Mod Crafting: Costs **120 Legendary Modules** + Vault 94 / Radiant Depths Raid reagents.\n\n---\n\n### 💰 Currency Limits & Caps\n* **Legendary Scrip**: Character cap is **11,000 Scrip**. Daily exchange machine limit is **500 Scrip** (1,000 on Scrip Surplus weekends).\n* **Caps**: Character cap is **40,000 Caps**. Daily NPC vendor pool is **1,400 Caps**.\n* **Gold Bullion**: Character cap is **10,000 Gold Bullion**. Daily exchange limit is **400 Bullion (40 Treasury Notes)**.\n* **Stash Box**: Standard limit is **1,200 lbs** across all items.\n"
  },
  {
    "id": 12,
    "source": "NukaKnights",
    "title": "Minerva Merchant Schedule, Locations & 24-List Inventory Guide",
    "url": "https://nukaknights.com/minerva.html",
    "category": "Vendors & Minerva Sales",
    "snippet": "Complete guide to Minerva's 25% Gold Bullion discounts, rotating camp locations, and full 24-list inventory rotation.",
    "content": "# Minerva Merchant Schedule, Locations & 24-List Inventory Guide\n\nMinerva is a traveling Gold Bullion merchant who sells rare plans at a **flat 25% discount** compared to Regs (Vault 79), Samuel (Foundation), and Mortimer (Crater).\n\n---\n\n### 📍 Minerva's 4 Rotating Locations\n1. **Foundation**: Outside the main gate, just past the bridge on the right-hand path.\n2. **The Crater**: Directly to the left of the Crater Core interior elevator entrance.\n3. **Fort Atlas**: Outside in the main courtyard, to the right of the front entrance stairs.\n4. **The Whitespring Resort**: Outside the exterior main entrance near the fountain.\n\n---\n\n### ⏰ Weekly Schedule & Super Sales\n* **Standard Sales (Lists 1–3, 5–7, 9–11, etc.)**:\n  * Arrives **Monday at 12:00 PM EST** (daily reset).\n  * Leaves **Wednesday at 12:00 PM EST**.\n  * Features a focused selection of ~10–12 discounted plans.\n* **Minerva's Super Sale (Lists 4, 8, 12, 16, 20, 24)**:\n  * Arrives **Thursday at 12:00 PM EST**.\n  * Leaves **Monday at 12:00 PM EST** (runs for 4 full days).\n  * Combines all items from the preceding 3 weeks into one massive super-inventory.\n\n---\n\n### 📋 Key Plans Sold by Minerva\n* **Secret Service Armor & Jetpack**: Secret Service Torso, Legs, Arms, Buttressed lining, and Jetpack Plan.\n* **Heavy & Energy Weapons**: Gauss Minigun, Gauss Shotgun, Plasma Caster, Crusader Pistol, and Hellstorm Missile Launcher.\n* **Power Armor Sets**: T-65 Power Armor pieces and Hellcat mod plans.\n* **Legacy Daily Ops & Nuclear Winter Items**: Brotherhood Recon Armor, Solar Armor, Thorn Armor, and vintage CAMP rewards.\n"
  },
  {
    "id": 14,
    "source": "NukaKnights",
    "title": "Fallout 76 Seasons, Roadmaps & Update History Archive",
    "url": "https://nukaknights.com/roadmap.html",
    "category": "Events & Expeditions",
    "snippet": "Comprehensive archive of Fallout 76 major milestone updates, expansions, and seasonal scoreboards from launch to present.",
    "content": "# Fallout 76 Seasons & Update History Archive\n\nA chronological overview of every major expansion, world overhaul, and seasonal milestone in Fallout 76.\n\n---\n\n### 📜 Major Content Milestones\n* **Wastelanders (April 2020)**: Introduced living human NPCs, full dialogue trees, Settlers of Foundation, Raiders of Crater, Vault 79 gold heist, and the Gold Bullion economy.\n* **The Legendary Run (June 2020)**: Launched the 100-rank Seasonal Scoreboard system replacing daily/weekly atom challenges.\n* **One Wasteland For All (September 2020)**: Dynamic enemy level scaling across all regions, allowing low and high level players to team up anywhere.\n* **Steel Dawn & Steel Reign (2020–2021)**: The Appalachian Brotherhood of Steel story arc at Fort Atlas, introducing Knight Shin and Paladin Rahmani.\n* **Locked & Loaded (April 2021)**: Introduced the Punch Card Machine for instant SPECIAL and Perk Loadout switching, plus second CAMP slots.\n* **Expeditions: The Pitt & Atlantic City (2022–2024)**: Repeatable off-map instanced missions with Stamps currency, Lennox vertibird travel, and Union Power Armor.\n* **Skyline Valley (June 2024)**: The first true map expansion southward into Shenandoah, introducing Vault 63, the Lost, and Hugo Stolz.\n* **Milepost Zero & Legendary Crafting (September 2024)**: Complete overhaul of legendary gear with learned box mod crafting and caravan trading routes.\n* **Radiant Depths & 4-Star Gear (December 2024+)**: Introduced 4-star legendary effects, high-tier raid dungeons, and the playable Ghoul race transition.\n"
  },
  {
    "id": 31,
    "source": "TheDuchessFlame",
    "title": "Burning Springs Abraxodyne Intel Briefcase Locations",
    "url": "https://www.theduchessflame.com/post/burning-springs-abraxodyne-intel-briefcase-locations-29-to-45",
    "category": "Weapons & Legendary Mods",
    "snippet": "Step-by-step route guide for collecting Abraxodyne Intel Briefcases across Burning Springs and unlocking unique weapon plans.",
    "content": "# Burning Springs: Abraxodyne Intel Briefcase Locations\n\nThis optimized route guides you through briefcases 29 through 45 across Burning Springs to obtain all Abraxo weapon blueprints.\n\n---\n\n### 💼 Fast Travel & Spawns Route\n1. **Sandy's Sock Hop (Briefcase 29)**: Enter diner front door, face south behind the counter on the floor.\n2. **Collapsed Road Tunnel (Briefcase 30)**: Follow main road west to the end of the collapsed tunnel next to the blue Abraxo barrels.\n3. **Water Tower Shed (Briefcase 31)**: Level 0 lockpick at the base of the water tower console.\n4. **Hocking Hills Station (Briefcase 32–35)**: Inside the train station waiting seats and adjacent orange train carriage.\n5. **Jackson Junkyard (Briefcase 43–45)**: Stored inside the open truck trailer and green tool shed on the south wall.\n"
  },
  {
    "id": 32,
    "source": "TheDuchessFlame",
    "title": "Burning Springs Head Hunt Bosses & Mechanics",
    "url": "https://www.theduchessflame.com/post/burning-springs-head-hunt-bosses-group-7",
    "category": "Weapons & Legendary Mods",
    "snippet": "Boss stats, signature legendary weapon mods, and sidekick group abilities for Burning Springs Head Hunt encounters.",
    "content": "# Burning Springs Head Hunt Bosses & Mechanics\n\nEach Head Hunt encounter features unique boss weapon mods and coordinated gang mechanics.\n\n---\n\n### ⚔️ Featured Bosses\n* **Amadi the Piranha**: Wields an Anti-Armor Fishing Tesla Rifle with the Hooked! mod (pulls players closer and reduces movement speed by 90%). Supported by Hostile Fishermen using Cryo Harpoon Guns.\n* **Gentle Gary**: Uses a Flatliner Gauss Rifle with Assassin's and V.A.T.S. Enhanced modifiers (+40% reload speed).\n* **Scout Leader Karen**: Uses a Rapid Anti-Armor Crossbow with Poison Frame and active Swift-Footed stealth cloaking.\n* **The Foreman**: Fires a Two-Shot Quad Auto Grenade Launcher (+300% bonus explosive damage).\n"
  },
  {
    "id": 33,
    "source": "TheDuchessFlame",
    "title": "Food Buff: Pickled Prickeye Stats & Recipes",
    "url": "https://www.theduchessflame.com/post/food-buff-pickled-prickeye",
    "category": "Perks & Mutations",
    "snippet": "AP regen values, Herbivore scaling, spoil rates, and crafting requirements for Pickled Prickeye.",
    "content": "# Food Buff: Pickled Prickeye\n\n* **Base Buff**: +2% AP Regen (15 mins)\n* **Herbivore Mutation**: +4% AP Regen\n* **Herbivore + Strange in Numbers**: **+5% AP Regen** (15 mins)\n* **Crafting Requirements**: 1x Boiled Water, 1x Salt, 1x Spices, 2x Prickeye.\n* **Weight**: 0.25 lbs\n* **Stacking Rule**: Acts as an AP food buff; stacks with all Chems, Bobbleheads, and Alcohol.\n"
  },
  {
    "id": 34,
    "source": "TheDuchessFlame",
    "title": "Collectron Station: Peppino the Clown",
    "url": "https://www.theduchessflame.com/post/collectron-station-peppino-the-clown",
    "category": "Build Mechanics & Damage",
    "snippet": "Production rates, loot drop tables, and CAMP budget information for Peppino the Clown Collectron.",
    "content": "# Collectron Station: Peppino the Clown\n\n* **Item Drops**: Toy Cars, Accordions, Gum Drops, Pepperoni Rolls, Rat Poison, Bowling Pins.\n* **Production Rate**: 1 item every 9 minutes.\n* **CAMP Budget Cost**: 5 Flamingo Units.\n* **Storage Capacity**: 10 lbs.\n* **Power Required**: None.\n"
  },
  {
    "id": 35,
    "source": "TheDuchessFlame",
    "title": "VATS Hit Chance & Accuracy Mechanics Explained",
    "url": "https://www.theduchessflame.com/post/vats-hit-chance-explained",
    "category": "Weapons & Legendary Mods",
    "snippet": "Detailed breakdown of range falloff, line of sight, body part penalties, and how Perception affects VATS accuracy.",
    "content": "# VATS Hit Chance & Accuracy Mechanics Explained\n\nVATS calculates hit probabilities starting at 95% maximum and applies situational penalties.\n\n---\n\n### 🎯 Core Accuracy Factors\n* **Distance & Range**: Firing within 50% of listed weapon range suffers zero penalty. Beyond maximum range, hit chance drops to 0% and damage is reduced by 50%.\n* **Line of Sight**: Obstructed limbs behind cover or body mass cannot be targeted.\n* **Cone of Fire & Recoil**: Automatic fire increases spread cone and lowers consecutive VATS accuracy.\n* **Perception Impact**: Each point of Perception passively increases base hit probability across all ranges.\n"
  },
  {
    "id": 36,
    "source": "TheDuchessFlame",
    "title": "Collectron: Cobby Collectron Station",
    "url": "https://www.theduchessflame.com/post/collectron-cobby-collectron-station",
    "category": "Crafting & Materials",
    "snippet": "Loot table, corn pone/soup drop chances, and CAMP stats for the Cobby Collectron.",
    "content": "# Collectron: Cobby Collectron Station\n\n* **Drops**: Corn Pone (12.8%), Sweet Tato Stew (14.5%), Silt Beans (14.5%), Pumpkin (13.1%), Corn Soup (5.0%), Melon Juice (10.6%).\n* **Rate**: 1 item every 10 minutes 12 seconds.\n* **Budget Cost**: 5 Flamingo Units.\n"
  },
  {
    "id": 37,
    "source": "TheDuchessFlame",
    "title": "Science Perk Card Scaling Curve Guide",
    "url": "https://www.theduchessflame.com/post/science-perk-card-curve-calculator",
    "category": "Perks & Mutations",
    "snippet": "Energy damage scaling per Intelligence point and soft cap thresholds for Science perks.",
    "content": "# Science Perk Card Scaling Curve Guide\n\n* **INT 1–15**: +1.0% energy damage bonus per INT point.\n* **INT 16–30**: +0.8% energy damage bonus per INT point.\n* **INT 31–60**: +0.5% energy damage bonus per INT point.\n* **INT 60+ (Soft Cap)**: Diminishing returns slow to +0.1% energy damage bonus per point.\n* **Optimal Energy Build Range**: INT 30 to INT 50.\n"
  },
  {
    "id": 38,
    "source": "TheDuchessFlame",
    "title": "Master Herbivore Buffs & Plant Farming Routes",
    "url": "https://www.theduchessflame.com/blog/categories/herbivore-farming-guides",
    "category": "Perks & Mutations",
    "snippet": "Full harvesting routes for Starlight Berries, Cranberries, Blight, and essential Herbivore XP and Critical Damage recipes.",
    "content": "# Master Herbivore Buffs & Plant Farming Routes\n\nThe **Herbivore mutation doubles all benefits gained from eating plant-based foods and soups** while removing all meat benefits. When combined with the **Strange in Numbers** perk on a team, bonuses increase by **+25% additional effectiveness**.\n\n---\n\n### 🍲 Essential Herbivore Endgame Recipes\n1. **Brain Bombs**:\n   * Base: +3 INT\n   * Herbivore + Strange in Numbers: **+8 INT** (approx. +24% passive XP bonus) for 90 minutes.\n   * Ingredients: 3x Brain Fungus, 2x Sugar Bombs (with Rads), 2x Purified Water, 1x Mothman Egg.\n2. **Cranberry Relish**:\n   * Base: +10% Bonus XP\n   * Herbivore + Strange in Numbers: **+25% Bonus XP** for 60 minutes.\n   * Ingredients: 2x Cranberries, 2x Gourds, 2x Sugar, 1x Boiled Water.\n3. **Blight Soup**:\n   * Base: +50% V.A.T.S. Critical Damage\n   * Herbivore + Strange in Numbers: **+125% V.A.T.S. Critical Damage** for 30 minutes.\n   * Ingredients: 1x Blight, 1x Boiled Water.\n4. **Company Tea**:\n   * Base: +10% AP Regen\n   * Herbivore + Strange in Numbers: **+25% AP Regen Speed** for 60 minutes.\n\n---\n\n### 🌿 Top Harvesting Routes\n* **Cranberries**: **Aaronholt Homestead** (northwest Forest) has 10–12 wild cranberry plants. **Mac's Farm** & **Sunrise Field** (Cranberry Bog) have 30+ plants (watch out for Mirelurk Queens).\n* **Blight**: Southern **Ash Heap** near Mount Blair Trainyard and abandoned mines. Look for glowing brown fungus growing on trees.\n* **Brain Fungus**: **Abandoned Waste Dump** and **Wendigo Cave** contain 40+ brain fungus nodes (use Green Thumb perk to yield 2x per harvest).\n* **Starlight Berries**: **The Deep** underground cave and the forest trails around Slocum's Joe.\n"
  },
  {
    "id": 39,
    "source": "TheDuchessFlame",
    "title": "Food, Chems & Bobbleheads Stacking Synergy Rules",
    "url": "https://www.theduchessflame.com/buffsnbrewmenu",
    "category": "Build Mechanics & Damage",
    "snippet": "Comprehensive breakdown of buff exclusivity, chem overwrites, and how to safely stack food, drinks, and magazines in Fallout 76.",
    "content": "# Food, Chems & Bobbleheads Stacking Synergy Rules\n\nOptimizing your character requires understanding which buffs stack together and which cancel each other out.\n\n---\n\n### 📜 The Golden Rules of Buff Stacking\n\n1. **Food Exclusivity**:\n   * You can have **ONE active food buff per primary attribute/stat** at a time.\n   * *Example*: Eating Cranberry Relish (+XP) and Brain Bombs (+INT) **both stay active** because one is XP and one is INT.\n   * *Conflict*: Eating Cranberry Cobbler (+5% XP) while Cranberry Relish (+25% XP) is active will overwrite the Relish.\n\n2. **Chems Exclusivity**:\n   * You can only have **ONE active Chem buff at a time**.\n   * Consuming Psychobuff (+25% Dmg, +3 STR, +3 END) will immediately cancel Berry Mentats (+5 INT).\n   * *Exception*: Overdrive can be consumed FIRST, and taking Psychotats immediately after will stack both effects for a limited time.\n\n3. **Bobbleheads & Magazines**:\n   * You can have **ONE active Bobblehead** (e.g., Leader Bobblehead for +5% XP or Small Guns Bobblehead for +20% Ballistic Dmg).\n   * You can have **ONE active Magazine** (e.g., Live & Love 3 or Guns & Bullets 3).\n\n4. **C.A.M.P. Furniture Buffs**:\n   * CAMP item buffs (Mechanical Derby +2 INT, Arm Wrestle +2 STR, Weight Bench +2 STR, Speed Bag +2 AGI) **all stack simultaneously** with all foods, chems, and bobbleheads for 30–60 minutes.\n"
  },
  {
    "id": 40,
    "source": "TheDuchessFlame",
    "title": "Seasonal Challenges, Mini-Seasons & Re-Roller Guide",
    "url": "https://www.theduchessflame.com/blog/categories/challenge-events",
    "category": "Events & Expeditions",
    "snippet": "Master daily and weekly SCORE challenges, optimize challenge re-rollers, and claim limited-time mini-season rewards.",
    "content": "# Seasonal Challenges, Mini-Seasons & Re-Roller Guide\n\nCompleting S.C.O.R.E. challenges is the primary method to unlock Season tickets, Atoms, and bonus reward pages.\n\n---\n\n### 🎯 Daily & Weekly Challenge Optimization\n* **Free Re-Rollers**: Every player receives **2 free Challenge Re-Rolls per day** at 12:00 PM EST. Additional re-rollers can be claimed from the Season board or purchased with Atoms.\n* **Epic Challenges**: Using a re-roller has a ~20% chance to convert a standard challenge into an **Epic Challenge**, granting **+50% more SCORE** upon completion.\n* **Score Boosters**: Consuming a SCORE Booster increases all challenge points earned by **+25% for 24 hours**. The best time to activate a booster is on Tuesday afternoon right before completing both the Tuesday daily and all weekly challenges simultaneously.\n\n---\n\n### 🎪 Limited-Time Mini-Seasons\n* Mini-seasons (such as *Sunset Stranger*, *Night at the Morgue*, *Spring Cleaning*, and *Burning Love*) run for 1–2 weeks.\n* They typically require crafting and equipping a free event item (e.g., *Sunset Sarsaparilla Deputy Hat* or a Halloween Costume) and completing event-specific kill or gather challenges to unlock exclusive CAMP cosmetics.\n"
  },
  {
    "id": 41,
    "source": "TheDuchessFlame",
    "title": "C.A.M.P. Pets, Taming & Animal Furniture Guide",
    "url": "https://www.theduchessflame.com/blog/categories/camp-pets",
    "category": "All Vault Records",
    "snippet": "Guide to C.A.M.P. pet furniture (German Shepherd, White Shepherd, Cats) and Animal Friend Rank 3 creature taming mechanics.",
    "content": "# C.A.M.P. Pets, Taming & Animal Furniture Guide\n\nBring companionship to your Appalachian home through decorative C.A.M.P. pet furniture and live wasteland creature taming.\n\n---\n\n### 🐕 C.A.M.P. Pet Furniture Items\n* **Canine Furniture**: German Shepherd, White Shepherd Dog, Dog Leaf Pile, and Dog Dirt Mound.\n* **Feline Furniture**: Bombay Black Cat, Grey Tabby Cat, Sphynx Cat, Cat Tree Scratching Post, and Cactus Scratching Post.\n* **Mechanics**:\n  * Cost: **5 Flamingo Units** (CAMP budget cost).\n  * Limit: 1 Pet Furniture piece per CAMP.\n  * Pets appear automatically once their dedicated furniture is placed and can wander within the CAMP radius.\n\n---\n\n### 🐾 Wasteland Creature Taming (Animal Friend Rank 3)\n* **Requirements**: Equip **Animal Friend Rank 3** under Charisma and aim a gun with no scope at a solo-spawned creature at a random encounter location.\n* **Tameable Creatures**: Deathclaw, Megasloth, Yao Guai, Mirelurk King, Radtoad, Snallygaster, Wolf, and Brahmin.\n* **Rules**:\n  * The creature must spawn **completely alone** at a random encounter spawn point (e.g., crash sites or unmarked crossroads).\n  * You must have sufficient spare CAMP budget available for the creature to travel to and guard your camp.\n"
  },
  {
    "id": 42,
    "source": "TheDuchessFlame",
    "title": "Master Weapon & Legendary Mod Farming Guide",
    "url": "https://www.theduchessflame.com/blog/categories/weapon-and-mod-farming-guides",
    "category": "Weapons & Legendary Mods",
    "snippet": "High-efficiency farming loops for legendary gear scrapping, Gatling Plasma mod plans, and top endgame armor comparisons.",
    "content": "# Master Weapon & Legendary Mod Farming Guide\n\nMaximizing your legendary plan unlocks and acquiring top endgame armor frames.\n\n---\n\n### 🔄 Legendary Scrapping Farm Loops\n* **Eviction Notice**: The highest yield event in Fallout 76, spawning up to 20–30 legendary Super Mutants. Tag every mutant to collect 15–25 legendary items per event.\n* **Expeditions (The Most Sensational Game)**: Can be completed in under 7 minutes with a solo or duo team, guaranteeing **5 legendary items, 1–2 Legendary Modules, and 20,000 XP** per run.\n* **Scrap Strategy**: Scrap all weapons and armor containing desirable 1★ effects (*Quad, Bloodied, Anti-Armor, Overeater's, Unyielding*) and 2★ effects (*Explosive, Rapid, Powered, V.A.T.S. Enhanced*) to unlock their crafting recipes.\n\n---\n\n### 🛡️ Top Endgame Body & Power Armor Frames\n1. **Civil Engineer Armor**:\n   * Acquired via the *Rose Room / Atlantic City* questline.\n   * **Set Bonus**: Grants **+35% weapon durability** to all equipped weapons and 10% chance to inflict 150 fire damage on melee attackers.\n2. **Hellcat Power Armor**:\n   * Acquired via the *Steel Reign* questline.\n   * **Passive Reduction**: Built-in **+12% flat ballistic damage reduction** (2% per piece) on top of the standard 42% Power Armor damage reduction.\n3. **Union Power Armor**:\n   * Purchased with Stamps from Giuseppe at the Whitespring Resort.\n   * **Set Bonus**: **+150 Poison Resistance** and **+75 Carry Weight**.\n"
  },
  {
    "id": 43,
    "source": "TheDuchessFlame",
    "title": "S.C.O.R.E. Daily & Weekly Challenge Speedrunning Guide",
    "url": "https://www.theduchessflame.com/blog/categories/score-challenge-guides",
    "category": "Crafting & Materials",
    "snippet": "Fastest spawn locations for common challenge targets (Stingwings, Mirelurks, Gulpers) and quick junk scrap farming.",
    "content": "# S.C.O.R.E. Daily & Weekly Challenge Speedrunning Guide\n\nComplete your weekly challenge roster in under 30 minutes with these instant fast-travel spawn locations.\n\n---\n\n### 📍 Instant Creature Spawn Points\n* **Corrosive Stingwings**: **Bleeding Kate's Grindhouse** (3 spawns) and the marsh directly east of **Whitespring Station** (3–4 spawns).\n* **Mirelurks**: **Highland Marsh** (10+ spawns including Queen), **Summersville Dam** (6 spawns), and **Ohio River Adventures**.\n* **Gulpers**: **Gulper Lagoon** (4–6 spawns hanging from trees) and the **Moonshine Jamboree** public event.\n* **Cave Crickets**: **Tanagra Town** (climb the giant tree roots into the interior town for 8–10 crickets) and **Lucky Hole Mine**.\n* **Deathclaws**: **Deathclaw Island** (1 guaranteed spawn) and **Thunder Mountain Substation TM-02** (1 guaranteed spawn fighting ants).\n\n---\n\n### 📦 Fast Junk & Scrap Harvesting\n* **Gold**: **Blackwater Mine** (mine 6 uranium/gold veins) or scrap gold pocket watches inside **The Whitespring Resort**.\n* **Lead**: **Lucky Hole Mine** (yields 1,200+ lead ore with Excavator Power Armor) and gym weight rooms at **Charleston Fire Dept**, **Greenbrier Hotel**, and **Eastern Regional Penitentiary**.\n* **Plastic**: **Morgantown High School** (gym floor has 150+ plastic pumpkins and golf balls) and **Watoga High School** cafeteria.\n"
  },
  {
    "id": 44,
    "source": "TheDuchessFlame",
    "title": "Ultimate XP & Fast Leveling Guide (1 to 1000+)",
    "url": "https://www.theduchessflame.com/blog/categories/xp-farming-guides",
    "category": "Perks & Mutations",
    "snippet": "Maximum Intelligence stacking math and the instanced West Tek Super Mutant farming loop for millions of XP per hour.",
    "content": "# Ultimate XP & Fast Leveling Guide (1 to 1000+)\n\nEvery point of Intelligence grants **+3.07% bonus experience** from all sources. By stacking SPECIAL stats, legendary armor, food, and chem buffs, players can reach **70+ Intelligence (over +215% passive XP)**.\n\n---\n\n### 🧠 The Maximum Intelligence & XP Stacking Setup\n* **Base SPECIAL**: 15 Base INT + 5 Legendary Intelligence Perk = **20 INT**.\n* **Unyielding Armor**: 5 pieces at <20% HP = **+15 INT**.\n* **Shielded Casual Underarmor**: **+3 INT**, +3 CHA, +1 LUK.\n* **Brain Bombs (Herbivore + Strange in Numbers)**: **+8 INT**.\n* **Cranberry Relish (Herbivore + Strange in Numbers)**: **+25% Flat XP**.\n* **Berry Mentats**: **+5 INT** (use Chem Fiend perk to extend duration).\n* **4x Lunchboxes**: **+100% Flat XP** (Very Well Rested).\n* **Leader Bobblehead + Live & Love 3**: **+5% XP & +50% food buff scaling**.\n* **Mechanical Derby Game (CAMP Buff)**: **+2 INT**.\n* **Casual Public Team (Bond 4/4)**: **+4 INT**.\n* **Total Experience Scaling**: Yields **4,000 max XP per level 100 Super Mutant** (the hard cap per individual kill).\n\n---\n\n### 🏰 The West Tek Interior Farming Loop\n1. Fast travel to **West Tek Research Center**.\n2. Enter the front door into the main instanced interior.\n3. Clear the main floor and laboratory Super Mutants (use Nuka Grenades with Grenadier Rank 2 and Demolition Expert Rank 5 to wipe entire wings through walls).\n4. Take the elevator down to the FEV Production Facility.\n5. Defeat the mutants below, wait 45 seconds, and take the elevator back up.\n6. The entire upper floor will instantly respawn without needing to exit the building or hop servers!\n"
  },
  {
    "id": 50,
    "source": "TheDuchessFlame",
    "title": "Fallout 76 Community Hub, Raid Callouts & Trading Etiquette",
    "url": "https://www.theduchessflame.com/fallout-76-community",
    "category": "All Vault Records",
    "snippet": "Directory of community hubs, endgame raid matchmaking callouts, and wasteland trading safety practices.",
    "content": "# Fallout 76 Community Hub & Raid Callouts\n\nAppalachia is best explored together. Connect with regional communities, raid teams, and trading networks.\n\n---\n\n### 📢 Endgame Boss & Raid Callouts\n* **Nuke Boss Priorities**: When dropping a nuke, announce the server in your community callout channel:\n  * *Scorched Earth* (Fissure Site Prime) -> Scorchbeast Queen (aim nuke slightly north to keep Drop Site V9 clean).\n  * *A Colossal Problem* (Monongah Mine) -> Earle Williams (max 8 players per instance).\n  * *Seismic Activity* (Abandoned Mine Shaft 2) -> Ultracite Titan.\n  * *Neurological Warfare* (Skyline Valley Weather Station) -> Goliath trio.\n* **Public Team Etiquette**: Join **Casual Teams** for passive +INT bonuses while farming, or **Events Teams** for +XP on event completion. Share non-conflicting 1-point perk cards (e.g., *Inspirational*, *Strange in Numbers*, *Curator*, or *Travel Agent*).\n"
  },
  {
    "id": 51,
    "source": "TheDuchessFlame",
    "title": "Fallout 76 Season 25: Appalachia Under Siege Overview",
    "url": "https://www.theduchessflame.com/blog",
    "category": "All Vault Records",
    "snippet": "Season 25 features, new CAMP resource generators, and major balance adjustments.",
    "content": "# Fallout 76 Season 25: Appalachia Under Siege Overview\n\nSeason 25 brings high-tech Enclave and military defenses to Appalachia alongside new weapon balance adjustments.\n\n---\n\n### 🎁 Featured Season Rewards\n* **Emergency Technician Repair Bot**: Automatically restores health to damaged C.A.M.P. structures over time.\n* **Peppino the Clown Collectron**: Generates party goods, pepperoni rolls, and carnival junk.\n* **Shredder Resource Station**: Converts unwanted detective files and clipboards into ballistic and adhesive crafting scrap.\n* **Bonus Ticket Pages**: Level 100+ unlocks repeatable Perk Coin packs, Legendary Modules, and Atom bundles.\n"
  }
];
