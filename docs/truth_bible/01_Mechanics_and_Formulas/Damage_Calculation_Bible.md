---
title: Fallout 76 Damage & Armor Mitigation Bible
category: mechanics
effective_version: "Patch 70 (2026)"
tags:
  - fo76/mechanics
  - fo76/damage-math
  - cortex/gaming
---

# ☢️ Fallout 76 Damage & Armor Mitigation Master Bible
*Mathematically verified ground truth for post-Patch 22 (Additive Era) & modern balance revisions.*

![Damage & Armor Mitigation Blueprint](../assets/fo76_damage_formula_blueprint.jpg)

---

## ⚡ 1. The Universal Damage Formula

Since Patch 22 (One Wasteland), all percentage damage bonus perks calculate **additively based on the weapon's un-modded base damage**, completely eliminating the legacy multiplicative stacking.

### The Canonical Formula:
$$\text{Modified Damage (MD)} = \text{Base Damage (BD)} \times \left(1 + \sum \text{Additive Perks} + \sum \text{Buffs}\right) + \text{Flat Additions}$$

$$\text{Final Critical Damage (FD)} = \left(\text{MD} + (\text{BD} \times \text{Crit Multiplier})\right) \times \text{Weakpoint Multiplier} \times \text{Armor Coefficient}$$

### Additive vs. Multiplicative Breakdown:
* **Additive Pool ($\sum \text{Perks}$)**:
  * Weapon Class Perks: Commando, Rifleman, Gunslinger, Shotgunner (Up to $+60\%$). Heavy Guns utilize the modern **Bullet Storm** stacking mechanic ($+3\% / +6\% / +9\%$ per 30 rounds fired, up to 10 stacks or 20 with **Bringing the Big Guns**); 2-Handed Melee utilizes **Slugger** ($+10\% / +20\% / +30\%$ vs crippled targets), **Heavy Hitter** ($+25\%$ power attack damage), and **Knee-Capper** ($+50\%$ limb damage).
  * Legendary 1st Stars: Bloodied (up to $+95\%$), Aristocrat's ($+50\%$), Junkie's ($+50\%$), Mutant's ($+25\%$), Anti-Armor ($0\%$ additive, handles armor reduction).
  * Food & Chems: Psychobuff ($+25\%$), Ballistic Bock ($+15\%$).
  * Mutation: Adrenal Reaction (up to $+63\%$ at low health).
* **Multiplicative Exceptions (Applied AFTER Additive Pool)**:
  * **Weakpoint / Headshot Multipliers**: Typically $1.5\times$ to $2.0\times$ depending on mob anatomy (Earle head: $3.0\times$).
  * **Follow Through (Legendary Perk)**: Multiplicative $+40\%$ ranged sneak debuff applied directly to the target.
  * **Taking One for the Team**: Multiplicative $+40\%$ debuff when struck in a team.
  * **Tenderizer**: Amplifies final damage taken by target by $+10\%$.

---

## 🛡️ 2. Armor Penetration & The 350 DR Soft-Cap

### The Paper DR Fallacy:
Damage Resistance (DR) and Energy Resistance (ER) do **not** provide linear protection. They scale asymptotically using the logarithmic equation:

$$\text{Mitigation Ratio} = 0.5 \times \left(\frac{\text{Damage In}}{\text{Target Effective DR}}\right)^{0.666}$$

* **The Soft Cap**: At **300 to 350 DR/ER**, damage mitigation achieves roughly **$70-75\%$** reduction.
* **Diminishing Returns**: Pushing DR from 350 to 700 requires immense perk/armor investment but only increases real damage reduction by approximately **$4-6\%$**.
* **The Rule of Truth**: **Never invest in flat DR perks** (Ironclad, Barbarian, Evasive). Instead, prioritize **Flat Percentage Reduction**!

```
Mitigation %
  100% ┤
   80% ┤              ╭─────────────────────── (Diminishing Returns)
   60% ┤          ╭───╯ [Soft Cap: ~350 DR]
   40% ┤       ╭──╯
   20% ┤   ╭───╯
    0% ┼───┴──────────┴──────────┴──────────┴────
       0      150       300       450      600  Total Armor DR
```

---

## 🛡️ 3. Percentage Damage Reduction Hierarchy (The God-Tier Defense)

Percentage reduction calculates **before** your armor DR touches the damage. They stack multiplicatively to grant effective invulnerability:

| Defense Layer | Percentage Reduced | Trigger Condition | Stacking Priority |
| :--- | :--- | :--- | :--- |
| **Overeaters (x5 pieces)** | **$30\%$ Flat** ($6\%$ per piece) | Fully Fed & Hydrated | Passive (Applies to all incoming damage) |
| **Blocker (Rank 3)** | **$45\%$ Flat** | Melee Attacks | Passive Strength Perk |
| **Fireproof (Rank 3)** | **$45\%$ Flat** | Explosions & Fire Damage | Passive Endurance Perk |
| **Dodgy (Rank 3)** | **$30\%$ Flat** | Consumes 30 AP per hit | Agility Perk |
| **Sentinel (x5 pieces)** | **$75\%$ Chance for $75\%$** | Standing Still | Legendary 3rd Star Armor |
| **Power Armor Chassis** | **$42\%$ Flat + $90\%$ Rad** | Wearing any full PA frame | Hidden innate Power Armor property |

> [!IMPORTANT]
> A full set of **Overeaters Power Armor** with **Blocker**, **Fireproof**, and **Dodgy** reduces an incoming 1,000-damage Behemoth slam down to **under 40 raw damage** before armor DR even calculates!

---

## 🎯 4. V.A.T.S. Criticals & Luck Thresholds

* **Critical Hits completely bypass target Damage Resistance**. They are the single most important DPS scaling tool against raid bosses (Ultracite Titan, Scorchbeast Queen, Earle Williams).
* **The 33 Luck Golden Rule**:
  * With **Critical Savvy (Rank 3)**, your critical meter consumes only $45\%$ per crit.
  * At **33 Luck**, every single alternating shot fills your crit meter: **Crit ➔ Normal ➔ Crit ➔ Normal**.
  * Reached via: 15 Base Luck + 15 Unyielding Armor (+3 per piece) + 2 Herd Mentality + 1 Underarmor = **33 Luck**.

---
*Cross-References*: [Master Truth Bible](../README.md) | [02. Box Mods & Scrapping Guide](../02_Legendary_Crafting/Box_Mods_and_Scrapping_Guide.md) | [03. Ballistic & Commando Weapons](../03_Weapons_Catalog/Ballistic_and_Commando_Weapons.md) | [04. Armor & Power Armor Master](../04_Armor_and_Power_Armor/Armor_and_Power_Armor_Master.md) | [05. Builds & Mutation Matrix](../05_Builds_and_Synergies/Builds_and_Mutation_Matrix.md)
