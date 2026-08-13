// Static Fallback Catalog for Legendary Effects & Wiki Records
// Ensures 100% reliable rendering even if the database is unseeded or unready.

export interface StaticEffectRow {
  id: string;
  effectName: string;
  tierLabel: string;
  categories: string;
  description: string;
  extraComponent: string;
  legendaryModules: number;
  notes: string;
  origins: string[];
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  unlockedBy: string[];
  selectionSource: "default" | "imported" | "edited";
  effect: { name: string };
  tier: { label: string };
  categoriesRel: { category: { name: string } }[];
}

export const FALLBACK_LEGENDARY_EFFECTS: StaticEffectRow[] = [
  {
    "id": "effect-1star-adrenal",
    "effectName": "Adrenal",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Weapon] +10% damage per kill while on a Kill Streak. [Armor] +10 Damage and Energy Resistance per kill while on a Kill Streak (Max 10).",
    "extraComponent": "1 Adrenal Reaction Serum",
    "legendaryModules": 15,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Adrenal"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-anti-armor",
    "effectName": "Anti-armor",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+50% Armor Penetration",
    "extraComponent": "5 Black Titanium",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Anti-armor Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Anti-armor"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-aristocrats",
    "effectName": "Aristocrat's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] Reflect incoming damage based on caps held (Max 10%). [Weapon] Up to +50% damage based on Caps.",
    "extraComponent": "1 Bobblehead: Caps",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Aristocrat's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Aristocrat's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-assassins",
    "effectName": "Assassin's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Humans. [Weapon] +50% damage to Humans.",
    "extraComponent": "1 Liquid Courage",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Assassin's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Assassin's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-auto-stim",
    "effectName": "Auto Stim",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Automatically use a Stimpak when hit while Health is 25% or less, once every 60 seconds.",
    "extraComponent": "5 Stimpak",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Auto Stim Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Auto Stim"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-berserkers",
    "effectName": "Berserker's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage increases up to +50% as Damage Resistance decreases.",
    "extraComponent": "5 Psycho",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Berserker's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Berserker's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-bloodied",
    "effectName": "Bloodied",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage increases up to +130% as Health decreases.",
    "extraComponent": "1 Adrenal Reaction Serum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Bloodied Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Bloodied"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-bolstering",
    "effectName": "Bolstering",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Grants up to 10% Damage Reduction at lower Health Percent.",
    "extraComponent": "5 Med-X",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Bolstering Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Bolstering"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-chameleon",
    "effectName": "Chameleon",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Become invisible while sneaking and not moving.",
    "extraComponent": "1 Chameleon Serum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Chameleon Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Chameleon"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-cloaking",
    "effectName": "Cloaking",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Being hit in melee causes you to become invisible once every 30 seconds.",
    "extraComponent": "1 Stealth Boy",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Cloaking Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Cloaking"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-executioners",
    "effectName": "Executioner's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+50% more damage when your target is below 40% Health.",
    "extraComponent": "25 Leather",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Executioner's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Executioner's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-exterminators",
    "effectName": "Exterminator's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Mirelurks and Insects. [Weapon] +50% damage to Mirelurks and Insects.",
    "extraComponent": "1 Bloodbug Proboscis, 1 Stigwing Barb",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Exterminator's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Exterminator's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-ferals",
    "effectName": "Feral's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Melee",
    "description": "[Ghoul] Target kills make you go feral faster.",
    "extraComponent": "5 Black Titanium",
    "legendaryModules": 15,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Feral's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-furious",
    "effectName": "Furious",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+5% damage per Onslaught stack, +9 max stacks.",
    "extraComponent": "1 Fury",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Furious Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Furious"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-ghoul-slayers",
    "effectName": "Ghoul Slayer's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Ghouls. [Weapon] +50% damage to Ghouls.",
    "extraComponent": "1 RadShield",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Ghoul Slayer's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Ghoul Slayer's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-gourmands",
    "effectName": "Gourmand's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage increases up to +40% as you fill Hunger/Thirst meters.",
    "extraComponent": "1 Vegetarian Ham",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Gourmand's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Gourmand's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-hunters",
    "effectName": "Hunter's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Animals. [Weapon] +50% damage to Animals.",
    "extraComponent": "1 Yao Guai Hide",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Hunter's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Hunter's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-instigating",
    "effectName": "Instigating",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+50% damage against targets above 60% Health.",
    "extraComponent": "5 Whiskey",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Instigating Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Instigating"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-juggernauts",
    "effectName": "Juggernaut's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage increases up to +100% as Health increases (1000HP = 100%).",
    "extraComponent": "5 Buffout",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Juggernaut's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Juggernaut's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-junkies",
    "effectName": "Junkie's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage increases per Addiction up to +100%.",
    "extraComponent": "5 Mentats",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Junkie's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Junkie's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-life-saving",
    "effectName": "Life Saving",
    "tierLabel": "1 Star",
    "categories": "Armor",
    "description": "When incapacitated, gain a 50% chance to revive yourself with a Stimpak, once every 60 seconds.",
    "extraComponent": "5 Stimpak",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Life Saving Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Life Saving"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-lucid",
    "effectName": "Lucid",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Ghoul] [Armor] Damage reduction up to +6% as you fill Feral meter. [Weapon] Damage increases up to +40% as you fill Feral meter.",
    "extraComponent": "1 Bobblehead: Medicine",
    "legendaryModules": 15,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Lucid"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-medics",
    "effectName": "Medic's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Attacks will heal friendly targets by 5% Health.",
    "extraComponent": "1 Bobblehead: Medicine",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Medic's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Medic's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-mutant-slayers",
    "effectName": "Mutant Slayer's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Super Mutants. [Weapon] +50% damage to Super Mutants.",
    "extraComponent": "1 Super Mutant Head",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Mutant Slayer's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Mutant Slayer's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-mutants",
    "effectName": "Mutant's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] Up to 5% Damage Reduction as you acquire more Mutations. [Weapon] Damage increases up to +50% as you gain Mutations.",
    "extraComponent": "10 Asbestos",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Mutant's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Mutant's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-nocturnal",
    "effectName": "Nocturnal",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] +4 Perception and Agility while cloaked. [Weapon] +50% damage while cloaked.",
    "extraComponent": "10 Nuclear Material",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Nocturnal Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Nocturnal"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-overeaters",
    "effectName": "Overeater's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Increases Max Health up to 40 as you fill Hunger/Thirst meters.",
    "extraComponent": "1 Perfect Bubblegum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Overeater's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Overeater's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-quad",
    "effectName": "Quad",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged",
    "description": "+300% ammo capacity.",
    "extraComponent": "1 Fusion Core",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Quad Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Quad"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-1star-regenerating",
    "effectName": "Regenerating",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+0.5% heal rate.",
    "extraComponent": "1 Healing Factor Serum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Regenerating Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Regenerating"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-snipers",
    "effectName": "Sniper's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged",
    "description": "100% damage to distant targets.",
    "extraComponent": "1 Bobblehead: Perception",
    "legendaryModules": 15,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Sniper's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-1star-stalkers",
    "effectName": "Stalker's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged",
    "description": "+100% sneak attack damage.",
    "extraComponent": "1 Calmex",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Stalker's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Stalker's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-1star-suppressors",
    "effectName": "Suppressor's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Reduce your target's damage output by 25% for 5 seconds.",
    "extraComponent": "1 Grounded Serum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Suppressor's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Suppressor's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-troubleshooters",
    "effectName": "Troubleshooter's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Robots. [Weapon] +50% damage to Robots.",
    "extraComponent": "10 Circuitry",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Troubleshooter's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Troubleshooter's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-two-shot",
    "effectName": "Two Shot",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged",
    "description": "+1 projectile, +75% damage, -150% hip-fire accuracy, +100% recoil.",
    "extraComponent": "20 Lead",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Two Shot Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Two Shot"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-1star-unyielding",
    "effectName": "Unyielding",
    "tierLabel": "1 Star",
    "categories": "Armor",
    "description": "Gain up to +3 to all S.P.E.C.I.A.L. (except END) when Health is low.",
    "extraComponent": "5 X-Cell",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Unyielding Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Unyielding"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-vampires",
    "effectName": "Vampire's",
    "tierLabel": "1 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Restore 2% Health over 2 seconds when you hit a target.",
    "extraComponent": "10 Bloodpacks",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Vampire's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Vampire's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-1star-vanguards",
    "effectName": "Vanguard's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Grants up to 6% Damage Reduction as Health Increases.",
    "extraComponent": "5 Blood Pack",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Vanguard's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Vanguard's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-heavyweight",
    "effectName": "Heavyweight",
    "tierLabel": "1 Star",
    "categories": "Armor",
    "description": "Grants up to 10% Damage Reduction at Higher Encumbrance (Max at 150% Encumbrance).",
    "extraComponent": "1 Bird Bones Serum",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Heavyweight Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Heavyweight"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-1star-zealots",
    "effectName": "Zealot's",
    "tierLabel": "1 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Armor] -15% damage from Scorched. [Weapon] +50% damage to Scorched.",
    "extraComponent": "10 Ultracite",
    "legendaryModules": 15,
    "notes": "",
    "origins": [
      "Scrapping Zealot's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Zealot's"
    },
    "tier": {
      "label": "1 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-agility",
    "effectName": "Agility",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Agility.",
    "extraComponent": "1 Bobblehead: Agility",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Agility Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Agility"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-antiseptic",
    "effectName": "Antiseptic",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+25% reduced disease chance from environmental hazards.",
    "extraComponent": "10 Disease Cure",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Antiseptic Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Antiseptic"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-bashers",
    "effectName": "Basher's",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged",
    "description": "+50% bash damage.",
    "extraComponent": "25 Concrete",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Basher's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Basher's"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-2star-charisma",
    "effectName": "Charisma",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Charisma.",
    "extraComponent": "1 Bobblehead: Charisma",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Charisma Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Charisma"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-crippling",
    "effectName": "Crippling",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+50% limb damage.",
    "extraComponent": "5 Black Titanium",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Crippling Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Crippling"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-elementalist",
    "effectName": "Elementalist",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Increase all resistances by 5.",
    "extraComponent": "1 Bobblehead: Endurance",
    "legendaryModules": 30,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Elementalist"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-endurance",
    "effectName": "Endurance",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Endurance.",
    "extraComponent": "1 Bobblehead: Endurance",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Endurance Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Endurance"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-explosive",
    "effectName": "Explosive",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged",
    "description": "Projectiles explode for +20% weapon damage.",
    "extraComponent": "1 Bobblehead: Explosive",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Explosive Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Explosive"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-2star-fierce",
    "effectName": "Fierce",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Fortify limb resistance based on Kill Streak count (1% per kill).",
    "extraComponent": "1 Bobblehead: Strength",
    "legendaryModules": 30,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Fierce"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-fireproof",
    "effectName": "Fireproof",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+25 Fire Resistance.",
    "extraComponent": "10 Floater Flamer Puc Sac",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Fireproof Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Fireproof"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-glutton",
    "effectName": "Glutton",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Hunger and Thirst grow 10% slower.",
    "extraComponent": "1 Perfect Bubblegum",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Glutton Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Glutton"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-hardy",
    "effectName": "Hardy",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Receive 7% less explosion damage.",
    "extraComponent": "1 Bobblehead: Explosive",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Hardy Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Hardy"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-hazmat",
    "effectName": "HazMat",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+25 Radiation Resistance.",
    "extraComponent": "10 Rad-x",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping HazMat Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "HazMat"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-heavy-hitters",
    "effectName": "Heavy Hitter's",
    "tierLabel": "2 Star",
    "categories": "Weapon: Melee",
    "description": "+40% power attack damage.",
    "extraComponent": "25 Concrete",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Heavy Hitter's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Heavy Hitter's"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-hitmans",
    "effectName": "Hitman's",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged",
    "description": "+25% damage while aiming.",
    "extraComponent": "10 Fiber Optics",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Hitman's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Hitman's"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-2star-inertial",
    "effectName": "Inertial",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Replenish 15 Action Points with each kill.",
    "extraComponent": "10 Canned Coffee",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Inertial Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Inertial"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-intelligence",
    "effectName": "Intelligence",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Intelligence.",
    "extraComponent": "1 Bobblehead: Intelligence",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Intelligence Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Intelligence"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-last-shot",
    "effectName": "Last Shot",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged",
    "description": "Last round in a magazine has a 25% chance to deal +100% damage.",
    "extraComponent": "15 Gunpowder",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Last Shot Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Last Shot"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-2star-luck",
    "effectName": "Luck",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Luck.",
    "extraComponent": "1 Bobblehead: Luck",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Luck Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Luck"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-pain-killer",
    "effectName": "Pain Killer",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Gain Health over time while on a Kill Streak; stronger with higher streak.",
    "extraComponent": "1 Bobblehead: Medicine",
    "legendaryModules": 30,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pain Killer"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-perception",
    "effectName": "Perception",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Perception.",
    "extraComponent": "1 Bobblehead: Perception",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Perception Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Perception"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-pick-pocketers",
    "effectName": "Pick Pocketer's",
    "tierLabel": "2 Star",
    "categories": "Weapon: Melee",
    "description": "Target kills have 50% chance to grant 1\u20134 Caps.",
    "extraComponent": "1 Bobblehead: Caps",
    "legendaryModules": 30,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pick Pocketer's"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-poisoners",
    "effectName": "Poisoner's",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+25 Poison Resistance.",
    "extraComponent": "10 Floater Gnasher Puc Sac",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Poisoner's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Poisoner's"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-powered",
    "effectName": "Powered",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+5% Action Point regen.",
    "extraComponent": "10 Canned Coffee",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Powered Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Powered"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-rapid",
    "effectName": "Rapid",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Ranged] +25% weapon speed. [Melee] +40% weapon speed.",
    "extraComponent": "1 Speed Demon Serum",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Rapid Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Rapid"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-riposting",
    "effectName": "Riposting",
    "tierLabel": "2 Star",
    "categories": "Weapon: Melee",
    "description": "+50% melee damage reflection while blocking.",
    "extraComponent": "25 Glass",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Riposting Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Riposting"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-rushing",
    "effectName": "Rushing",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Gain Action Points over time while on a Kill Streak; stronger with higher streak.",
    "extraComponent": "1 Bobblehead: Agility",
    "legendaryModules": 30,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Rushing"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-steady",
    "effectName": "Steady",
    "tierLabel": "2 Star",
    "categories": "Weapon: Melee",
    "description": "+25% melee damage while not moving.",
    "extraComponent": "3 Orange Mentats",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Steady Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Steady"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-strength",
    "effectName": "Strength",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+2 Strength.",
    "extraComponent": "1 Bobblehead: Strength",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Strength Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Strength"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-2star-v.a.t.s.-enhanced",
    "effectName": "V.A.T.S. Enhanced",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged",
    "description": "+50% chance to hit a target in V.A.T.S.",
    "extraComponent": "3 Berry Mentats",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping V.A.T.S. Enhanced Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "V.A.T.S. Enhanced"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-2star-vital",
    "effectName": "Vital",
    "tierLabel": "2 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+50% critical damage.",
    "extraComponent": "1 Eagle Eyes Serum",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Vital Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Vital"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-2star-warming",
    "effectName": "Warming",
    "tierLabel": "2 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+25 Cryo Resistance.",
    "extraComponent": "10 Floater Freezer Pus Sac",
    "legendaryModules": 30,
    "notes": "",
    "origins": [
      "Scrapping Warming Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Warming"
    },
    "tier": {
      "label": "2 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-acrobats",
    "effectName": "Acrobat's",
    "tierLabel": "3 Star",
    "categories": "Armor",
    "description": "-50% fall damage.",
    "extraComponent": "1 Marsupial Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Acrobat's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Acrobat's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-active",
    "effectName": "Active",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Max AP increased by +20.",
    "extraComponent": "1 Bobblehead: Agility",
    "legendaryModules": 60,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Active"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-adamantium",
    "effectName": "Adamantium",
    "tierLabel": "3 Star",
    "categories": "Armor",
    "description": "Receive 15% less limb damage.",
    "extraComponent": "1 Twisted Muscles Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Adamantium Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Adamantium"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-agility",
    "effectName": "Agility",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Agility.",
    "extraComponent": "1 Bobblehead: Agility",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Agility Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Agility"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-arms-keepers",
    "effectName": "Arms Keeper's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Weapon weights reduced by 20%.",
    "extraComponent": "1 Bobblehead: Small Guns",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Arms Keeper's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Arms Keeper's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-barbarian",
    "effectName": "Barbarian",
    "tierLabel": "3 Star",
    "categories": "Weapon: Melee",
    "description": "+1 STR per kill while on a Kill Streak (max 10).",
    "extraComponent": "1 Bobblehead: Melee",
    "legendaryModules": 60,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Barbarian"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-belted",
    "effectName": "Belted",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Ammo weight reduced by 20%.",
    "extraComponent": "25 Lead",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Belted Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Belted"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-blocker",
    "effectName": "Blocker",
    "tierLabel": "3 Star",
    "categories": "Weapon: Melee",
    "description": "+15% more damage blocked.",
    "extraComponent": "10 Oil",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Blocker Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Blocker"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-burning",
    "effectName": "Burning",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "5% chance to deal 12 Fire damage per second for 3s to melee attackers.",
    "extraComponent": "15 Floater Flamer Pus Sac",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Burning Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Burning"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-cavaliers",
    "effectName": "Cavalier's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "-10% Damage Taken While Sprinting.",
    "extraComponent": "10 Oil",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Cavalier's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Cavalier's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-charisma",
    "effectName": "Charisma",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Charisma.",
    "extraComponent": "1 Bobblehead: Charisma",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Charisma Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Charisma"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-defenders",
    "effectName": "Defender's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Melee",
    "description": "[Armor] 5% Chance To Automatically Block Attacks. [Melee] -40% damage taken while power attacking.",
    "extraComponent": "25 Steel",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Defender's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Defender's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-dissipating",
    "effectName": "Dissipating",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+0.25% radiation damage recovery.",
    "extraComponent": "10 RadAway",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Dissipating Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Dissipating"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-divers",
    "effectName": "Diver's",
    "tierLabel": "3 Star",
    "categories": "Armor",
    "description": "Breathe underwater.",
    "extraComponent": "15 Plastic",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Diver's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Diver's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-doctors",
    "effectName": "Doctor's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+5% effectiveness of Stimpaks, RadAway, and Rad-X.",
    "extraComponent": "1 Stimpak: Super",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Doctor's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Doctor's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-durability",
    "effectName": "Durability",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Breaks 50% slower.",
    "extraComponent": "1 Bobblehead: Repair",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Durability Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Durability"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      },
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-electrified",
    "effectName": "Electrified",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "5% chance to deal 12 Energy damage per second for 3s to melee attackers.",
    "extraComponent": "1 Electrically Charged Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Electrified Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Electrified"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-endurance",
    "effectName": "Endurance",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Endurance.",
    "extraComponent": "1 Bobblehead: Endurance",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Endurance Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Endurance"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-frozen",
    "effectName": "Frozen",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "5% chance to deal 12 Cryo damage per second for 4s to melee attackers.",
    "extraComponent": "15 Floater Freezer Pus Sac",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Frozen Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Frozen"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-ghosts",
    "effectName": "Ghost's",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged",
    "description": "10% chance to become invisible for 2 seconds when hitting a target.",
    "extraComponent": "1 Stealth Boy",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Ghost's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Ghost's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-3star-glowing",
    "effectName": "Glowing",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Ghoul] Target kills increase Glow by a small amount. [Human] Target kills increase Rads by a small amount (20 RADs).",
    "extraComponent": "1 Bobblehead: Science",
    "legendaryModules": 60,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Glowing"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-healthy",
    "effectName": "Healthy",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Max HP increased by +20.",
    "extraComponent": "1 Bobblehead: Endurance",
    "legendaryModules": 60,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Healthy"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-intelligence",
    "effectName": "Intelligence",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Intelligence.",
    "extraComponent": "1 Bobblehead: Intelligence",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Intelligence Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Intelligence"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-lightweight",
    "effectName": "Lightweight",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "-90% weight.",
    "extraComponent": "10 Cork",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Lightweight Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Lightweight"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-luck",
    "effectName": "Luck",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Luck.",
    "extraComponent": "1 Bobblehead: Luck",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Luck Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Luck"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-lucky",
    "effectName": "Lucky",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+15 bonus V.A.T.S. critical charge.",
    "extraComponent": "1 Bobblehead: Luck",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Lucky Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Lucky"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-nimble",
    "effectName": "Nimble",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged",
    "description": "+100% faster movement speed while aiming.",
    "extraComponent": "25 Springs",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Nimble Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Nimble"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-3star-pack-rats",
    "effectName": "Pack Rat's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Junk item weights reduced by 20%.",
    "extraComponent": "1 Marsupial Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Pack Rat's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pack Rat's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-perception",
    "effectName": "Perception",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Perception.",
    "extraComponent": "1 Bobblehead: Perception",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Perception Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Perception"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-reflex",
    "effectName": "Reflex",
    "tierLabel": "3 Star",
    "categories": "Armor",
    "description": "2% evade.",
    "extraComponent": "1 Bobblehead: Agility",
    "legendaryModules": 60,
    "notes": "Burning Springs \u2022 Bounties \u2022 Bounty Hunting: Head Hunt & Grunt Hunt",
    "origins": [
      "Burning Springs",
      "Bounties",
      "Bounty Hunting: Head Hunt & Grunt Hunt"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Reflex"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-resilient",
    "effectName": "Resilient",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged",
    "description": "+500 damage resistance while reloading.",
    "extraComponent": "5 Med-X",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Resilient Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Resilient"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-3star-safecrackers",
    "effectName": "Safecracker's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+1 lockpicking skill +1 hacking skill.",
    "extraComponent": "1 Bobblehead: Lock Picking",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Safecracker's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Safecracker's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-secret-agents",
    "effectName": "Secret Agent's",
    "tierLabel": "3 Star",
    "categories": "Armor",
    "description": "+25% less noise while sneaking +25% reduce detection chance.",
    "extraComponent": "1 Bobblehead: Sneak",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Secret Agent's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Secret Agent's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-sentinels",
    "effectName": "Sentinel's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "-5% damage taken while not moving.",
    "extraComponent": "1 Scaly Skin Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Sentinel's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Sentinel's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-steadfast",
    "effectName": "Steadfast",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged",
    "description": "+50 damage resistance while aiming.",
    "extraComponent": "5 Ballistic Fiber",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Steadfast Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Steadfast"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-3star-strength",
    "effectName": "Strength",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+3 Strength.",
    "extraComponent": "1 Bobblehead: Strength",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Strength Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Strength"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-3star-swift",
    "effectName": "Swift",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged",
    "description": "+15% reload speed.",
    "extraComponent": "1 Speed Demon Serum",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Swift Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Swift"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-3star-thru-hikers",
    "effectName": "Thru-hiker's",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Food, drink, and chem weights reduced by 20%.",
    "extraComponent": "10 Purified Water",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Thru-hiker's Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Thru-hiker's"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-toxic",
    "effectName": "Toxic",
    "tierLabel": "3 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "5% chance to deal 12 Poison damage per second for 7s to melee attackers.",
    "extraComponent": "15 Floater Gnasher Pus Sac",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping Toxic Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Toxic"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-3star-v.a.t.s.-optimized",
    "effectName": "V.A.T.S. Optimized",
    "tierLabel": "3 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "-35% action point cost.",
    "extraComponent": "10 Sugar",
    "legendaryModules": 60,
    "notes": "",
    "origins": [
      "Scrapping V.A.T.S. Optimized Items",
      "Legendary Crafting"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "V.A.T.S. Optimized"
    },
    "tier": {
      "label": "3 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-aegis",
    "effectName": "Aegis",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Fortifies Physical and Energy Resists (+50) and Poison, Cryo, and Fire Resists (+20) for you and nearby teammates.",
    "extraComponent": "5 Circuitry",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 3) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 3)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Aegis"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-battle-loaders",
    "effectName": "Battle-Loader's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Gives you a 15% chance to instantly reload when bashing enemies (stacks up to 75%).",
    "extraComponent": "1 Talons Serum",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 2) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 2)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Battle-Loader's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-bruisers",
    "effectName": "Bruiser's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Melee weapons deal +5% bonus damage (up to +25% on full stack).",
    "extraComponent": "1 Bufftats",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 4 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 4 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Bruiser's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-bullys",
    "effectName": "Bully's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+25% damage per crippled limb the target has.",
    "extraComponent": "1 Buffout",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 1 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 1 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Bully's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-charged",
    "effectName": "Charged",
    "tierLabel": "4 Star",
    "categories": "Weapon: Melee",
    "description": "Light attacks build up charge released with heavy attack (max charges 3).",
    "extraComponent": "3x Fusion Core",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Charged"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-choo-choos",
    "effectName": "Choo-Choo's",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "10% chance for 500 damage & Bloody Mess when sprinting into targets (up to 50% on full stack).",
    "extraComponent": "15 Cannonballs",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Choo-Choo's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-combo-breakers",
    "effectName": "Combo-Breaker's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Melee",
    "description": "When dealing damage, 50% chance to not use AP (10% chance for auto melee).",
    "extraComponent": "1 Day Tripper",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Combo-Breaker's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-conductors",
    "effectName": "Conductor's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Critical hits restore 10 Health & AP instantly and 100 more over 5s for you & teammates within 100ft.",
    "extraComponent": "5 Pure Crimson Flux",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Conductor's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-electricians",
    "effectName": "Electrician's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged",
    "description": "When reloading, emit a shock wave that stuns nearby targets for 3s.",
    "extraComponent": "1 Bobblehead: Energy Weapons",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 2 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 2 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Electrician's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-4star-encirclers",
    "effectName": "Encircler's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "+10% damage for each combat target around you (up to +50%).",
    "extraComponent": "1 Overdrive",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 4 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 4 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Encircler's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-fencers",
    "effectName": "Fencer's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Melee",
    "description": "+12.5% melee damage; +12.5% per nearby teammate (up to +50% on full team).",
    "extraComponent": "1 Bobblehead: Melee",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 2 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 2 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Fencer's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-fracturers",
    "effectName": "Fracturer's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "When crippling limbs, they explode and deal up to 50 explosion damage to nearby targets.",
    "extraComponent": "25 Gunpowder",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 1 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 1 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Fracturer's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-haulers",
    "effectName": "Hauler's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Increases Carrying Capacity by 30.",
    "extraComponent": "5 Cloth",
    "legendaryModules": 120,
    "notes": "Infestations",
    "origins": [
      "Infestations"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Hauler's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-icemens",
    "effectName": "Icemen's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Melee",
    "description": "Applies cryo on hit that slows targets when dealing damage in V.A.T.S.",
    "extraComponent": "5 Pure Fluorescent Flux",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 4) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 4)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Icemen's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-limit-breaking",
    "effectName": "Limit-Breaking",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Each worn armor piece reduces critical hit cost by -10% (up to -50% on full stack).",
    "extraComponent": "5 Pure Violet Flux",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 5 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 5 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Limit-Breaking"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-miasmas",
    "effectName": "Miasma's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "When hit, a poisonous DoT cloud harms nearby targets for 10s (damage increases per equipped piece).",
    "extraComponent": "1 Plague Walker Serum",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 4 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 4 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Miasma's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-pin-pointers",
    "effectName": "Pin-Pointer's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged",
    "description": "+20% weak spot damage.",
    "extraComponent": "1 Formula P",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 1 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 1 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pin-Pointer's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-4star-polished",
    "effectName": "Polished",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Weapon damage increases the higher the item condition is (up to +60% damage).",
    "extraComponent": "1 Improved Repair Kit",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 4) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 4)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Polished"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-pounders",
    "effectName": "Pounder's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Melee",
    "description": "+10% damage per Onslaught stack, +10 max stacks.",
    "extraComponent": "1 Fury",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pounder's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-propelling",
    "effectName": "Propelling",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Increases movement and sprint speed (+5% up to +25% on full stack).",
    "extraComponent": "15 Vault Steel Scrap",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 5) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 5)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Propelling"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-pyromaniacs",
    "effectName": "Pyromaniac's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "When a combat target is burning, deal +50% bonus damage.",
    "extraComponent": "15 Asbestos",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 5 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 5 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Pyromaniac's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-radioactive-powered",
    "effectName": "Radioactive-Powered",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Grants +2 AP regeneration at the cost of taking RADs.",
    "extraComponent": "5 Pure Cobalt Flux",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 1) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 1)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Radioactive-Powered"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-raging",
    "effectName": "Raging",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Upon being hit, deal +3% Damage for 10 seconds.",
    "extraComponent": "1 Buffout",
    "legendaryModules": 120,
    "notes": "Infestations",
    "origins": [
      "Infestations"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Raging"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-rangers",
    "effectName": "Ranger's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Ranged weapons deal +5% bonus damage (up to +25% on full stack).",
    "extraComponent": "1 Psychobuff",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 4 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 4 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Ranger's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-satiated",
    "effectName": "Satiated",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "[Human] Kills Restore Hunger and Thirst. [Ghoul] Kills Restore Feral",
    "extraComponent": "5 Salt",
    "legendaryModules": 120,
    "notes": "Infestations",
    "origins": [
      "Infestations"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Satiated"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-reflective",
    "effectName": "Reflective",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Return 10% of damage received back toward enemy target (up to 50% on full stack).",
    "extraComponent": "1 Bobblehead: Science",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 3 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 3 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Reflective"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-rejuvenators",
    "effectName": "Rejuvenator's",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Gradually restores wearer's & teammates Health & AP within 50ft.",
    "extraComponent": "5 Stimpak Diffuser",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 2 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 2 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Rejuvenator's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-runners",
    "effectName": "Runner's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Sprinting AP cost reduced by -20% (up to -100% on full stack).",
    "extraComponent": "10 Purified Water",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 1 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 1 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Runner's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-sawboness",
    "effectName": "Sawbones's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Health regenerates slowly (+1 Health/s; up to +5 Health/s on full stack).",
    "extraComponent": "1 Healing Factor Serum",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 5 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 5 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Sawbones's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-scanners",
    "effectName": "Scanner's",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "V.A.T.S. attack AP cost reduced by -5% (up to -25% on full stack).",
    "extraComponent": "1 X-Cell",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 1 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 1 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Scanner's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-stabilizers",
    "effectName": "Stabilizer's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged",
    "description": "Improves Weapon Recoil & Stability by 50%.",
    "extraComponent": "25 Rubber",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (only Stage 2) \u2022 Bigfoot",
    "origins": [
      "RAID: Gleaming Depths (only Stage 2)",
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Stabilizer's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      }
    ]
  },
  {
    "id": "effect-4star-stalwarts",
    "effectName": "Stalwart's",
    "tierLabel": "4 Star",
    "categories": "Power Armor",
    "description": "Power Armor breaks 5% slower for owner & teammates within 50ft (up to 25% on full stack).",
    "extraComponent": "1 Bobblehead: Leader",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 5 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 5 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Stalwart's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-tankys",
    "effectName": "Tanky's",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "+200 DR for 10s when standing still (20s cooldown; up to +1000 on full stack).",
    "extraComponent": "5 Ballistic Fiber",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 2 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 2 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Tanky's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-tarnished",
    "effectName": "Tarnished",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Damage Increases (up to +120%) as Weapon Durability Decreases.",
    "extraComponent": "5 Fiberglass",
    "legendaryModules": 120,
    "notes": "Infestations",
    "origins": [
      "Infestations"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Tarnished"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-thrill-seekers",
    "effectName": "Thrill-Seeker's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "Reload Speed & Melee Attack Speed increases based on Killstreak Count (2% per Kill).",
    "extraComponent": "1x Adrenal Reaction Serum",
    "legendaryModules": 120,
    "notes": "Bigfoot",
    "origins": [
      "Bigfoot"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Thrill-Seeker's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  },
  {
    "id": "effect-4star-vector",
    "effectName": "Vector",
    "tierLabel": "4 Star",
    "categories": "Armor \u2022 Power Armor",
    "description": "Gain 10% Bonus V.A.T.S. Accuracy Against Distant Targets",
    "extraComponent": "1 Magnifying Glass",
    "legendaryModules": 120,
    "notes": "Infestations",
    "origins": [
      "Infestations"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Vector"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Armor"
        }
      },
      {
        "category": {
          "name": "Power Armor"
        }
      }
    ]
  },
  {
    "id": "effect-4star-vipers",
    "effectName": "Viper's",
    "tierLabel": "4 Star",
    "categories": "Weapon: Ranged \u2022 Weapon: Melee",
    "description": "When a combat target is poisoned, deal +50% bonus damage.",
    "extraComponent": "15 Acid",
    "legendaryModules": 120,
    "notes": "RAID: Gleaming Depths (Stage 5 only)",
    "origins": [
      "RAID: Gleaming Depths (Stage 5 only)"
    ],
    "unlocked": false,
    "isSeeking": false,
    "modCount": 0,
    "unlockedBy": [],
    "selectionSource": "default",
    "effect": {
      "name": "Viper's"
    },
    "tier": {
      "label": "4 Star"
    },
    "categoriesRel": [
      {
        "category": {
          "name": "Weapon: Ranged"
        }
      },
      {
        "category": {
          "name": "Weapon: Melee"
        }
      }
    ]
  }
];

export const FALLBACK_WIKI_ARTICLES = [
  {
    "id": 1,
    "source": "Vault Codex",
    "title": "Complete Legendary Crafting & Scrapping Guide",
    "url": "https://fallout76.wiki/wiki/legendary-crafting",
    "category": "Weapons & Legendary Mods",
    "snippet": "Learn how to scrap legendary weapons and armor for a 1% chance to unlock permanent crafting recipes and 1.5% chance to obtain legendary mod boxes.",
    "content": "### Legendary Crafting Overview\n\nIn Fallout 76, players can scrap legendary weapons and armor at any Armor or Weapon Workbench to learn permanent crafting recipes or obtain loose mod boxes.\n\n* **Recipe Unlock Chance**: 1.0% per scrapped item.\n* **Mod Box Drop Chance**: 1.5% per scrapped item.\n* **Module Crafting Costs**: 1-Star (15 Modules), 2-Star (30 Modules), 3-Star (60 Modules), 4-Star (120 Modules).\n\nTrade loose mod boxes with other players or apply them directly to your favorite gear at any Workbench.",
    "main_image": null
  },
  {
    "id": 2,
    "source": "Vault Codex",
    "title": "Minerva Schedule & Gold Bullion Inventory",
    "url": "https://fallout76.wiki/wiki/minerva",
    "category": "Vendors & Minerva",
    "snippet": "Minerva is a traveling Gold Bullion merchant who sells rare plans at a 25% discount compared to Foundation and Crater vendors.",
    "content": "### Minerva Schedule & Rotations\n\nMinerva rotates weekly between Foundation, Crater, and Fort Atlas. Her Big Sale occurs once a month featuring combined inventories from the previous 3 weeks.\n\n* **Discount**: 25% cheaper than standard bullion vendors.\n* **Featured Plans**: Secret Service Armor, Gauss Shotgun/Minigun, Covert Scout Armor, Crusader Pistol, and War Glaive mods.",
    "main_image": null
  },
  {
    "id": 3,
    "source": "Vault Codex",
    "title": "S.P.E.C.I.A.L. & Punch Card Machine Mechanics",
    "url": "https://fallout76.wiki/wiki/perks",
    "category": "Perks & Loadouts",
    "snippet": "Punch Card Machines allow players level 25+ to respec SPECIAL stats and save up to 6 distinct loadouts for free.",
    "content": "### Punch Card Machines & Perk Loadouts\n\nLocated at all Train Stations, C.A.M.P.s, and Public Hubs.\n\n* **Free Loadouts**: 2 loadouts unlocked by default, expandable up to 6.\n* **Stat Allocation**: Shift up to 56 base SPECIAL points freely.\n* **Legendary SPECIAL Perks**: Boosts effective attribute capacity up to 15 (or 20 for Ghouls) while providing extra perk card slots.",
    "main_image": null
  },
  {
    "id": 4,
    "source": "Vault Codex",
    "title": "Playable Ghoul Overhaul & Feral Rage Mechanics",
    "url": "https://fallout76.wiki/wiki/ghoul-mode",
    "category": "Builds & Mechanics",
    "snippet": "Playable Ghouls expand S.P.E.C.I.A.L. perk capacity up to 20 points per attribute, replacing bloodied mechanics with feral rage meters.",
    "content": "### Playable Ghoul Mechanics\n\n* **Feral Gauge**: Fills as toxic radiation is absorbed from combat or environmental hazards.\n* **Perk Capacity**: Up to 20 perk points per SPECIAL attribute.\n* **Ghoul Perks**: Access to exclusive combat cards including Feral Rage, Chemist, and Radiation Mastery.",
    "main_image": null
  },
  {
    "id": 5,
    "source": "Vault Codex",
    "title": "Armor Resistances & Flat Damage Reduction Math",
    "url": "https://fallout76.wiki/wiki/armor-math",
    "category": "Armor & Power Armor",
    "snippet": "Understanding DR, ER, RR, and flat percentage Damage Reduction (Overeaters, Sentinels, Power Armor chassis).",
    "content": "### Damage Reduction Formula\n\nFlat percentage Damage Reduction is calculated BEFORE numerical DR armor math:\n\n* **Power Armor Chassis**: Flat -42% damage reduction.\n* **Overeaters (Full Set)**: Flat -30% damage reduction at full hunger/thirst.\n* **Sentinel Set**: Flat -75% damage reduction while standing still.",
    "main_image": null
  },
  {
    "id": 6,
    "source": "Vault Codex",
    "title": "Milepost Zero Caravan Vendor Upgrade Guide",
    "url": "https://fallout76.wiki/wiki/milepost-zero",
    "category": "Caravans & Vendors",
    "snippet": "Upgrade Blue Ridge Caravan vendors at Milepost Zero using Supplies earned from Skyline Valley caravan escorts.",
    "content": "### Milepost Zero Caravans\n\nRun caravans across Skyline Valley to earn Blue Ridge Supplies.\n\n* **Caravan Tiers**: Small (10 Supplies), Medium (25 Supplies), Large (50 Supplies).\n* **Vendors**: Upgrade Ineke (Decorations), Theodore (Ammo/Weapons), and Josie (Creature Buffs).",
    "main_image": null
  },
  {
    "id": 7,
    "source": "Vault Codex",
    "title": "Burning Springs & Head Hunt Bounty Targets",
    "url": "https://fallout76.wiki/wiki/burning-springs",
    "category": "Bounties & Drop Tables",
    "snippet": "Complete Head Hunt and Grunt Hunt bounties in Burning Springs for exclusive 1-Star through 4-Star legendary mod drops.",
    "content": "### Burning Springs Bounties\n\nTake down notorious raider bosses and mutated behemoths across the Burning Springs region for rare mod boxes including Adrenal, Pin-pointer, and Executioner mods.",
    "main_image": null
  },
  {
    "id": 100,
    "source": "Vault Codex [1 Star]",
    "title": "Adrenal (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/0",
    "category": "1 Star Mods",
    "snippet": "Adrenal (1 Star): [Weapon] +10% damage per kill while on a Kill Streak. [Armor] +10 Damage and Energy Resistance per kill while on a Kill Streak (Max 10).. Craft with 15 Modules & 1 Adrenal Reaction Serum.",
    "content": "### Adrenal - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Weapon] +10% damage per kill while on a Kill Streak. [Armor] +10 Damage and Energy Resistance per kill while on a Kill Streak (Max 10).\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Adrenal Reaction Serum`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Adrenal** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 101,
    "source": "Vault Codex [1 Star]",
    "title": "Anti-armor (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/1",
    "category": "1 Star Mods",
    "snippet": "Anti-armor (1 Star): +50% Armor Penetration. Craft with 15 Modules & 5 Black Titanium.",
    "content": "### Anti-armor - 1 Star Legendary Mod\n\n* **Effect Bonus**: +50% Armor Penetration\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Black Titanium`\n* **Obtainable From**: Scrapping Anti-armor Items, Legendary Crafting\n\nScrap items with the **Anti-armor** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 102,
    "source": "Vault Codex [1 Star]",
    "title": "Aristocrat's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/2",
    "category": "1 Star Mods",
    "snippet": "Aristocrat's (1 Star): [Armor] Reflect incoming damage based on caps held (Max 10%). [Weapon] Up to +50% damage based on Caps.. Craft with 15 Modules & 1 Bobblehead: Caps.",
    "content": "### Aristocrat's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] Reflect incoming damage based on caps held (Max 10%). [Weapon] Up to +50% damage based on Caps.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Caps`\n* **Obtainable From**: Scrapping Aristocrat's Items, Legendary Crafting\n\nScrap items with the **Aristocrat's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 103,
    "source": "Vault Codex [1 Star]",
    "title": "Assassin's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/3",
    "category": "1 Star Mods",
    "snippet": "Assassin's (1 Star): [Armor] -15% damage from Humans. [Weapon] +50% damage to Humans.. Craft with 15 Modules & 1 Liquid Courage.",
    "content": "### Assassin's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Humans. [Weapon] +50% damage to Humans.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Liquid Courage`\n* **Obtainable From**: Scrapping Assassin's Items, Legendary Crafting\n\nScrap items with the **Assassin's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 104,
    "source": "Vault Codex [1 Star]",
    "title": "Auto Stim (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/4",
    "category": "1 Star Mods",
    "snippet": "Auto Stim (1 Star): Automatically use a Stimpak when hit while Health is 25% or less, once every 60 seconds.. Craft with 15 Modules & 5 Stimpak.",
    "content": "### Auto Stim - 1 Star Legendary Mod\n\n* **Effect Bonus**: Automatically use a Stimpak when hit while Health is 25% or less, once every 60 seconds.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Stimpak`\n* **Obtainable From**: Scrapping Auto Stim Items, Legendary Crafting\n\nScrap items with the **Auto Stim** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 105,
    "source": "Vault Codex [1 Star]",
    "title": "Berserker's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/5",
    "category": "1 Star Mods",
    "snippet": "Berserker's (1 Star): Damage increases up to +50% as Damage Resistance decreases.. Craft with 15 Modules & 5 Psycho.",
    "content": "### Berserker's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Damage increases up to +50% as Damage Resistance decreases.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Psycho`\n* **Obtainable From**: Scrapping Berserker's Items, Legendary Crafting\n\nScrap items with the **Berserker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 106,
    "source": "Vault Codex [1 Star]",
    "title": "Bloodied (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/6",
    "category": "1 Star Mods",
    "snippet": "Bloodied (1 Star): Damage increases up to +130% as Health decreases.. Craft with 15 Modules & 1 Adrenal Reaction Serum.",
    "content": "### Bloodied - 1 Star Legendary Mod\n\n* **Effect Bonus**: Damage increases up to +130% as Health decreases.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Adrenal Reaction Serum`\n* **Obtainable From**: Scrapping Bloodied Items, Legendary Crafting\n\nScrap items with the **Bloodied** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 107,
    "source": "Vault Codex [1 Star]",
    "title": "Bolstering (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/7",
    "category": "1 Star Mods",
    "snippet": "Bolstering (1 Star): Grants up to 10% Damage Reduction at lower Health Percent.. Craft with 15 Modules & 5 Med-X.",
    "content": "### Bolstering - 1 Star Legendary Mod\n\n* **Effect Bonus**: Grants up to 10% Damage Reduction at lower Health Percent.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Med-X`\n* **Obtainable From**: Scrapping Bolstering Items, Legendary Crafting\n\nScrap items with the **Bolstering** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 108,
    "source": "Vault Codex [1 Star]",
    "title": "Chameleon (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/8",
    "category": "1 Star Mods",
    "snippet": "Chameleon (1 Star): Become invisible while sneaking and not moving.. Craft with 15 Modules & 1 Chameleon Serum.",
    "content": "### Chameleon - 1 Star Legendary Mod\n\n* **Effect Bonus**: Become invisible while sneaking and not moving.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Chameleon Serum`\n* **Obtainable From**: Scrapping Chameleon Items, Legendary Crafting\n\nScrap items with the **Chameleon** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 109,
    "source": "Vault Codex [1 Star]",
    "title": "Cloaking (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/9",
    "category": "1 Star Mods",
    "snippet": "Cloaking (1 Star): Being hit in melee causes you to become invisible once every 30 seconds.. Craft with 15 Modules & 1 Stealth Boy.",
    "content": "### Cloaking - 1 Star Legendary Mod\n\n* **Effect Bonus**: Being hit in melee causes you to become invisible once every 30 seconds.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Stealth Boy`\n* **Obtainable From**: Scrapping Cloaking Items, Legendary Crafting\n\nScrap items with the **Cloaking** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 110,
    "source": "Vault Codex [1 Star]",
    "title": "Executioner's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/10",
    "category": "1 Star Mods",
    "snippet": "Executioner's (1 Star): +50% more damage when your target is below 40% Health.. Craft with 15 Modules & 25 Leather.",
    "content": "### Executioner's - 1 Star Legendary Mod\n\n* **Effect Bonus**: +50% more damage when your target is below 40% Health.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `25 Leather`\n* **Obtainable From**: Scrapping Executioner's Items, Legendary Crafting\n\nScrap items with the **Executioner's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 111,
    "source": "Vault Codex [1 Star]",
    "title": "Exterminator's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/11",
    "category": "1 Star Mods",
    "snippet": "Exterminator's (1 Star): [Armor] -15% damage from Mirelurks and Insects. [Weapon] +50% damage to Mirelurks and Insects.. Craft with 15 Modules & 1 Bloodbug Proboscis, 1 Stigwing Barb.",
    "content": "### Exterminator's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Mirelurks and Insects. [Weapon] +50% damage to Mirelurks and Insects.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bloodbug Proboscis, 1 Stigwing Barb`\n* **Obtainable From**: Scrapping Exterminator's Items, Legendary Crafting\n\nScrap items with the **Exterminator's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 112,
    "source": "Vault Codex [1 Star]",
    "title": "Feral's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/12",
    "category": "1 Star Mods",
    "snippet": "Feral's (1 Star): [Ghoul] Target kills make you go feral faster.. Craft with 15 Modules & 5 Black Titanium.",
    "content": "### Feral's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Ghoul] Target kills make you go feral faster.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Black Titanium`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Feral's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 113,
    "source": "Vault Codex [1 Star]",
    "title": "Furious (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/13",
    "category": "1 Star Mods",
    "snippet": "Furious (1 Star): +5% damage per Onslaught stack, +9 max stacks.. Craft with 15 Modules & 1 Fury.",
    "content": "### Furious - 1 Star Legendary Mod\n\n* **Effect Bonus**: +5% damage per Onslaught stack, +9 max stacks.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Fury`\n* **Obtainable From**: Scrapping Furious Items, Legendary Crafting\n\nScrap items with the **Furious** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 114,
    "source": "Vault Codex [1 Star]",
    "title": "Ghoul Slayer's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/14",
    "category": "1 Star Mods",
    "snippet": "Ghoul Slayer's (1 Star): [Armor] -15% damage from Ghouls. [Weapon] +50% damage to Ghouls.. Craft with 15 Modules & 1 RadShield.",
    "content": "### Ghoul Slayer's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Ghouls. [Weapon] +50% damage to Ghouls.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 RadShield`\n* **Obtainable From**: Scrapping Ghoul Slayer's Items, Legendary Crafting\n\nScrap items with the **Ghoul Slayer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 115,
    "source": "Vault Codex [1 Star]",
    "title": "Gourmand's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/15",
    "category": "1 Star Mods",
    "snippet": "Gourmand's (1 Star): Damage increases up to +40% as you fill Hunger/Thirst meters.. Craft with 15 Modules & 1 Vegetarian Ham.",
    "content": "### Gourmand's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Damage increases up to +40% as you fill Hunger/Thirst meters.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Vegetarian Ham`\n* **Obtainable From**: Scrapping Gourmand's Items, Legendary Crafting\n\nScrap items with the **Gourmand's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 116,
    "source": "Vault Codex [1 Star]",
    "title": "Hunter's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/16",
    "category": "1 Star Mods",
    "snippet": "Hunter's (1 Star): [Armor] -15% damage from Animals. [Weapon] +50% damage to Animals.. Craft with 15 Modules & 1 Yao Guai Hide.",
    "content": "### Hunter's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Animals. [Weapon] +50% damage to Animals.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Yao Guai Hide`\n* **Obtainable From**: Scrapping Hunter's Items, Legendary Crafting\n\nScrap items with the **Hunter's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 117,
    "source": "Vault Codex [1 Star]",
    "title": "Instigating (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/17",
    "category": "1 Star Mods",
    "snippet": "Instigating (1 Star): +50% damage against targets above 60% Health.. Craft with 15 Modules & 5 Whiskey.",
    "content": "### Instigating - 1 Star Legendary Mod\n\n* **Effect Bonus**: +50% damage against targets above 60% Health.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Whiskey`\n* **Obtainable From**: Scrapping Instigating Items, Legendary Crafting\n\nScrap items with the **Instigating** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 118,
    "source": "Vault Codex [1 Star]",
    "title": "Juggernaut's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/18",
    "category": "1 Star Mods",
    "snippet": "Juggernaut's (1 Star): Damage increases up to +100% as Health increases (1000HP = 100%).. Craft with 15 Modules & 5 Buffout.",
    "content": "### Juggernaut's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Damage increases up to +100% as Health increases (1000HP = 100%).\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Buffout`\n* **Obtainable From**: Scrapping Juggernaut's Items, Legendary Crafting\n\nScrap items with the **Juggernaut's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 119,
    "source": "Vault Codex [1 Star]",
    "title": "Junkie's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/19",
    "category": "1 Star Mods",
    "snippet": "Junkie's (1 Star): Damage increases per Addiction up to +100%.. Craft with 15 Modules & 5 Mentats.",
    "content": "### Junkie's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Damage increases per Addiction up to +100%.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Mentats`\n* **Obtainable From**: Scrapping Junkie's Items, Legendary Crafting\n\nScrap items with the **Junkie's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 120,
    "source": "Vault Codex [1 Star]",
    "title": "Life Saving (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/20",
    "category": "1 Star Mods",
    "snippet": "Life Saving (1 Star): When incapacitated, gain a 50% chance to revive yourself with a Stimpak, once every 60 seconds.. Craft with 15 Modules & 5 Stimpak.",
    "content": "### Life Saving - 1 Star Legendary Mod\n\n* **Effect Bonus**: When incapacitated, gain a 50% chance to revive yourself with a Stimpak, once every 60 seconds.\n* **Applicable Categories**: Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Stimpak`\n* **Obtainable From**: Scrapping Life Saving Items, Legendary Crafting\n\nScrap items with the **Life Saving** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 121,
    "source": "Vault Codex [1 Star]",
    "title": "Lucid (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/21",
    "category": "1 Star Mods",
    "snippet": "Lucid (1 Star): [Ghoul] [Armor] Damage reduction up to +6% as you fill Feral meter. [Weapon] Damage increases up to +40% as you fill Feral meter.. Craft with 15 Modules & 1 Bobblehead: Medicine.",
    "content": "### Lucid - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Ghoul] [Armor] Damage reduction up to +6% as you fill Feral meter. [Weapon] Damage increases up to +40% as you fill Feral meter.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Medicine`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Lucid** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 122,
    "source": "Vault Codex [1 Star]",
    "title": "Medic's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/22",
    "category": "1 Star Mods",
    "snippet": "Medic's (1 Star): Attacks will heal friendly targets by 5% Health.. Craft with 15 Modules & 1 Bobblehead: Medicine.",
    "content": "### Medic's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Attacks will heal friendly targets by 5% Health.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Medicine`\n* **Obtainable From**: Scrapping Medic's Items, Legendary Crafting\n\nScrap items with the **Medic's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 123,
    "source": "Vault Codex [1 Star]",
    "title": "Mutant Slayer's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/23",
    "category": "1 Star Mods",
    "snippet": "Mutant Slayer's (1 Star): [Armor] -15% damage from Super Mutants. [Weapon] +50% damage to Super Mutants.. Craft with 15 Modules & 1 Super Mutant Head.",
    "content": "### Mutant Slayer's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Super Mutants. [Weapon] +50% damage to Super Mutants.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Super Mutant Head`\n* **Obtainable From**: Scrapping Mutant Slayer's Items, Legendary Crafting\n\nScrap items with the **Mutant Slayer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 124,
    "source": "Vault Codex [1 Star]",
    "title": "Mutant's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/24",
    "category": "1 Star Mods",
    "snippet": "Mutant's (1 Star): [Armor] Up to 5% Damage Reduction as you acquire more Mutations. [Weapon] Damage increases up to +50% as you gain Mutations.. Craft with 15 Modules & 10 Asbestos.",
    "content": "### Mutant's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] Up to 5% Damage Reduction as you acquire more Mutations. [Weapon] Damage increases up to +50% as you gain Mutations.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `10 Asbestos`\n* **Obtainable From**: Scrapping Mutant's Items, Legendary Crafting\n\nScrap items with the **Mutant's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 125,
    "source": "Vault Codex [1 Star]",
    "title": "Nocturnal (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/25",
    "category": "1 Star Mods",
    "snippet": "Nocturnal (1 Star): [Armor] +4 Perception and Agility while cloaked. [Weapon] +50% damage while cloaked.. Craft with 15 Modules & 10 Nuclear Material.",
    "content": "### Nocturnal - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] +4 Perception and Agility while cloaked. [Weapon] +50% damage while cloaked.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `10 Nuclear Material`\n* **Obtainable From**: Scrapping Nocturnal Items, Legendary Crafting\n\nScrap items with the **Nocturnal** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 126,
    "source": "Vault Codex [1 Star]",
    "title": "Overeater's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/26",
    "category": "1 Star Mods",
    "snippet": "Overeater's (1 Star): Increases Max Health up to 40 as you fill Hunger/Thirst meters.. Craft with 15 Modules & 1 Perfect Bubblegum.",
    "content": "### Overeater's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Increases Max Health up to 40 as you fill Hunger/Thirst meters.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Perfect Bubblegum`\n* **Obtainable From**: Scrapping Overeater's Items, Legendary Crafting\n\nScrap items with the **Overeater's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 127,
    "source": "Vault Codex [1 Star]",
    "title": "Quad (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/27",
    "category": "1 Star Mods",
    "snippet": "Quad (1 Star): +300% ammo capacity.. Craft with 15 Modules & 1 Fusion Core.",
    "content": "### Quad - 1 Star Legendary Mod\n\n* **Effect Bonus**: +300% ammo capacity.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Fusion Core`\n* **Obtainable From**: Scrapping Quad Items, Legendary Crafting\n\nScrap items with the **Quad** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 128,
    "source": "Vault Codex [1 Star]",
    "title": "Regenerating (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/28",
    "category": "1 Star Mods",
    "snippet": "Regenerating (1 Star): +0.5% heal rate.. Craft with 15 Modules & 1 Healing Factor Serum.",
    "content": "### Regenerating - 1 Star Legendary Mod\n\n* **Effect Bonus**: +0.5% heal rate.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Healing Factor Serum`\n* **Obtainable From**: Scrapping Regenerating Items, Legendary Crafting\n\nScrap items with the **Regenerating** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 129,
    "source": "Vault Codex [1 Star]",
    "title": "Sniper's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/29",
    "category": "1 Star Mods",
    "snippet": "Sniper's (1 Star): 100% damage to distant targets.. Craft with 15 Modules & 1 Bobblehead: Perception.",
    "content": "### Sniper's - 1 Star Legendary Mod\n\n* **Effect Bonus**: 100% damage to distant targets.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Perception`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Sniper's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 130,
    "source": "Vault Codex [1 Star]",
    "title": "Stalker's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/30",
    "category": "1 Star Mods",
    "snippet": "Stalker's (1 Star): +100% sneak attack damage.. Craft with 15 Modules & 1 Calmex.",
    "content": "### Stalker's - 1 Star Legendary Mod\n\n* **Effect Bonus**: +100% sneak attack damage.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Calmex`\n* **Obtainable From**: Scrapping Stalker's Items, Legendary Crafting\n\nScrap items with the **Stalker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 131,
    "source": "Vault Codex [1 Star]",
    "title": "Suppressor's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/31",
    "category": "1 Star Mods",
    "snippet": "Suppressor's (1 Star): Reduce your target's damage output by 25% for 5 seconds.. Craft with 15 Modules & 1 Grounded Serum.",
    "content": "### Suppressor's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Reduce your target's damage output by 25% for 5 seconds.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Grounded Serum`\n* **Obtainable From**: Scrapping Suppressor's Items, Legendary Crafting\n\nScrap items with the **Suppressor's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 132,
    "source": "Vault Codex [1 Star]",
    "title": "Troubleshooter's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/32",
    "category": "1 Star Mods",
    "snippet": "Troubleshooter's (1 Star): [Armor] -15% damage from Robots. [Weapon] +50% damage to Robots.. Craft with 15 Modules & 10 Circuitry.",
    "content": "### Troubleshooter's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Robots. [Weapon] +50% damage to Robots.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `10 Circuitry`\n* **Obtainable From**: Scrapping Troubleshooter's Items, Legendary Crafting\n\nScrap items with the **Troubleshooter's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 133,
    "source": "Vault Codex [1 Star]",
    "title": "Two Shot (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/33",
    "category": "1 Star Mods",
    "snippet": "Two Shot (1 Star): +1 projectile, +75% damage, -150% hip-fire accuracy, +100% recoil.. Craft with 15 Modules & 20 Lead.",
    "content": "### Two Shot - 1 Star Legendary Mod\n\n* **Effect Bonus**: +1 projectile, +75% damage, -150% hip-fire accuracy, +100% recoil.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `20 Lead`\n* **Obtainable From**: Scrapping Two Shot Items, Legendary Crafting\n\nScrap items with the **Two Shot** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 134,
    "source": "Vault Codex [1 Star]",
    "title": "Unyielding (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/34",
    "category": "1 Star Mods",
    "snippet": "Unyielding (1 Star): Gain up to +3 to all S.P.E.C.I.A.L. (except END) when Health is low.. Craft with 15 Modules & 5 X-Cell.",
    "content": "### Unyielding - 1 Star Legendary Mod\n\n* **Effect Bonus**: Gain up to +3 to all S.P.E.C.I.A.L. (except END) when Health is low.\n* **Applicable Categories**: Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 X-Cell`\n* **Obtainable From**: Scrapping Unyielding Items, Legendary Crafting\n\nScrap items with the **Unyielding** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 135,
    "source": "Vault Codex [1 Star]",
    "title": "Vampire's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/35",
    "category": "1 Star Mods",
    "snippet": "Vampire's (1 Star): Restore 2% Health over 2 seconds when you hit a target.. Craft with 15 Modules & 10 Bloodpacks.",
    "content": "### Vampire's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Restore 2% Health over 2 seconds when you hit a target.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `10 Bloodpacks`\n* **Obtainable From**: Scrapping Vampire's Items, Legendary Crafting\n\nScrap items with the **Vampire's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 136,
    "source": "Vault Codex [1 Star]",
    "title": "Vanguard's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/36",
    "category": "1 Star Mods",
    "snippet": "Vanguard's (1 Star): Grants up to 6% Damage Reduction as Health Increases.. Craft with 15 Modules & 5 Blood Pack.",
    "content": "### Vanguard's - 1 Star Legendary Mod\n\n* **Effect Bonus**: Grants up to 6% Damage Reduction as Health Increases.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `5 Blood Pack`\n* **Obtainable From**: Scrapping Vanguard's Items, Legendary Crafting\n\nScrap items with the **Vanguard's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 137,
    "source": "Vault Codex [1 Star]",
    "title": "Heavyweight (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/37",
    "category": "1 Star Mods",
    "snippet": "Heavyweight (1 Star): Grants up to 10% Damage Reduction at Higher Encumbrance (Max at 150% Encumbrance).. Craft with 15 Modules & 1 Bird Bones Serum.",
    "content": "### Heavyweight - 1 Star Legendary Mod\n\n* **Effect Bonus**: Grants up to 10% Damage Reduction at Higher Encumbrance (Max at 150% Encumbrance).\n* **Applicable Categories**: Armor\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `1 Bird Bones Serum`\n* **Obtainable From**: Scrapping Heavyweight Items, Legendary Crafting\n\nScrap items with the **Heavyweight** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 138,
    "source": "Vault Codex [1 Star]",
    "title": "Zealot's (1 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/38",
    "category": "1 Star Mods",
    "snippet": "Zealot's (1 Star): [Armor] -15% damage from Scorched. [Weapon] +50% damage to Scorched.. Craft with 15 Modules & 10 Ultracite.",
    "content": "### Zealot's - 1 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] -15% damage from Scorched. [Weapon] +50% damage to Scorched.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `15 Legendary Modules`\n* **Required Crafting Component**: `10 Ultracite`\n* **Obtainable From**: Scrapping Zealot's Items, Legendary Crafting\n\nScrap items with the **Zealot's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 139,
    "source": "Vault Codex [2 Star]",
    "title": "Agility (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/39",
    "category": "2 Star Mods",
    "snippet": "Agility (2 Star): +2 Agility.. Craft with 30 Modules & 1 Bobblehead: Agility.",
    "content": "### Agility - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Agility.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Agility`\n* **Obtainable From**: Scrapping Agility Items, Legendary Crafting\n\nScrap items with the **Agility** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 140,
    "source": "Vault Codex [2 Star]",
    "title": "Antiseptic (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/40",
    "category": "2 Star Mods",
    "snippet": "Antiseptic (2 Star): +25% reduced disease chance from environmental hazards.. Craft with 30 Modules & 10 Disease Cure.",
    "content": "### Antiseptic - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25% reduced disease chance from environmental hazards.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Disease Cure`\n* **Obtainable From**: Scrapping Antiseptic Items, Legendary Crafting\n\nScrap items with the **Antiseptic** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 141,
    "source": "Vault Codex [2 Star]",
    "title": "Basher's (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/41",
    "category": "2 Star Mods",
    "snippet": "Basher's (2 Star): +50% bash damage.. Craft with 30 Modules & 25 Concrete.",
    "content": "### Basher's - 2 Star Legendary Mod\n\n* **Effect Bonus**: +50% bash damage.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `25 Concrete`\n* **Obtainable From**: Scrapping Basher's Items, Legendary Crafting\n\nScrap items with the **Basher's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 142,
    "source": "Vault Codex [2 Star]",
    "title": "Charisma (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/42",
    "category": "2 Star Mods",
    "snippet": "Charisma (2 Star): +2 Charisma.. Craft with 30 Modules & 1 Bobblehead: Charisma.",
    "content": "### Charisma - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Charisma.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Charisma`\n* **Obtainable From**: Scrapping Charisma Items, Legendary Crafting\n\nScrap items with the **Charisma** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 143,
    "source": "Vault Codex [2 Star]",
    "title": "Crippling (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/43",
    "category": "2 Star Mods",
    "snippet": "Crippling (2 Star): +50% limb damage.. Craft with 30 Modules & 5 Black Titanium.",
    "content": "### Crippling - 2 Star Legendary Mod\n\n* **Effect Bonus**: +50% limb damage.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `5 Black Titanium`\n* **Obtainable From**: Scrapping Crippling Items, Legendary Crafting\n\nScrap items with the **Crippling** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 144,
    "source": "Vault Codex [2 Star]",
    "title": "Elementalist (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/44",
    "category": "2 Star Mods",
    "snippet": "Elementalist (2 Star): Increase all resistances by 5.. Craft with 30 Modules & 1 Bobblehead: Endurance.",
    "content": "### Elementalist - 2 Star Legendary Mod\n\n* **Effect Bonus**: Increase all resistances by 5.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Endurance`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Elementalist** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 145,
    "source": "Vault Codex [2 Star]",
    "title": "Endurance (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/45",
    "category": "2 Star Mods",
    "snippet": "Endurance (2 Star): +2 Endurance.. Craft with 30 Modules & 1 Bobblehead: Endurance.",
    "content": "### Endurance - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Endurance.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Endurance`\n* **Obtainable From**: Scrapping Endurance Items, Legendary Crafting\n\nScrap items with the **Endurance** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 146,
    "source": "Vault Codex [2 Star]",
    "title": "Explosive (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/46",
    "category": "2 Star Mods",
    "snippet": "Explosive (2 Star): Projectiles explode for +20% weapon damage.. Craft with 30 Modules & 1 Bobblehead: Explosive.",
    "content": "### Explosive - 2 Star Legendary Mod\n\n* **Effect Bonus**: Projectiles explode for +20% weapon damage.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Explosive`\n* **Obtainable From**: Scrapping Explosive Items, Legendary Crafting\n\nScrap items with the **Explosive** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 147,
    "source": "Vault Codex [2 Star]",
    "title": "Fierce (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/47",
    "category": "2 Star Mods",
    "snippet": "Fierce (2 Star): Fortify limb resistance based on Kill Streak count (1% per kill).. Craft with 30 Modules & 1 Bobblehead: Strength.",
    "content": "### Fierce - 2 Star Legendary Mod\n\n* **Effect Bonus**: Fortify limb resistance based on Kill Streak count (1% per kill).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Strength`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Fierce** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 148,
    "source": "Vault Codex [2 Star]",
    "title": "Fireproof (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/48",
    "category": "2 Star Mods",
    "snippet": "Fireproof (2 Star): +25 Fire Resistance.. Craft with 30 Modules & 10 Floater Flamer Puc Sac.",
    "content": "### Fireproof - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25 Fire Resistance.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Floater Flamer Puc Sac`\n* **Obtainable From**: Scrapping Fireproof Items, Legendary Crafting\n\nScrap items with the **Fireproof** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 149,
    "source": "Vault Codex [2 Star]",
    "title": "Glutton (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/49",
    "category": "2 Star Mods",
    "snippet": "Glutton (2 Star): Hunger and Thirst grow 10% slower.. Craft with 30 Modules & 1 Perfect Bubblegum.",
    "content": "### Glutton - 2 Star Legendary Mod\n\n* **Effect Bonus**: Hunger and Thirst grow 10% slower.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Perfect Bubblegum`\n* **Obtainable From**: Scrapping Glutton Items, Legendary Crafting\n\nScrap items with the **Glutton** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 150,
    "source": "Vault Codex [2 Star]",
    "title": "Hardy (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/50",
    "category": "2 Star Mods",
    "snippet": "Hardy (2 Star): Receive 7% less explosion damage.. Craft with 30 Modules & 1 Bobblehead: Explosive.",
    "content": "### Hardy - 2 Star Legendary Mod\n\n* **Effect Bonus**: Receive 7% less explosion damage.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Explosive`\n* **Obtainable From**: Scrapping Hardy Items, Legendary Crafting\n\nScrap items with the **Hardy** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 151,
    "source": "Vault Codex [2 Star]",
    "title": "HazMat (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/51",
    "category": "2 Star Mods",
    "snippet": "HazMat (2 Star): +25 Radiation Resistance.. Craft with 30 Modules & 10 Rad-x.",
    "content": "### HazMat - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25 Radiation Resistance.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Rad-x`\n* **Obtainable From**: Scrapping HazMat Items, Legendary Crafting\n\nScrap items with the **HazMat** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 152,
    "source": "Vault Codex [2 Star]",
    "title": "Heavy Hitter's (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/52",
    "category": "2 Star Mods",
    "snippet": "Heavy Hitter's (2 Star): +40% power attack damage.. Craft with 30 Modules & 25 Concrete.",
    "content": "### Heavy Hitter's - 2 Star Legendary Mod\n\n* **Effect Bonus**: +40% power attack damage.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `25 Concrete`\n* **Obtainable From**: Scrapping Heavy Hitter's Items, Legendary Crafting\n\nScrap items with the **Heavy Hitter's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 153,
    "source": "Vault Codex [2 Star]",
    "title": "Hitman's (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/53",
    "category": "2 Star Mods",
    "snippet": "Hitman's (2 Star): +25% damage while aiming.. Craft with 30 Modules & 10 Fiber Optics.",
    "content": "### Hitman's - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25% damage while aiming.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Fiber Optics`\n* **Obtainable From**: Scrapping Hitman's Items, Legendary Crafting\n\nScrap items with the **Hitman's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 154,
    "source": "Vault Codex [2 Star]",
    "title": "Inertial (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/54",
    "category": "2 Star Mods",
    "snippet": "Inertial (2 Star): Replenish 15 Action Points with each kill.. Craft with 30 Modules & 10 Canned Coffee.",
    "content": "### Inertial - 2 Star Legendary Mod\n\n* **Effect Bonus**: Replenish 15 Action Points with each kill.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Canned Coffee`\n* **Obtainable From**: Scrapping Inertial Items, Legendary Crafting\n\nScrap items with the **Inertial** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 155,
    "source": "Vault Codex [2 Star]",
    "title": "Intelligence (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/55",
    "category": "2 Star Mods",
    "snippet": "Intelligence (2 Star): +2 Intelligence.. Craft with 30 Modules & 1 Bobblehead: Intelligence.",
    "content": "### Intelligence - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Intelligence.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Intelligence`\n* **Obtainable From**: Scrapping Intelligence Items, Legendary Crafting\n\nScrap items with the **Intelligence** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 156,
    "source": "Vault Codex [2 Star]",
    "title": "Last Shot (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/56",
    "category": "2 Star Mods",
    "snippet": "Last Shot (2 Star): Last round in a magazine has a 25% chance to deal +100% damage.. Craft with 30 Modules & 15 Gunpowder.",
    "content": "### Last Shot - 2 Star Legendary Mod\n\n* **Effect Bonus**: Last round in a magazine has a 25% chance to deal +100% damage.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `15 Gunpowder`\n* **Obtainable From**: Scrapping Last Shot Items, Legendary Crafting\n\nScrap items with the **Last Shot** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 157,
    "source": "Vault Codex [2 Star]",
    "title": "Luck (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/57",
    "category": "2 Star Mods",
    "snippet": "Luck (2 Star): +2 Luck.. Craft with 30 Modules & 1 Bobblehead: Luck.",
    "content": "### Luck - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Luck.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Luck`\n* **Obtainable From**: Scrapping Luck Items, Legendary Crafting\n\nScrap items with the **Luck** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 158,
    "source": "Vault Codex [2 Star]",
    "title": "Pain Killer (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/58",
    "category": "2 Star Mods",
    "snippet": "Pain Killer (2 Star): Gain Health over time while on a Kill Streak; stronger with higher streak.. Craft with 30 Modules & 1 Bobblehead: Medicine.",
    "content": "### Pain Killer - 2 Star Legendary Mod\n\n* **Effect Bonus**: Gain Health over time while on a Kill Streak; stronger with higher streak.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Medicine`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Pain Killer** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 159,
    "source": "Vault Codex [2 Star]",
    "title": "Perception (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/59",
    "category": "2 Star Mods",
    "snippet": "Perception (2 Star): +2 Perception.. Craft with 30 Modules & 1 Bobblehead: Perception.",
    "content": "### Perception - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Perception.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Perception`\n* **Obtainable From**: Scrapping Perception Items, Legendary Crafting\n\nScrap items with the **Perception** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 160,
    "source": "Vault Codex [2 Star]",
    "title": "Pick Pocketer's (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/60",
    "category": "2 Star Mods",
    "snippet": "Pick Pocketer's (2 Star): Target kills have 50% chance to grant 1\u20134 Caps.. Craft with 30 Modules & 1 Bobblehead: Caps.",
    "content": "### Pick Pocketer's - 2 Star Legendary Mod\n\n* **Effect Bonus**: Target kills have 50% chance to grant 1\u20134 Caps.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Caps`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Pick Pocketer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 161,
    "source": "Vault Codex [2 Star]",
    "title": "Poisoner's (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/61",
    "category": "2 Star Mods",
    "snippet": "Poisoner's (2 Star): +25 Poison Resistance.. Craft with 30 Modules & 10 Floater Gnasher Puc Sac.",
    "content": "### Poisoner's - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25 Poison Resistance.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Floater Gnasher Puc Sac`\n* **Obtainable From**: Scrapping Poisoner's Items, Legendary Crafting\n\nScrap items with the **Poisoner's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 162,
    "source": "Vault Codex [2 Star]",
    "title": "Powered (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/62",
    "category": "2 Star Mods",
    "snippet": "Powered (2 Star): +5% Action Point regen.. Craft with 30 Modules & 10 Canned Coffee.",
    "content": "### Powered - 2 Star Legendary Mod\n\n* **Effect Bonus**: +5% Action Point regen.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Canned Coffee`\n* **Obtainable From**: Scrapping Powered Items, Legendary Crafting\n\nScrap items with the **Powered** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 163,
    "source": "Vault Codex [2 Star]",
    "title": "Rapid (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/63",
    "category": "2 Star Mods",
    "snippet": "Rapid (2 Star): [Ranged] +25% weapon speed. [Melee] +40% weapon speed.. Craft with 30 Modules & 1 Speed Demon Serum.",
    "content": "### Rapid - 2 Star Legendary Mod\n\n* **Effect Bonus**: [Ranged] +25% weapon speed. [Melee] +40% weapon speed.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Speed Demon Serum`\n* **Obtainable From**: Scrapping Rapid Items, Legendary Crafting\n\nScrap items with the **Rapid** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 164,
    "source": "Vault Codex [2 Star]",
    "title": "Riposting (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/64",
    "category": "2 Star Mods",
    "snippet": "Riposting (2 Star): +50% melee damage reflection while blocking.. Craft with 30 Modules & 25 Glass.",
    "content": "### Riposting - 2 Star Legendary Mod\n\n* **Effect Bonus**: +50% melee damage reflection while blocking.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `25 Glass`\n* **Obtainable From**: Scrapping Riposting Items, Legendary Crafting\n\nScrap items with the **Riposting** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 165,
    "source": "Vault Codex [2 Star]",
    "title": "Rushing (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/65",
    "category": "2 Star Mods",
    "snippet": "Rushing (2 Star): Gain Action Points over time while on a Kill Streak; stronger with higher streak.. Craft with 30 Modules & 1 Bobblehead: Agility.",
    "content": "### Rushing - 2 Star Legendary Mod\n\n* **Effect Bonus**: Gain Action Points over time while on a Kill Streak; stronger with higher streak.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Agility`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Rushing** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 166,
    "source": "Vault Codex [2 Star]",
    "title": "Steady (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/66",
    "category": "2 Star Mods",
    "snippet": "Steady (2 Star): +25% melee damage while not moving.. Craft with 30 Modules & 3 Orange Mentats.",
    "content": "### Steady - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25% melee damage while not moving.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `3 Orange Mentats`\n* **Obtainable From**: Scrapping Steady Items, Legendary Crafting\n\nScrap items with the **Steady** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 167,
    "source": "Vault Codex [2 Star]",
    "title": "Strength (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/67",
    "category": "2 Star Mods",
    "snippet": "Strength (2 Star): +2 Strength.. Craft with 30 Modules & 1 Bobblehead: Strength.",
    "content": "### Strength - 2 Star Legendary Mod\n\n* **Effect Bonus**: +2 Strength.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Strength`\n* **Obtainable From**: Scrapping Strength Items, Legendary Crafting\n\nScrap items with the **Strength** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 168,
    "source": "Vault Codex [2 Star]",
    "title": "V.A.T.S. Enhanced (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/68",
    "category": "2 Star Mods",
    "snippet": "V.A.T.S. Enhanced (2 Star): +50% chance to hit a target in V.A.T.S.. Craft with 30 Modules & 3 Berry Mentats.",
    "content": "### V.A.T.S. Enhanced - 2 Star Legendary Mod\n\n* **Effect Bonus**: +50% chance to hit a target in V.A.T.S.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `3 Berry Mentats`\n* **Obtainable From**: Scrapping V.A.T.S. Enhanced Items, Legendary Crafting\n\nScrap items with the **V.A.T.S. Enhanced** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 169,
    "source": "Vault Codex [2 Star]",
    "title": "Vital (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/69",
    "category": "2 Star Mods",
    "snippet": "Vital (2 Star): +50% critical damage.. Craft with 30 Modules & 1 Eagle Eyes Serum.",
    "content": "### Vital - 2 Star Legendary Mod\n\n* **Effect Bonus**: +50% critical damage.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `1 Eagle Eyes Serum`\n* **Obtainable From**: Scrapping Vital Items, Legendary Crafting\n\nScrap items with the **Vital** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 170,
    "source": "Vault Codex [2 Star]",
    "title": "Warming (2 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/70",
    "category": "2 Star Mods",
    "snippet": "Warming (2 Star): +25 Cryo Resistance.. Craft with 30 Modules & 10 Floater Freezer Pus Sac.",
    "content": "### Warming - 2 Star Legendary Mod\n\n* **Effect Bonus**: +25 Cryo Resistance.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `30 Legendary Modules`\n* **Required Crafting Component**: `10 Floater Freezer Pus Sac`\n* **Obtainable From**: Scrapping Warming Items, Legendary Crafting\n\nScrap items with the **Warming** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 171,
    "source": "Vault Codex [3 Star]",
    "title": "Acrobat's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/71",
    "category": "3 Star Mods",
    "snippet": "Acrobat's (3 Star): -50% fall damage.. Craft with 60 Modules & 1 Marsupial Serum.",
    "content": "### Acrobat's - 3 Star Legendary Mod\n\n* **Effect Bonus**: -50% fall damage.\n* **Applicable Categories**: Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Marsupial Serum`\n* **Obtainable From**: Scrapping Acrobat's Items, Legendary Crafting\n\nScrap items with the **Acrobat's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 172,
    "source": "Vault Codex [3 Star]",
    "title": "Active (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/72",
    "category": "3 Star Mods",
    "snippet": "Active (3 Star): Max AP increased by +20.. Craft with 60 Modules & 1 Bobblehead: Agility.",
    "content": "### Active - 3 Star Legendary Mod\n\n* **Effect Bonus**: Max AP increased by +20.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Agility`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Active** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 173,
    "source": "Vault Codex [3 Star]",
    "title": "Adamantium (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/73",
    "category": "3 Star Mods",
    "snippet": "Adamantium (3 Star): Receive 15% less limb damage.. Craft with 60 Modules & 1 Twisted Muscles Serum.",
    "content": "### Adamantium - 3 Star Legendary Mod\n\n* **Effect Bonus**: Receive 15% less limb damage.\n* **Applicable Categories**: Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Twisted Muscles Serum`\n* **Obtainable From**: Scrapping Adamantium Items, Legendary Crafting\n\nScrap items with the **Adamantium** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 174,
    "source": "Vault Codex [3 Star]",
    "title": "Agility (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/74",
    "category": "3 Star Mods",
    "snippet": "Agility (3 Star): +3 Agility.. Craft with 60 Modules & 1 Bobblehead: Agility.",
    "content": "### Agility - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Agility.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Agility`\n* **Obtainable From**: Scrapping Agility Items, Legendary Crafting\n\nScrap items with the **Agility** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 175,
    "source": "Vault Codex [3 Star]",
    "title": "Arms Keeper's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/75",
    "category": "3 Star Mods",
    "snippet": "Arms Keeper's (3 Star): Weapon weights reduced by 20%.. Craft with 60 Modules & 1 Bobblehead: Small Guns.",
    "content": "### Arms Keeper's - 3 Star Legendary Mod\n\n* **Effect Bonus**: Weapon weights reduced by 20%.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Small Guns`\n* **Obtainable From**: Scrapping Arms Keeper's Items, Legendary Crafting\n\nScrap items with the **Arms Keeper's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 176,
    "source": "Vault Codex [3 Star]",
    "title": "Barbarian (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/76",
    "category": "3 Star Mods",
    "snippet": "Barbarian (3 Star): +1 STR per kill while on a Kill Streak (max 10).. Craft with 60 Modules & 1 Bobblehead: Melee.",
    "content": "### Barbarian - 3 Star Legendary Mod\n\n* **Effect Bonus**: +1 STR per kill while on a Kill Streak (max 10).\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Melee`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Barbarian** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 177,
    "source": "Vault Codex [3 Star]",
    "title": "Belted (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/77",
    "category": "3 Star Mods",
    "snippet": "Belted (3 Star): Ammo weight reduced by 20%.. Craft with 60 Modules & 25 Lead.",
    "content": "### Belted - 3 Star Legendary Mod\n\n* **Effect Bonus**: Ammo weight reduced by 20%.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `25 Lead`\n* **Obtainable From**: Scrapping Belted Items, Legendary Crafting\n\nScrap items with the **Belted** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 178,
    "source": "Vault Codex [3 Star]",
    "title": "Blocker (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/78",
    "category": "3 Star Mods",
    "snippet": "Blocker (3 Star): +15% more damage blocked.. Craft with 60 Modules & 10 Oil.",
    "content": "### Blocker - 3 Star Legendary Mod\n\n* **Effect Bonus**: +15% more damage blocked.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 Oil`\n* **Obtainable From**: Scrapping Blocker Items, Legendary Crafting\n\nScrap items with the **Blocker** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 179,
    "source": "Vault Codex [3 Star]",
    "title": "Burning (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/79",
    "category": "3 Star Mods",
    "snippet": "Burning (3 Star): 5% chance to deal 12 Fire damage per second for 3s to melee attackers.. Craft with 60 Modules & 15 Floater Flamer Pus Sac.",
    "content": "### Burning - 3 Star Legendary Mod\n\n* **Effect Bonus**: 5% chance to deal 12 Fire damage per second for 3s to melee attackers.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `15 Floater Flamer Pus Sac`\n* **Obtainable From**: Scrapping Burning Items, Legendary Crafting\n\nScrap items with the **Burning** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 180,
    "source": "Vault Codex [3 Star]",
    "title": "Cavalier's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/80",
    "category": "3 Star Mods",
    "snippet": "Cavalier's (3 Star): -10% Damage Taken While Sprinting.. Craft with 60 Modules & 10 Oil.",
    "content": "### Cavalier's - 3 Star Legendary Mod\n\n* **Effect Bonus**: -10% Damage Taken While Sprinting.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 Oil`\n* **Obtainable From**: Scrapping Cavalier's Items, Legendary Crafting\n\nScrap items with the **Cavalier's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 181,
    "source": "Vault Codex [3 Star]",
    "title": "Charisma (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/81",
    "category": "3 Star Mods",
    "snippet": "Charisma (3 Star): +3 Charisma.. Craft with 60 Modules & 1 Bobblehead: Charisma.",
    "content": "### Charisma - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Charisma.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Charisma`\n* **Obtainable From**: Scrapping Charisma Items, Legendary Crafting\n\nScrap items with the **Charisma** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 182,
    "source": "Vault Codex [3 Star]",
    "title": "Defender's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/82",
    "category": "3 Star Mods",
    "snippet": "Defender's (3 Star): [Armor] 5% Chance To Automatically Block Attacks. [Melee] -40% damage taken while power attacking.. Craft with 60 Modules & 25 Steel.",
    "content": "### Defender's - 3 Star Legendary Mod\n\n* **Effect Bonus**: [Armor] 5% Chance To Automatically Block Attacks. [Melee] -40% damage taken while power attacking.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `25 Steel`\n* **Obtainable From**: Scrapping Defender's Items, Legendary Crafting\n\nScrap items with the **Defender's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 183,
    "source": "Vault Codex [3 Star]",
    "title": "Dissipating (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/83",
    "category": "3 Star Mods",
    "snippet": "Dissipating (3 Star): +0.25% radiation damage recovery.. Craft with 60 Modules & 10 RadAway.",
    "content": "### Dissipating - 3 Star Legendary Mod\n\n* **Effect Bonus**: +0.25% radiation damage recovery.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 RadAway`\n* **Obtainable From**: Scrapping Dissipating Items, Legendary Crafting\n\nScrap items with the **Dissipating** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 184,
    "source": "Vault Codex [3 Star]",
    "title": "Diver's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/84",
    "category": "3 Star Mods",
    "snippet": "Diver's (3 Star): Breathe underwater.. Craft with 60 Modules & 15 Plastic.",
    "content": "### Diver's - 3 Star Legendary Mod\n\n* **Effect Bonus**: Breathe underwater.\n* **Applicable Categories**: Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `15 Plastic`\n* **Obtainable From**: Scrapping Diver's Items, Legendary Crafting\n\nScrap items with the **Diver's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 185,
    "source": "Vault Codex [3 Star]",
    "title": "Doctor's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/85",
    "category": "3 Star Mods",
    "snippet": "Doctor's (3 Star): +5% effectiveness of Stimpaks, RadAway, and Rad-X.. Craft with 60 Modules & 1 Stimpak: Super.",
    "content": "### Doctor's - 3 Star Legendary Mod\n\n* **Effect Bonus**: +5% effectiveness of Stimpaks, RadAway, and Rad-X.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Stimpak: Super`\n* **Obtainable From**: Scrapping Doctor's Items, Legendary Crafting\n\nScrap items with the **Doctor's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 186,
    "source": "Vault Codex [3 Star]",
    "title": "Durability (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/86",
    "category": "3 Star Mods",
    "snippet": "Durability (3 Star): Breaks 50% slower.. Craft with 60 Modules & 1 Bobblehead: Repair.",
    "content": "### Durability - 3 Star Legendary Mod\n\n* **Effect Bonus**: Breaks 50% slower.\n* **Applicable Categories**: Armor \u2022 Power Armor \u2022 Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Repair`\n* **Obtainable From**: Scrapping Durability Items, Legendary Crafting\n\nScrap items with the **Durability** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 187,
    "source": "Vault Codex [3 Star]",
    "title": "Electrified (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/87",
    "category": "3 Star Mods",
    "snippet": "Electrified (3 Star): 5% chance to deal 12 Energy damage per second for 3s to melee attackers.. Craft with 60 Modules & 1 Electrically Charged Serum.",
    "content": "### Electrified - 3 Star Legendary Mod\n\n* **Effect Bonus**: 5% chance to deal 12 Energy damage per second for 3s to melee attackers.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Electrically Charged Serum`\n* **Obtainable From**: Scrapping Electrified Items, Legendary Crafting\n\nScrap items with the **Electrified** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 188,
    "source": "Vault Codex [3 Star]",
    "title": "Endurance (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/88",
    "category": "3 Star Mods",
    "snippet": "Endurance (3 Star): +3 Endurance.. Craft with 60 Modules & 1 Bobblehead: Endurance.",
    "content": "### Endurance - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Endurance.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Endurance`\n* **Obtainable From**: Scrapping Endurance Items, Legendary Crafting\n\nScrap items with the **Endurance** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 189,
    "source": "Vault Codex [3 Star]",
    "title": "Frozen (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/89",
    "category": "3 Star Mods",
    "snippet": "Frozen (3 Star): 5% chance to deal 12 Cryo damage per second for 4s to melee attackers.. Craft with 60 Modules & 15 Floater Freezer Pus Sac.",
    "content": "### Frozen - 3 Star Legendary Mod\n\n* **Effect Bonus**: 5% chance to deal 12 Cryo damage per second for 4s to melee attackers.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `15 Floater Freezer Pus Sac`\n* **Obtainable From**: Scrapping Frozen Items, Legendary Crafting\n\nScrap items with the **Frozen** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 190,
    "source": "Vault Codex [3 Star]",
    "title": "Ghost's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/90",
    "category": "3 Star Mods",
    "snippet": "Ghost's (3 Star): 10% chance to become invisible for 2 seconds when hitting a target.. Craft with 60 Modules & 1 Stealth Boy.",
    "content": "### Ghost's - 3 Star Legendary Mod\n\n* **Effect Bonus**: 10% chance to become invisible for 2 seconds when hitting a target.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Stealth Boy`\n* **Obtainable From**: Scrapping Ghost's Items, Legendary Crafting\n\nScrap items with the **Ghost's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 191,
    "source": "Vault Codex [3 Star]",
    "title": "Glowing (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/91",
    "category": "3 Star Mods",
    "snippet": "Glowing (3 Star): [Ghoul] Target kills increase Glow by a small amount. [Human] Target kills increase Rads by a small amount (20 RADs).. Craft with 60 Modules & 1 Bobblehead: Science.",
    "content": "### Glowing - 3 Star Legendary Mod\n\n* **Effect Bonus**: [Ghoul] Target kills increase Glow by a small amount. [Human] Target kills increase Rads by a small amount (20 RADs).\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Science`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Glowing** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 192,
    "source": "Vault Codex [3 Star]",
    "title": "Healthy (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/92",
    "category": "3 Star Mods",
    "snippet": "Healthy (3 Star): Max HP increased by +20.. Craft with 60 Modules & 1 Bobblehead: Endurance.",
    "content": "### Healthy - 3 Star Legendary Mod\n\n* **Effect Bonus**: Max HP increased by +20.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Endurance`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Healthy** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 193,
    "source": "Vault Codex [3 Star]",
    "title": "Intelligence (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/93",
    "category": "3 Star Mods",
    "snippet": "Intelligence (3 Star): +3 Intelligence.. Craft with 60 Modules & 1 Bobblehead: Intelligence.",
    "content": "### Intelligence - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Intelligence.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Intelligence`\n* **Obtainable From**: Scrapping Intelligence Items, Legendary Crafting\n\nScrap items with the **Intelligence** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 194,
    "source": "Vault Codex [3 Star]",
    "title": "Lightweight (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/94",
    "category": "3 Star Mods",
    "snippet": "Lightweight (3 Star): -90% weight.. Craft with 60 Modules & 10 Cork.",
    "content": "### Lightweight - 3 Star Legendary Mod\n\n* **Effect Bonus**: -90% weight.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 Cork`\n* **Obtainable From**: Scrapping Lightweight Items, Legendary Crafting\n\nScrap items with the **Lightweight** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 195,
    "source": "Vault Codex [3 Star]",
    "title": "Luck (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/95",
    "category": "3 Star Mods",
    "snippet": "Luck (3 Star): +3 Luck.. Craft with 60 Modules & 1 Bobblehead: Luck.",
    "content": "### Luck - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Luck.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Luck`\n* **Obtainable From**: Scrapping Luck Items, Legendary Crafting\n\nScrap items with the **Luck** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 196,
    "source": "Vault Codex [3 Star]",
    "title": "Lucky (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/96",
    "category": "3 Star Mods",
    "snippet": "Lucky (3 Star): +15 bonus V.A.T.S. critical charge.. Craft with 60 Modules & 1 Bobblehead: Luck.",
    "content": "### Lucky - 3 Star Legendary Mod\n\n* **Effect Bonus**: +15 bonus V.A.T.S. critical charge.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Luck`\n* **Obtainable From**: Scrapping Lucky Items, Legendary Crafting\n\nScrap items with the **Lucky** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 197,
    "source": "Vault Codex [3 Star]",
    "title": "Nimble (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/97",
    "category": "3 Star Mods",
    "snippet": "Nimble (3 Star): +100% faster movement speed while aiming.. Craft with 60 Modules & 25 Springs.",
    "content": "### Nimble - 3 Star Legendary Mod\n\n* **Effect Bonus**: +100% faster movement speed while aiming.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `25 Springs`\n* **Obtainable From**: Scrapping Nimble Items, Legendary Crafting\n\nScrap items with the **Nimble** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 198,
    "source": "Vault Codex [3 Star]",
    "title": "Pack Rat's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/98",
    "category": "3 Star Mods",
    "snippet": "Pack Rat's (3 Star): Junk item weights reduced by 20%.. Craft with 60 Modules & 1 Marsupial Serum.",
    "content": "### Pack Rat's - 3 Star Legendary Mod\n\n* **Effect Bonus**: Junk item weights reduced by 20%.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Marsupial Serum`\n* **Obtainable From**: Scrapping Pack Rat's Items, Legendary Crafting\n\nScrap items with the **Pack Rat's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 199,
    "source": "Vault Codex [3 Star]",
    "title": "Perception (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/99",
    "category": "3 Star Mods",
    "snippet": "Perception (3 Star): +3 Perception.. Craft with 60 Modules & 1 Bobblehead: Perception.",
    "content": "### Perception - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Perception.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Perception`\n* **Obtainable From**: Scrapping Perception Items, Legendary Crafting\n\nScrap items with the **Perception** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 200,
    "source": "Vault Codex [3 Star]",
    "title": "Reflex (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/100",
    "category": "3 Star Mods",
    "snippet": "Reflex (3 Star): 2% evade.. Craft with 60 Modules & 1 Bobblehead: Agility.",
    "content": "### Reflex - 3 Star Legendary Mod\n\n* **Effect Bonus**: 2% evade.\n* **Applicable Categories**: Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Agility`\n* **Obtainable From**: Burning Springs, Bounties, Bounty Hunting: Head Hunt & Grunt Hunt\n\nScrap items with the **Reflex** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 201,
    "source": "Vault Codex [3 Star]",
    "title": "Resilient (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/101",
    "category": "3 Star Mods",
    "snippet": "Resilient (3 Star): +500 damage resistance while reloading.. Craft with 60 Modules & 5 Med-X.",
    "content": "### Resilient - 3 Star Legendary Mod\n\n* **Effect Bonus**: +500 damage resistance while reloading.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `5 Med-X`\n* **Obtainable From**: Scrapping Resilient Items, Legendary Crafting\n\nScrap items with the **Resilient** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 202,
    "source": "Vault Codex [3 Star]",
    "title": "Safecracker's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/102",
    "category": "3 Star Mods",
    "snippet": "Safecracker's (3 Star): +1 lockpicking skill +1 hacking skill.. Craft with 60 Modules & 1 Bobblehead: Lock Picking.",
    "content": "### Safecracker's - 3 Star Legendary Mod\n\n* **Effect Bonus**: +1 lockpicking skill +1 hacking skill.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Lock Picking`\n* **Obtainable From**: Scrapping Safecracker's Items, Legendary Crafting\n\nScrap items with the **Safecracker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 203,
    "source": "Vault Codex [3 Star]",
    "title": "Secret Agent's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/103",
    "category": "3 Star Mods",
    "snippet": "Secret Agent's (3 Star): +25% less noise while sneaking +25% reduce detection chance.. Craft with 60 Modules & 1 Bobblehead: Sneak.",
    "content": "### Secret Agent's - 3 Star Legendary Mod\n\n* **Effect Bonus**: +25% less noise while sneaking +25% reduce detection chance.\n* **Applicable Categories**: Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Sneak`\n* **Obtainable From**: Scrapping Secret Agent's Items, Legendary Crafting\n\nScrap items with the **Secret Agent's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 204,
    "source": "Vault Codex [3 Star]",
    "title": "Sentinel's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/104",
    "category": "3 Star Mods",
    "snippet": "Sentinel's (3 Star): -5% damage taken while not moving.. Craft with 60 Modules & 1 Scaly Skin Serum.",
    "content": "### Sentinel's - 3 Star Legendary Mod\n\n* **Effect Bonus**: -5% damage taken while not moving.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Scaly Skin Serum`\n* **Obtainable From**: Scrapping Sentinel's Items, Legendary Crafting\n\nScrap items with the **Sentinel's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 205,
    "source": "Vault Codex [3 Star]",
    "title": "Steadfast (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/105",
    "category": "3 Star Mods",
    "snippet": "Steadfast (3 Star): +50 damage resistance while aiming.. Craft with 60 Modules & 5 Ballistic Fiber.",
    "content": "### Steadfast - 3 Star Legendary Mod\n\n* **Effect Bonus**: +50 damage resistance while aiming.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `5 Ballistic Fiber`\n* **Obtainable From**: Scrapping Steadfast Items, Legendary Crafting\n\nScrap items with the **Steadfast** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 206,
    "source": "Vault Codex [3 Star]",
    "title": "Strength (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/106",
    "category": "3 Star Mods",
    "snippet": "Strength (3 Star): +3 Strength.. Craft with 60 Modules & 1 Bobblehead: Strength.",
    "content": "### Strength - 3 Star Legendary Mod\n\n* **Effect Bonus**: +3 Strength.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Strength`\n* **Obtainable From**: Scrapping Strength Items, Legendary Crafting\n\nScrap items with the **Strength** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 207,
    "source": "Vault Codex [3 Star]",
    "title": "Swift (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/107",
    "category": "3 Star Mods",
    "snippet": "Swift (3 Star): +15% reload speed.. Craft with 60 Modules & 1 Speed Demon Serum.",
    "content": "### Swift - 3 Star Legendary Mod\n\n* **Effect Bonus**: +15% reload speed.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `1 Speed Demon Serum`\n* **Obtainable From**: Scrapping Swift Items, Legendary Crafting\n\nScrap items with the **Swift** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 208,
    "source": "Vault Codex [3 Star]",
    "title": "Thru-hiker's (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/108",
    "category": "3 Star Mods",
    "snippet": "Thru-hiker's (3 Star): Food, drink, and chem weights reduced by 20%.. Craft with 60 Modules & 10 Purified Water.",
    "content": "### Thru-hiker's - 3 Star Legendary Mod\n\n* **Effect Bonus**: Food, drink, and chem weights reduced by 20%.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 Purified Water`\n* **Obtainable From**: Scrapping Thru-hiker's Items, Legendary Crafting\n\nScrap items with the **Thru-hiker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 209,
    "source": "Vault Codex [3 Star]",
    "title": "Toxic (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/109",
    "category": "3 Star Mods",
    "snippet": "Toxic (3 Star): 5% chance to deal 12 Poison damage per second for 7s to melee attackers.. Craft with 60 Modules & 15 Floater Gnasher Pus Sac.",
    "content": "### Toxic - 3 Star Legendary Mod\n\n* **Effect Bonus**: 5% chance to deal 12 Poison damage per second for 7s to melee attackers.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `15 Floater Gnasher Pus Sac`\n* **Obtainable From**: Scrapping Toxic Items, Legendary Crafting\n\nScrap items with the **Toxic** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 210,
    "source": "Vault Codex [3 Star]",
    "title": "V.A.T.S. Optimized (3 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/110",
    "category": "3 Star Mods",
    "snippet": "V.A.T.S. Optimized (3 Star): -35% action point cost.. Craft with 60 Modules & 10 Sugar.",
    "content": "### V.A.T.S. Optimized - 3 Star Legendary Mod\n\n* **Effect Bonus**: -35% action point cost.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `60 Legendary Modules`\n* **Required Crafting Component**: `10 Sugar`\n* **Obtainable From**: Scrapping V.A.T.S. Optimized Items, Legendary Crafting\n\nScrap items with the **V.A.T.S. Optimized** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 211,
    "source": "Vault Codex [4 Star]",
    "title": "Aegis (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/111",
    "category": "4 Star Mods",
    "snippet": "Aegis (4 Star): Fortifies Physical and Energy Resists (+50) and Poison, Cryo, and Fire Resists (+20) for you and nearby teammates.. Craft with 120 Modules & 5 Circuitry.",
    "content": "### Aegis - 4 Star Legendary Mod\n\n* **Effect Bonus**: Fortifies Physical and Energy Resists (+50) and Poison, Cryo, and Fire Resists (+20) for you and nearby teammates.\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Circuitry`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 3), Bigfoot\n\nScrap items with the **Aegis** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 212,
    "source": "Vault Codex [4 Star]",
    "title": "Battle-Loader's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/112",
    "category": "4 Star Mods",
    "snippet": "Battle-Loader's (4 Star): Gives you a 15% chance to instantly reload when bashing enemies (stacks up to 75%).. Craft with 120 Modules & 1 Talons Serum.",
    "content": "### Battle-Loader's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Gives you a 15% chance to instantly reload when bashing enemies (stacks up to 75%).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Talons Serum`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 2), Bigfoot\n\nScrap items with the **Battle-Loader's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 213,
    "source": "Vault Codex [4 Star]",
    "title": "Bruiser's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/113",
    "category": "4 Star Mods",
    "snippet": "Bruiser's (4 Star): Melee weapons deal +5% bonus damage (up to +25% on full stack).. Craft with 120 Modules & 1 Bufftats.",
    "content": "### Bruiser's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Melee weapons deal +5% bonus damage (up to +25% on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Bufftats`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 4 only)\n\nScrap items with the **Bruiser's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 214,
    "source": "Vault Codex [4 Star]",
    "title": "Bully's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/114",
    "category": "4 Star Mods",
    "snippet": "Bully's (4 Star): +25% damage per crippled limb the target has.. Craft with 120 Modules & 1 Buffout.",
    "content": "### Bully's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +25% damage per crippled limb the target has.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Buffout`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 1 only)\n\nScrap items with the **Bully's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 215,
    "source": "Vault Codex [4 Star]",
    "title": "Charged (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/115",
    "category": "4 Star Mods",
    "snippet": "Charged (4 Star): Light attacks build up charge released with heavy attack (max charges 3).. Craft with 120 Modules & 3x Fusion Core.",
    "content": "### Charged - 4 Star Legendary Mod\n\n* **Effect Bonus**: Light attacks build up charge released with heavy attack (max charges 3).\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `3x Fusion Core`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Charged** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 216,
    "source": "Vault Codex [4 Star]",
    "title": "Choo-Choo's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/116",
    "category": "4 Star Mods",
    "snippet": "Choo-Choo's (4 Star): 10% chance for 500 damage & Bloody Mess when sprinting into targets (up to 50% on full stack).. Craft with 120 Modules & 15 Cannonballs.",
    "content": "### Choo-Choo's - 4 Star Legendary Mod\n\n* **Effect Bonus**: 10% chance for 500 damage & Bloody Mess when sprinting into targets (up to 50% on full stack).\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `15 Cannonballs`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Choo-Choo's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 217,
    "source": "Vault Codex [4 Star]",
    "title": "Combo-Breaker's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/117",
    "category": "4 Star Mods",
    "snippet": "Combo-Breaker's (4 Star): When dealing damage, 50% chance to not use AP (10% chance for auto melee).. Craft with 120 Modules & 1 Day Tripper.",
    "content": "### Combo-Breaker's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When dealing damage, 50% chance to not use AP (10% chance for auto melee).\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Day Tripper`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Combo-Breaker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 218,
    "source": "Vault Codex [4 Star]",
    "title": "Conductor's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/118",
    "category": "4 Star Mods",
    "snippet": "Conductor's (4 Star): Critical hits restore 10 Health & AP instantly and 100 more over 5s for you & teammates within 100ft.. Craft with 120 Modules & 5 Pure Crimson Flux.",
    "content": "### Conductor's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Critical hits restore 10 Health & AP instantly and 100 more over 5s for you & teammates within 100ft.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Pure Crimson Flux`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Conductor's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 219,
    "source": "Vault Codex [4 Star]",
    "title": "Electrician's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/119",
    "category": "4 Star Mods",
    "snippet": "Electrician's (4 Star): When reloading, emit a shock wave that stuns nearby targets for 3s.. Craft with 120 Modules & 1 Bobblehead: Energy Weapons.",
    "content": "### Electrician's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When reloading, emit a shock wave that stuns nearby targets for 3s.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Energy Weapons`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 2 only)\n\nScrap items with the **Electrician's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 220,
    "source": "Vault Codex [4 Star]",
    "title": "Encircler's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/120",
    "category": "4 Star Mods",
    "snippet": "Encircler's (4 Star): +10% damage for each combat target around you (up to +50%).. Craft with 120 Modules & 1 Overdrive.",
    "content": "### Encircler's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +10% damage for each combat target around you (up to +50%).\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Overdrive`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 4 only)\n\nScrap items with the **Encircler's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 221,
    "source": "Vault Codex [4 Star]",
    "title": "Fencer's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/121",
    "category": "4 Star Mods",
    "snippet": "Fencer's (4 Star): +12.5% melee damage; +12.5% per nearby teammate (up to +50% on full team).. Craft with 120 Modules & 1 Bobblehead: Melee.",
    "content": "### Fencer's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +12.5% melee damage; +12.5% per nearby teammate (up to +50% on full team).\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Melee`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 2 only)\n\nScrap items with the **Fencer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 222,
    "source": "Vault Codex [4 Star]",
    "title": "Fracturer's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/122",
    "category": "4 Star Mods",
    "snippet": "Fracturer's (4 Star): When crippling limbs, they explode and deal up to 50 explosion damage to nearby targets.. Craft with 120 Modules & 25 Gunpowder.",
    "content": "### Fracturer's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When crippling limbs, they explode and deal up to 50 explosion damage to nearby targets.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `25 Gunpowder`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 1 only)\n\nScrap items with the **Fracturer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 223,
    "source": "Vault Codex [4 Star]",
    "title": "Hauler's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/123",
    "category": "4 Star Mods",
    "snippet": "Hauler's (4 Star): Increases Carrying Capacity by 30.. Craft with 120 Modules & 5 Cloth.",
    "content": "### Hauler's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Increases Carrying Capacity by 30.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Cloth`\n* **Obtainable From**: Infestations\n\nScrap items with the **Hauler's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 224,
    "source": "Vault Codex [4 Star]",
    "title": "Icemen's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/124",
    "category": "4 Star Mods",
    "snippet": "Icemen's (4 Star): Applies cryo on hit that slows targets when dealing damage in V.A.T.S.. Craft with 120 Modules & 5 Pure Fluorescent Flux.",
    "content": "### Icemen's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Applies cryo on hit that slows targets when dealing damage in V.A.T.S.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Pure Fluorescent Flux`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 4), Bigfoot\n\nScrap items with the **Icemen's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 225,
    "source": "Vault Codex [4 Star]",
    "title": "Limit-Breaking (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/125",
    "category": "4 Star Mods",
    "snippet": "Limit-Breaking (4 Star): Each worn armor piece reduces critical hit cost by -10% (up to -50% on full stack).. Craft with 120 Modules & 5 Pure Violet Flux.",
    "content": "### Limit-Breaking - 4 Star Legendary Mod\n\n* **Effect Bonus**: Each worn armor piece reduces critical hit cost by -10% (up to -50% on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Pure Violet Flux`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 5 only)\n\nScrap items with the **Limit-Breaking** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 226,
    "source": "Vault Codex [4 Star]",
    "title": "Miasma's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/126",
    "category": "4 Star Mods",
    "snippet": "Miasma's (4 Star): When hit, a poisonous DoT cloud harms nearby targets for 10s (damage increases per equipped piece).. Craft with 120 Modules & 1 Plague Walker Serum.",
    "content": "### Miasma's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When hit, a poisonous DoT cloud harms nearby targets for 10s (damage increases per equipped piece).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Plague Walker Serum`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 4 only)\n\nScrap items with the **Miasma's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 227,
    "source": "Vault Codex [4 Star]",
    "title": "Pin-Pointer's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/127",
    "category": "4 Star Mods",
    "snippet": "Pin-Pointer's (4 Star): +20% weak spot damage.. Craft with 120 Modules & 1 Formula P.",
    "content": "### Pin-Pointer's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +20% weak spot damage.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Formula P`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 1 only)\n\nScrap items with the **Pin-Pointer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 228,
    "source": "Vault Codex [4 Star]",
    "title": "Polished (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/128",
    "category": "4 Star Mods",
    "snippet": "Polished (4 Star): Weapon damage increases the higher the item condition is (up to +60% damage).. Craft with 120 Modules & 1 Improved Repair Kit.",
    "content": "### Polished - 4 Star Legendary Mod\n\n* **Effect Bonus**: Weapon damage increases the higher the item condition is (up to +60% damage).\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Improved Repair Kit`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 4), Bigfoot\n\nScrap items with the **Polished** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 229,
    "source": "Vault Codex [4 Star]",
    "title": "Pounder's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/129",
    "category": "4 Star Mods",
    "snippet": "Pounder's (4 Star): +10% damage per Onslaught stack, +10 max stacks.. Craft with 120 Modules & 1 Fury.",
    "content": "### Pounder's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +10% damage per Onslaught stack, +10 max stacks.\n* **Applicable Categories**: Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Fury`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Pounder's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 230,
    "source": "Vault Codex [4 Star]",
    "title": "Propelling (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/130",
    "category": "4 Star Mods",
    "snippet": "Propelling (4 Star): Increases movement and sprint speed (+5% up to +25% on full stack).. Craft with 120 Modules & 15 Vault Steel Scrap.",
    "content": "### Propelling - 4 Star Legendary Mod\n\n* **Effect Bonus**: Increases movement and sprint speed (+5% up to +25% on full stack).\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `15 Vault Steel Scrap`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 5), Bigfoot\n\nScrap items with the **Propelling** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 231,
    "source": "Vault Codex [4 Star]",
    "title": "Pyromaniac's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/131",
    "category": "4 Star Mods",
    "snippet": "Pyromaniac's (4 Star): When a combat target is burning, deal +50% bonus damage.. Craft with 120 Modules & 15 Asbestos.",
    "content": "### Pyromaniac's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When a combat target is burning, deal +50% bonus damage.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `15 Asbestos`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 5 only)\n\nScrap items with the **Pyromaniac's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 232,
    "source": "Vault Codex [4 Star]",
    "title": "Radioactive-Powered (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/132",
    "category": "4 Star Mods",
    "snippet": "Radioactive-Powered (4 Star): Grants +2 AP regeneration at the cost of taking RADs.. Craft with 120 Modules & 5 Pure Cobalt Flux.",
    "content": "### Radioactive-Powered - 4 Star Legendary Mod\n\n* **Effect Bonus**: Grants +2 AP regeneration at the cost of taking RADs.\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Pure Cobalt Flux`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 1), Bigfoot\n\nScrap items with the **Radioactive-Powered** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 233,
    "source": "Vault Codex [4 Star]",
    "title": "Raging (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/133",
    "category": "4 Star Mods",
    "snippet": "Raging (4 Star): Upon being hit, deal +3% Damage for 10 seconds.. Craft with 120 Modules & 1 Buffout.",
    "content": "### Raging - 4 Star Legendary Mod\n\n* **Effect Bonus**: Upon being hit, deal +3% Damage for 10 seconds.\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Buffout`\n* **Obtainable From**: Infestations\n\nScrap items with the **Raging** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 234,
    "source": "Vault Codex [4 Star]",
    "title": "Ranger's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/134",
    "category": "4 Star Mods",
    "snippet": "Ranger's (4 Star): Ranged weapons deal +5% bonus damage (up to +25% on full stack).. Craft with 120 Modules & 1 Psychobuff.",
    "content": "### Ranger's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Ranged weapons deal +5% bonus damage (up to +25% on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Psychobuff`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 4 only)\n\nScrap items with the **Ranger's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 235,
    "source": "Vault Codex [4 Star]",
    "title": "Satiated (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/135",
    "category": "4 Star Mods",
    "snippet": "Satiated (4 Star): [Human] Kills Restore Hunger and Thirst. [Ghoul] Kills Restore Feral. Craft with 120 Modules & 5 Salt.",
    "content": "### Satiated - 4 Star Legendary Mod\n\n* **Effect Bonus**: [Human] Kills Restore Hunger and Thirst. [Ghoul] Kills Restore Feral\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Salt`\n* **Obtainable From**: Infestations\n\nScrap items with the **Satiated** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 236,
    "source": "Vault Codex [4 Star]",
    "title": "Reflective (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/136",
    "category": "4 Star Mods",
    "snippet": "Reflective (4 Star): Return 10% of damage received back toward enemy target (up to 50% on full stack).. Craft with 120 Modules & 1 Bobblehead: Science.",
    "content": "### Reflective - 4 Star Legendary Mod\n\n* **Effect Bonus**: Return 10% of damage received back toward enemy target (up to 50% on full stack).\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Science`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 3 only)\n\nScrap items with the **Reflective** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 237,
    "source": "Vault Codex [4 Star]",
    "title": "Rejuvenator's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/137",
    "category": "4 Star Mods",
    "snippet": "Rejuvenator's (4 Star): Gradually restores wearer's & teammates Health & AP within 50ft.. Craft with 120 Modules & 5 Stimpak Diffuser.",
    "content": "### Rejuvenator's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Gradually restores wearer's & teammates Health & AP within 50ft.\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Stimpak Diffuser`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 2 only)\n\nScrap items with the **Rejuvenator's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 238,
    "source": "Vault Codex [4 Star]",
    "title": "Runner's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/138",
    "category": "4 Star Mods",
    "snippet": "Runner's (4 Star): Sprinting AP cost reduced by -20% (up to -100% on full stack).. Craft with 120 Modules & 10 Purified Water.",
    "content": "### Runner's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Sprinting AP cost reduced by -20% (up to -100% on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `10 Purified Water`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 1 only)\n\nScrap items with the **Runner's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 239,
    "source": "Vault Codex [4 Star]",
    "title": "Sawbones's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/139",
    "category": "4 Star Mods",
    "snippet": "Sawbones's (4 Star): Health regenerates slowly (+1 Health/s; up to +5 Health/s on full stack).. Craft with 120 Modules & 1 Healing Factor Serum.",
    "content": "### Sawbones's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Health regenerates slowly (+1 Health/s; up to +5 Health/s on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Healing Factor Serum`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 5 only)\n\nScrap items with the **Sawbones's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 240,
    "source": "Vault Codex [4 Star]",
    "title": "Scanner's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/140",
    "category": "4 Star Mods",
    "snippet": "Scanner's (4 Star): V.A.T.S. attack AP cost reduced by -5% (up to -25% on full stack).. Craft with 120 Modules & 1 X-Cell.",
    "content": "### Scanner's - 4 Star Legendary Mod\n\n* **Effect Bonus**: V.A.T.S. attack AP cost reduced by -5% (up to -25% on full stack).\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 X-Cell`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 1 only)\n\nScrap items with the **Scanner's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 241,
    "source": "Vault Codex [4 Star]",
    "title": "Stabilizer's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/141",
    "category": "4 Star Mods",
    "snippet": "Stabilizer's (4 Star): Improves Weapon Recoil & Stability by 50%.. Craft with 120 Modules & 25 Rubber.",
    "content": "### Stabilizer's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Improves Weapon Recoil & Stability by 50%.\n* **Applicable Categories**: Weapon: Ranged\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `25 Rubber`\n* **Obtainable From**: RAID: Gleaming Depths (only Stage 2), Bigfoot\n\nScrap items with the **Stabilizer's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 242,
    "source": "Vault Codex [4 Star]",
    "title": "Stalwart's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/142",
    "category": "4 Star Mods",
    "snippet": "Stalwart's (4 Star): Power Armor breaks 5% slower for owner & teammates within 50ft (up to 25% on full stack).. Craft with 120 Modules & 1 Bobblehead: Leader.",
    "content": "### Stalwart's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Power Armor breaks 5% slower for owner & teammates within 50ft (up to 25% on full stack).\n* **Applicable Categories**: Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Bobblehead: Leader`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 5 only)\n\nScrap items with the **Stalwart's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 243,
    "source": "Vault Codex [4 Star]",
    "title": "Tanky's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/143",
    "category": "4 Star Mods",
    "snippet": "Tanky's (4 Star): +200 DR for 10s when standing still (20s cooldown; up to +1000 on full stack).. Craft with 120 Modules & 5 Ballistic Fiber.",
    "content": "### Tanky's - 4 Star Legendary Mod\n\n* **Effect Bonus**: +200 DR for 10s when standing still (20s cooldown; up to +1000 on full stack).\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Ballistic Fiber`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 2 only)\n\nScrap items with the **Tanky's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 244,
    "source": "Vault Codex [4 Star]",
    "title": "Tarnished (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/144",
    "category": "4 Star Mods",
    "snippet": "Tarnished (4 Star): Damage Increases (up to +120%) as Weapon Durability Decreases.. Craft with 120 Modules & 5 Fiberglass.",
    "content": "### Tarnished - 4 Star Legendary Mod\n\n* **Effect Bonus**: Damage Increases (up to +120%) as Weapon Durability Decreases.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `5 Fiberglass`\n* **Obtainable From**: Infestations\n\nScrap items with the **Tarnished** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 245,
    "source": "Vault Codex [4 Star]",
    "title": "Thrill-Seeker's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/145",
    "category": "4 Star Mods",
    "snippet": "Thrill-Seeker's (4 Star): Reload Speed & Melee Attack Speed increases based on Killstreak Count (2% per Kill).. Craft with 120 Modules & 1x Adrenal Reaction Serum.",
    "content": "### Thrill-Seeker's - 4 Star Legendary Mod\n\n* **Effect Bonus**: Reload Speed & Melee Attack Speed increases based on Killstreak Count (2% per Kill).\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1x Adrenal Reaction Serum`\n* **Obtainable From**: Bigfoot\n\nScrap items with the **Thrill-Seeker's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 246,
    "source": "Vault Codex [4 Star]",
    "title": "Vector (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/146",
    "category": "4 Star Mods",
    "snippet": "Vector (4 Star): Gain 10% Bonus V.A.T.S. Accuracy Against Distant Targets. Craft with 120 Modules & 1 Magnifying Glass.",
    "content": "### Vector - 4 Star Legendary Mod\n\n* **Effect Bonus**: Gain 10% Bonus V.A.T.S. Accuracy Against Distant Targets\n* **Applicable Categories**: Armor \u2022 Power Armor\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `1 Magnifying Glass`\n* **Obtainable From**: Infestations\n\nScrap items with the **Vector** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  },
  {
    "id": 247,
    "source": "Vault Codex [4 Star]",
    "title": "Viper's (4 Star Mod) - Crafting & Sources",
    "url": "https://fallout76.wiki/wiki/mod/147",
    "category": "4 Star Mods",
    "snippet": "Viper's (4 Star): When a combat target is poisoned, deal +50% bonus damage.. Craft with 120 Modules & 15 Acid.",
    "content": "### Viper's - 4 Star Legendary Mod\n\n* **Effect Bonus**: When a combat target is poisoned, deal +50% bonus damage.\n* **Applicable Categories**: Weapon: Ranged \u2022 Weapon: Melee\n* **Module Cost**: `120 Legendary Modules`\n* **Required Crafting Component**: `15 Acid`\n* **Obtainable From**: RAID: Gleaming Depths (Stage 5 only)\n\nScrap items with the **Viper's** effect at any Workbench for a 1.0% chance to learn the permanent crafting recipe or a 1.5% chance to obtain a loose Mod Box.",
    "main_image": null
  }
];
