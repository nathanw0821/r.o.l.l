import type { Prisma, PrismaClient } from "@prisma/client";
import {
  EXTENDED_LEGENDARY_MOD_SEEDS,
  type BuilderLegendarySeedRow
} from "@/lib/builder/legendary-mod-catalog-seeds";

type SeedMod = {
  slug: string;
  name: string;
  starRank: number;
  category: string;
  subCategory: string | null;
  description: string;
  effectMath: Record<string, number>;
  craftingCost: Record<string, unknown>;
  allowedOnPowerArmor: boolean;
  allowedOnArmor: boolean;
  allowedOnWeapon: boolean;
  fifthStarEligible: boolean;
  ghoulSpecialCap: number | null;
};

function seedRowToMod(r: BuilderLegendarySeedRow): SeedMod {
  const modules = r.starRank >= 3 ? 2 : 1;
  return {
    slug: r.slug,
    name: r.name,
    starRank: r.starRank,
    category: r.category,
    subCategory: r.subCategory,
    description: r.description,
    effectMath: r.effectMath,
    craftingCost: {
      legendaryModules: modules,
      items: [{ name: "Legendary module", count: modules }]
    },
    allowedOnPowerArmor: r.allowedOnPowerArmor,
    allowedOnArmor: r.allowedOnArmor,
    allowedOnWeapon: r.allowedOnWeapon,
    fifthStarEligible: r.fifthStarEligible,
    ghoulSpecialCap: r.ghoulSpecialCap
  };
}

function mergeBySlug(extended: SeedMod[], core: SeedMod[]): SeedMod[] {
  const map = new Map<string, SeedMod>();
  for (const x of extended) {
    map.set(x.slug, x);
  }
  for (const x of core) {
    map.set(x.slug, x);
  }
  return [...map.values()];
}

