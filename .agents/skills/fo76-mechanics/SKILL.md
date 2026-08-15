---
name: fo76-mechanics
description: Official Ground-Truth Knowledge Base & Game Mechanics Validation Engine for Fallout 76. Enforces 100% adherence to live patch rules, currencies, formulas, and strict Live vs PTS segregation.
---

# 🧠 Fallout 76 Ground-Truth Mechanics Skill (R.O.L.L.)

## Overview
This skill acts as the permanent, authoritative knowledge base for all Fallout 76 game mechanics, mathematical formulas, currency caps, drop rates, and crafting costs across the R.O.L.L. platform.

---

## 🔒 Ironclad Live vs. PTS Partitioning Rule

1. **Live Data (`src/data/ground-truth/live/`)**:
   - MUST be the sole reference for standard wiki articles, mod catalogs, and user calculators.
   - Live 1★–3★ crafting: **15 / 30 / 60 Legendary Modules** required *only* when crafting learned plans at a Tinker's Workbench.
   - "Seeking" status represents player trading / drop hunting wishlist and has **0 module cost**.

2. **PTS Data (`src/data/ground-truth/pts/`)**:
   - 4-Star mods (120 modules) and experimental raid content are strictly quarantined to the `/pts` section.
   - Never reference PTS 4-star mods or unreleased balance changes in live guides or standard catalogs.

---

## 📖 Key In-Game Rebalances & Live Mechanics

### 1. Magazine Rebalances (Patch 54+ Live)
* **Live & Love 3**: Grants **+50% Health (HP) restoration** from eating plant foods. It **DOES NOT** increase stat, XP, or critical damage buff percentages.
* **Backwoodsman 6**: Grants **+50% Health (HP) restoration** from cooked meat. It **DOES NOT** increase stat or damage buff percentages.
* **Leader Bobblehead**: +5% Experience Points (XP).
* **Guns and Bullets 3**: +100% Ballistic Gun Critical Damage.
* **Tesla Science 7**: +100% Energy Gun Critical Damage.

### 2. Food, Chem, & Mutation Buff Rules
* **Herbivore Mutation**: Doubles plant food benefits (2x base). With **Strange in Numbers** on a mutated team, benefits scale to **2.5x base**:
  * **Brain Bombs**: +8 Intelligence (+24.8% XP)
  * **Cranberry Relish**: +25% Flat XP
  * **Blight Soup**: +125% VATS Critical Damage
  * **Company Tea**: +25% AP Regeneration
* **Single-Buff-Per-Stat Exclusivity**: You can only have ONE food buff active per primary stat.
* **Chem Exclusivity**: Only ONE primary chem buff can be active at a time (e.g. Berry Mentats replaces Psychotats).

### 3. Action Point & Coffee Mechanics
* **Base AP Recovery**: 6.0%/sec.
* **Powered 2★ Armor Mod**: +5.0 AP/sec flat regeneration per piece (up to +25.0 AP/sec across 5 pieces).
* **Action Boy / Action Girl**: +15% / +30% / +45% AP regeneration.
* **Canned Coffee**: +12.0 AP/sec for 25 seconds; stacks multiplicatively for uninterrupted VATS burst.

### 4. Armor & Power Armor Set Formulas
* **Power Armor Inherent Mitigations**: Flat **42% damage reduction** and flat **90% radiation reduction** applied before all armor numbers.
* **Hellcat Power Armor**: Additional +12% flat ballistic reduction (stacks to 54% total ballistic reduction).
* **Union Power Armor**: Full set grants +150 Poison Resistance and +75 Max Carry Weight.
* **Civil Engineer Armor**: Full set grants +35% Weapon Durability and 10% chance to reflect 150 Fire Damage.

### 5. Economy & Global Timers
* **Hard Caps**: 11,000 Scrip • 40,000 Caps • 10,000 Gold Bullion • 1,200 lbs Stash.
* **Daily Vendor / Exchange Limits**: 500 Scrip Exchange • 1,400 Robot Vendor Caps • 400 Gold Press.
* **Daily Reset Time**: 17:00:00 UTC (12:00 PM EST / 1:00 PM EDT).
