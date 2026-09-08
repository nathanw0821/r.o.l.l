export interface OutdatedArticleInfo {
  isOutdated: boolean;
  reason: string;
  patchVersion: string;
  replacementTitle: string;
  replacementHref: string;
}

export function getArticleOutdatedStatus(article: { title: string; content?: string; category?: string }): OutdatedArticleInfo | null {
  const titleLower = article.title.toLowerCase();
  const contentLower = (article.content || "").toLowerCase();

  // 1. Nuclear Winter (Defunct game mode)
  if (
    titleLower.includes("nuclear winter") ||
    contentLower.includes("nuclear winter") ||
    contentLower.includes("babylon_") ||
    contentLower.includes("for the perk found in nuclear winter")
  ) {
    return {
      isOutdated: true,
      reason: "Nuclear Winter was decommissioned by Bethesda in September 2021. Perks and mechanics from this mode are defunct in current Fallout 76 Adventure mode.",
      patchVersion: "Patch 30 (Fallout Worlds)",
      replacementTitle: "Live Adventure Perk Matrix",
      replacementHref: "/perks",
    };
  }

  // 2. Vault 94 Raids (Defunct game mode)
  if (titleLower.includes("vault 94") && (contentLower.includes("raid") || titleLower.includes("raid"))) {
    return {
      isOutdated: true,
      reason: "Vault 94 Raids were retired with Wastelanders. Vault 94 armor and plans (Solar, Thorn, Strangler Heart) are now purchased with Gold Bullion from Regs in Vault 79.",
      patchVersion: "Patch 19 (Wastelanders)",
      replacementTitle: "Gold Bullion & Minerva Catalog",
      replacementHref: "/wiki?category=Vendors+%26+Minerva",
    };
  }

  // 3. Pre-Milepost Zero Legendary Crafting (Legacy random 3-star rerolls)
  if (
    (titleLower.includes("legendary crafting") || titleLower.includes("legendary rolling") || titleLower.includes("legendary modules")) &&
    contentLower.includes("purveyor") &&
    !contentLower.includes("box mod") &&
    !contentLower.includes("milepost zero")
  ) {
    return {
      isOutdated: true,
      reason: "Legacy random 3-star weapon and armor rerolling was replaced in Milepost Zero by targeted Legendary Box Mods and Item Scrapping.",
      patchVersion: "Patch 54 (Milepost Zero)",
      replacementTitle: "Legendary Box Mods & Scrapping Hub",
      replacementHref: "/crafting",
    };
  }

  // 4. Legacy Explosive Energy Weapons
  if (
    titleLower.includes("legacy weapons") ||
    (contentLower.includes("explosive gatling plasma") && contentLower.includes("legacy"))
  ) {
    return {
      isOutdated: true,
      reason: "Unobtainable and overpowered legacy explosive projectile mods on energy weapons were purged from the game in Patch 41.",
      patchVersion: "Patch 41 (January 2023)",
      replacementTitle: "Current Weapons & Legendary Mods",
      replacementHref: "/wiki?category=Weapons+%26+Mods",
    };
  }

  // 5. Old Heavy Gunner / Slugger Perks in build guides
  if (
    contentLower.includes("heavy gunner rank 3") &&
    contentLower.includes("expert heavy gunner") &&
    contentLower.includes("master heavy gunner") &&
    !contentLower.includes("bullet storm")
  ) {
    return {
      isOutdated: true,
      reason: "This build guide uses legacy pre-Patch 62 Heavy Gunner damage cards (+20% additive). Heavy guns now utilize Bullet Storm, Tightly Wound, and Bringing the Big Guns.",
      patchVersion: "Patch 62 (CAMP Revamp)",
      replacementTitle: "Current Heavy Gunner Perk Cards",
      replacementHref: "/perks?q=bullet-storm",
    };
  }

  return null;
}