/** Curated rows with richer `effectMath` — win over extended list on slug collision. */
const CORE_SEED_MODS: SeedMod[] = [
  {
    slug: "unyielding",
    name: "Unyielding",
    starRank: 1,
    category: "Armor",
    subCategory: null,
    description: "+3 to all SPECIAL when low health (armor only; not on power armor).",
    effectMath: { specialBonus: 3 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: 2
  },
  {
    slug: "bolstering",
    name: "Bolstering",
    starRank: 1,
    category: "Armor",
    subCategory: null,
    description: "Energy and damage resist increase at low health.",
    effectMath: { dr: 10, er: 10 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "overeaters",
    name: "Overeater's",
    starRank: 1,
    category: "Armor",
    subCategory: null,
    description: "Damage reduction while well fed / hydrated.",
    effectMath: { dr: 6, er: 6 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "bloodied",
    name: "Bloodied",
    starRank: 1,
    category: "Weapon",
    subCategory: null,
    description: "More damage at lower health.",
    effectMath: { damagePct: 0.25 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "anti-armor",
    name: "Anti-Armor",
    starRank: 1,
    category: "Weapon",
    subCategory: null,
    description: "Ignores armor.",
    effectMath: { damagePct: 0.12 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "powered",
    name: "Powered",
    starRank: 2,
    category: "Armor",
    subCategory: null,
    description: "AP regen.",
    effectMath: { apRegen: 0.05 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "hardy",
    name: "Hardy",
    starRank: 2,
    category: "Armor",
    subCategory: null,
    description: "Explosion damage reduction (sandbox: flat ER bump).",
    effectMath: { er: 15 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "swing-speed",
    name: "40% faster swing speed",
    starRank: 2,
    category: "Weapon",
    subCategory: "Melee",
    description: "Melee only.",
    effectMath: { damagePct: 0.04 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "rapid",
    name: "25% faster fire rate",
    starRank: 2,
    category: "Weapon",
    subCategory: "Ranged",
    description: "Ballistic / rapid-fire style ranged.",
    effectMath: { damagePct: 0.05 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "explosive",
    name: "Explosive",
    starRank: 2,
    category: "Weapon",
    subCategory: "Ranged",
    description: "Bullets explode (blocked on Gamma Gun in this demo).",
    effectMath: { damagePct: 0.2 },
    craftingCost: {
      legendaryModules: 1,
      items: [
        { name: "Legendary module", count: 1 },
        { name: "Adhesive", count: 6 }
      ]
    },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "sentinel",
    name: "Sentinel's",
    starRank: 3,
    category: "Armor",
    subCategory: null,
    description: "Damage reduction while standing.",
    effectMath: { dr: 15, er: 15 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "vats-enhanced",
    name: "VATS Enhanced",
    starRank: 3,
    category: "Weapon",
    subCategory: null,
    description: "Improved VATS performance.",
    effectMath: { damagePct: 0.05 },
    craftingCost: { legendaryModules: 1, items: [{ name: "Legendary module", count: 1 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "life-saving",
    name: "Life Saving",
    starRank: 4,
    category: "Armor",
    subCategory: null,
    description: "Chance to revive when downed (sandbox: small HP bump).",
    effectMath: { hp: 10 },
    craftingCost: { legendaryModules: 2, items: [{ name: "Legendary module", count: 2 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "weapon-4th-demo",
    name: "Swift (demo 4★)",
    starRank: 4,
    category: "Weapon",
    subCategory: "Ranged",
    description: "Fourth-star weapon slot demo entry.",
    effectMath: { damagePct: 0.06 },
    craftingCost: { legendaryModules: 2, items: [{ name: "Legendary module", count: 2 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: false,
    ghoulSpecialCap: null
  },
  {
    slug: "fifth-star-fortify",
    name: "Fortifying Echo",
    starRank: 5,
    category: "Armor",
    subCategory: null,
    description: "Fifth-star style defensive echo (demo).",
    effectMath: { dr: 12, er: 12, hp: 20 },
    craftingCost: { legendaryModules: 3, items: [{ name: "Legendary module", count: 3 }] },
    allowedOnPowerArmor: true,
    allowedOnArmor: true,
    allowedOnWeapon: false,
    fifthStarEligible: true,
    ghoulSpecialCap: null
  },
  {
    slug: "fifth-star-overcharge",
    name: "Overcharge Lattice",
    starRank: 5,
    category: "Weapon",
    subCategory: null,
    description: "Fifth-star style weapon echo (demo).",
    effectMath: { damagePct: 0.1 },
    craftingCost: { legendaryModules: 3, items: [{ name: "Legendary module", count: 3 }] },
    allowedOnPowerArmor: false,
    allowedOnArmor: false,
    allowedOnWeapon: true,
    fifthStarEligible: true,
    ghoulSpecialCap: null
  }
];

const SEED_MODS = mergeBySlug(
  EXTENDED_LEGENDARY_MOD_SEEDS.map(seedRowToMod),
  CORE_SEED_MODS
);

export async function seedBuilderCatalog(prisma: PrismaClient) {
  await prisma.legendaryMod.deleteMany({
    where: { slug: { in: ["infestation-corrosive", "infestation-armor-weeps"] } }
  });
  for (const mod of SEED_MODS) {
    await prisma.legendaryMod.upsert({
      where: { slug: mod.slug },
      create: {
        slug: mod.slug,
        name: mod.name,
        starRank: mod.starRank,
        category: mod.category,
        subCategory: mod.subCategory,
        description: mod.description,
        effectMath: mod.effectMath as Prisma.InputJsonValue,
        craftingCost: mod.craftingCost as Prisma.InputJsonValue,
        allowedOnPowerArmor: mod.allowedOnPowerArmor,
        allowedOnArmor: mod.allowedOnArmor,
        allowedOnWeapon: mod.allowedOnWeapon,
        infestationOnly: false,
        fifthStarEligible: mod.fifthStarEligible,
        ghoulSpecialCap: mod.ghoulSpecialCap
      },
      update: {
        name: mod.name,
        starRank: mod.starRank,
        category: mod.category,
        subCategory: mod.subCategory,
        description: mod.description,
        effectMath: mod.effectMath as Prisma.InputJsonValue,
        craftingCost: mod.craftingCost as Prisma.InputJsonValue,
        allowedOnPowerArmor: mod.allowedOnPowerArmor,
        allowedOnArmor: mod.allowedOnArmor,
        allowedOnWeapon: mod.allowedOnWeapon,
        infestationOnly: false,
        fifthStarEligible: mod.fifthStarEligible,
        ghoulSpecialCap: mod.ghoulSpecialCap
      }
    });
  }
}
