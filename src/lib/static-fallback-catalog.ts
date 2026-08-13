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
    "content": "### Legendary Crafting Overview\n\nIn Fallout 76, players can scrap legendary weapons and armor at any Armor or Weapon Workbench.\n\n* **Recipe Unlock Chance**: 1.0% per scrapped item.\n* **Mod Box Drop Chance**: 1.5% per scrapped item.\n* **Module Crafting Costs**: 1-Star (15 Modules), 2-Star (30 Modules), 3-Star (60 Modules), 4-Star (120 Modules).\n\nTrade mod boxes with other players or apply them directly to your favorite gear at the Workbench.",
    "main_image": null
  },
  {
    "id": 2,
    "source": "Vault Codex",
    "title": "Minerva Schedule & Gold Bullion Inventory",
    "url": "https://fallout76.wiki/wiki/minerva",
    "category": "Vendors & Minerva",
    "snippet": "Minerva is a traveling Gold Bullion merchant who sells rare plans at a 25% discount compared to Foundation and Crater vendors.",
    "content": "### Minerva Schedule & Rotations\n\nMinerva rotates weekly between Foundation, Crater, and Fort Atlas. Her Big Sale occurs once a month featuring items from the previous 3 weeks combined.",
    "main_image": null
  },
  {
    "id": 3,
    "source": "Vault Codex",
    "title": "S.P.E.C.I.A.L. & Punch Card Machine Mechanics",
    "url": "https://fallout76.wiki/wiki/perks",
    "category": "Perks & Mutations",
    "snippet": "Punch Card Machines allow players level 25+ to respec SPECIAL stats and save up to 6 distinct loadouts for free.",
    "content": "### Punch Card Machines\n\nLocated at Train Stations and C.A.M.P.s. Equip Legendary SPECIAL perks to boost your effective attribute cap beyond 15 up to 30 points.",
    "main_image": null
  },
  {
    "id": 4,
    "source": "Vault Codex",
    "title": "Playable Ghoul Overhaul & 20 SPECIAL Cap",
    "url": "https://fallout76.wiki/wiki/ghoul-mode",
    "category": "Builds & Mechanics",
    "snippet": "Playable Ghouls expand S.P.E.C.I.A.L. perk capacity up to 20 points per attribute, replacing bloodied mechanics with feral rage meters.",
    "content": "### Playable Ghoul Mechanics\n\n* **Feral Gauge**: Fills as toxic radiation is absorbed.\n* **Perk Capacity**: 20 perk points per SPECIAL stat.\n* **Feral Perk Cards**: Exclusive ghoul combat cards like Feral Rage, Radiation Power, and Chemist.",
    "main_image": null
  },
  {
    "id": 5,
    "source": "Vault Codex",
    "title": "Armor Resistances & Damage Reduction Math",
    "url": "https://fallout76.wiki/wiki/armor-math",
    "category": "Armor & Power Armor",
    "snippet": "Understanding DR, ER, RR, and flat percentage Damage Reduction (Overeaters, Sentinels, Power Armor chassis).",
    "content": "### Damage Reduction Formula\n\nFlat percentage Damage Reduction (Power Armor -42%, Overeaters -30%, Sentinels -75%) is applied BEFORE numerical DR armor math.",
    "main_image": null
  }
];
