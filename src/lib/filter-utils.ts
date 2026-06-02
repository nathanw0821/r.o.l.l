export type SelectionSource = "default" | "imported" | "edited";

export type FilterState = {
  query: string;
  sources: SelectionSource[];
  status: ("locked" | "unlocked" | "seeking")[];
  origins: string[];
  categories?: string[];
};

export type FilterableRow = {
  effect: { name: string };
  tier?: { label?: string } | null;
  categories: { category: { name: string } }[];
  description?: string | null;
  extraComponent?: string | null;
  notes?: string | null;
  unlocked: boolean;
  isSeeking: boolean;
  modCount: number;
  selectionSource?: SelectionSource;
  origins?: string[];
};

const ACRONYM_MAP: Record<string, Record<string, string[]>> = {
  "weapon_prefixes": {
    "aa": ["anti-armor", "anti armor", "antiarmor"],
    "ari": ["aristocrat", "aristocrat's", "aristocrats"],
    "ass": ["assassin", "assassin's", "assassins"],
    "b": ["bloodied", "bloody"],
    "bl": ["bloodied"],
    "ber": ["berserker", "berserker's", "berserkers"],
    "exe": ["executioner", "executioner's", "executioners"],
    "ext": ["exterminator", "exterminator's", "exterminators"],
    "f": ["furious"],
    "gour": ["gourmand", "gourmand's", "gourmands"],
    "gs": ["ghoul slayer", "ghoul slayer's", "ghoulslayer"],
    "h": ["hunter", "hunter's", "hunters"],
    "i": ["instigating"],
    "j": ["junkie", "junkie's", "junkies"],
    "jug": ["juggernaut", "juggernaut's", "juggernauts"],
    "med": ["medic", "medic's", "medics"],
    "ms": ["mutant slayer", "mutant slayer's", "mutantslayer"],
    "mut": ["mutant", "mutant's", "mutants"],
    "n": ["nocturnal"],
    "q": ["quad"],
    "st": ["stalker", "stalker's", "stalkers"],
    "sup": ["suppressor", "suppressor's", "suppressors"],
    "tro": ["troubleshooter", "troubleshooter's", "troubleshooters"],
    "ts": ["two shot", "twoshot", "two-shot"],
    "v": ["vampire", "vampire's", "vampires", "vamp"]
  },
  "weapon_major": {
    "25ffr": ["25% faster fire rate", "rapid", "ffr"],
    "ffr": ["25% faster fire rate", "rapid"],
    "25": ["25% faster fire rate", "25% less v.a.t.s.", "aiming damage"],
    "50c": ["critical hit damage", "50% critical damage", "vital"],
    "50cd": ["critical hit damage", "vital"],
    "50v": ["50% v.a.t.s. hit chance", "hit chance", "lucky"],
    "50vhc": ["50% v.a.t.s. hit chance", "lucky"],
    "e": ["explosive"],
    "exp": ["explosive"],
    "50b": ["bash", "bashing", "basher"],
    "bash": ["bashing damage", "basher"],
    "25aim": ["+25% damage while aiming", "hitman", "aiming"],
    "dwa": ["damage while aiming", "hitman"],
    "ine": ["replenish ap on kill", "inertial"],
    "ap_refresh_kill": ["inertial", "replenish action points"],
    "ss": ["40% faster swing speed", "swing speed", "steady"],
    "40pa": ["40% more power attack damage", "power attack", "heavyweight"],
    "replenish": ["inertial"]
  },
  "weapon_minor": {
    "15r": ["15% faster reload", "swift"],
    "fr": ["15% faster reload", "swift"],
    "25v": ["25% less v.a.t.s. action point cost", "vats optimized", "lvc"],
    "lvc": ["25% less v.a.t.s. action point cost", "vats optimized"],
    "15c": ["15% faster v.a.t.s. critical fill", "vats enhanced", "crit fill"],
    "15cf": ["15% faster v.a.t.s. critical fill", "vats enhanced"],
    "90": ["90% reduced weight", "lightweight", "90rw", "rw"],
    "rw": ["90% reduced weight", "lightweight"],
    "50bs": ["breaks 50% slower", "durability"],
    "dur": ["breaks 50% slower", "durability"],
    "break": ["breaks 50% slower"],
    "15b": ["15% less damage while blocking", "blocking", "defenders"],
    "250": ["reloading damage resistance", "resilient"],
    "50dr": ["damage resistance while aiming", "steadfast"],
    "3str": ["+3 strength", "strength weapon"],
    "3per": ["+3 perception", "perception weapon"],
    "3end": ["+3 endurance", "endurance weapon"],
    "3cha": ["+3 charisma", "charisma weapon"],
    "3int": ["+3 intelligence", "intelligence weapon"],
    "3agi": ["+3 agility", "agility weapon"],
    "3luc": ["+3 luck", "luck weapon"]
  },
  "armor_prefixes": {
    "ari": ["aristocrat", "aristocrat's", "aristocrats"],
    "ass": ["assassin", "assassin's", "assassins"],
    "auto": ["auto stim", "autostim"],
    "bols": ["bolstering"],
    "bol": ["bolstering"],
    "cham": ["chameleon"],
    "ext": ["exterminator", "exterminator's", "exterminators"],
    "ghoul": ["ghoul slayer", "ghoul slayer's", "ghoulslayer"],
    "gs": ["ghoul slayer", "ghoul slayer's"],
    "gour": ["gourmand", "gourmand's", "gourmands"],
    "ls": ["life saving", "lifesaving"],
    "ms": ["mutant slayer", "mutant slayer's"],
    "mut": ["mutant", "mutant's", "mutants"],
    "noc": ["nocturnal"],
    "n": ["nocturnal"],
    "oe": ["overeater", "overeater's", "overeaters"],
    "regen": ["regenerating"],
    "tro": ["troubleshooter", "troubleshooter's"],
    "uny": ["unyielding"],
    "van": ["vanguard", "vanguard's", "vanguards"],
    "w": ["weightless"],
    "zeal": ["zealot", "zealot's", "zealots"],
    "lucid": ["lucid", "chem reduction"]
  },
  "armor_major": {
    "ap": ["increases action point refresh", "powered", "ap refresh"],
    "pow": ["increases action point refresh", "powered"],
    "led": ["less explosive damage", "hardy"],
    "cryo": ["cryo resistance", "antifreeze"],
    "fire": ["fire resistance", "warming"],
    "poison": ["poison resistance", "poisoner's", "poisoners"],
    "rad": ["radiation resistance", "hazmat"],
    "2int": ["+2 intelligence", "intelligence armor"],
    "2str": ["+2 strength", "strength armor"],
    "2agi": ["+2 agility", "agility armor"],
    "2per": ["+2 perception", "perception armor"],
    "2end": ["+2 endurance", "endurance armor"],
    "2cha": ["+2 charisma", "charisma armor"],
    "2luc": ["+2 luck", "luck armor"],
    "htd": ["harder to detect while sneaking", "sneak"]
  },
  "armor_minor": {
    "wwr": ["weapon weight reduced", "arms keeper", "arms keeper's"],
    "awr": ["ammo weight reduced", "belted"],
    "fdc": ["food, drink, and chem weight reduced", "thru-hiker", "thru-hiker's", "fdcr"],
    "jwr": ["junk weight reduced", "pack rat", "pack rat's"],
    "sent": ["sentinel", "sentinel's", "75% chance to reduce damage by 15% while standing still"],
    "cav": ["cavalier", "cavalier's", "75% chance to reduce damage by 15% while sprinting"],
    "htd": ["harder to detect while sneaking", "secret agent", "sneak"],
    "sneak": ["harder to detect while sneaking", "secret agent"],
    "safe": ["safecracker", "lockpicking"],
    "diss": ["dissipating", "recovers health outside of combat"],
    "doc": ["doctor's", "stimpaks, radaway, and rad-x are 5% more effective"],
    "elect": ["electrified"],
    "frozen": ["frozen"],
    "toxic": ["toxic"],
    "burn": ["burning"],
    "fall": ["acrobat", "fall damage reduced by 50%"],
    "50f": ["fall damage reduced by 50%", "acrobat"]
  }
};

export type QueryTokenExpansion = {
  value: string;
  isOriginalShorthand: boolean;
};

export function expandQueryTokens(query: string): QueryTokenExpansion[][] {
  const tokens = query.toLowerCase().split(/[\s/+,]+/).filter(Boolean);
  return tokens.map((token) => {
    const expansionsMap = new Map<string, boolean>();

    let isShorthand = false;
    for (const categoryKey in ACRONYM_MAP) {
      const category = ACRONYM_MAP[categoryKey];
      if (category && token in category) {
        isShorthand = true;
        break;
      }
    }

    expansionsMap.set(token, isShorthand);

    for (const categoryKey in ACRONYM_MAP) {
      const category = ACRONYM_MAP[categoryKey];
      if (category && token in category) {
        for (const val of category[token]) {
          const valLower = val.toLowerCase();
          if (!expansionsMap.has(valLower)) {
            expansionsMap.set(valLower, false);
          }
        }
      }
    }

    return Array.from(expansionsMap.entries()).map(([value, isOriginalShorthand]) => ({
      value,
      isOriginalShorthand
    }));
  });
}

function matchTokenValue(haystack: string, value: string, isOriginalShorthand: boolean): boolean {
  if (isOriginalShorthand && value.length <= 3) {
    const escaped = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`);
    return regex.test(haystack);
  }
  return haystack.includes(value);
}

export function applyFilters<T extends FilterableRow>(rows: T[], state: FilterState) {
  const query = state.query.trim().toLowerCase();
  const sourceSet = new Set(state.sources);
  const statusSet = new Set(state.status);
  const originSet = new Set(state.origins.map((origin) => origin.toLowerCase()));
  const categorySet = new Set((state.categories ?? []).map((category) => normalizeCategory(category)));

  if (
    query.length === 0 &&
    sourceSet.size === 0 &&
    statusSet.size === 0 &&
    originSet.size === 0 &&
    categorySet.size === 0
  ) {
    return rows;
  }

  return rows.filter((row) => {
    if (categorySet.size > 0) {
      const rowCategories = row.categories.map((c) => normalizeCategory(c.category.name));
      if (!rowCategories.some((category) => categorySet.has(category))) return false;
    }

    if (query) {
      const tokenExpansions = expandQueryTokens(query);
      if (tokenExpansions.length > 0) {
        const categories = row.categories.map((c) => c.category.name).join(" | ");
        const haystack = [
          row.effect.name,
          row.tier?.label ?? "",
          categories,
          row.description ?? "",
          row.extraComponent ?? "",
          row.notes ?? "",
          ...(row.origins ?? [])
        ]
          .join(" ")
          .toLowerCase();

        const matchesAllTokens = tokenExpansions.every((expansions) => {
          return expansions.some(({ value, isOriginalShorthand }) =>
            matchTokenValue(haystack, value, isOriginalShorthand)
          );
        });

        if (!matchesAllTokens) return false;
      }
    }

    if (sourceSet.size > 0) {
      const source = row.selectionSource ?? "default";
      if (!sourceSet.has(source)) return false;
    }

    if (statusSet.size > 0) {
      if (statusSet.has("unlocked") && row.unlocked) { /* ok */ }
      else if (statusSet.has("locked") && !row.unlocked) { /* ok */ }
      else if (statusSet.has("seeking") && row.isSeeking) { /* ok */ }
      else return false;
    }

    if (originSet.size > 0) {
      const rowOrigins = (row.origins ?? []).map((origin) => origin.toLowerCase());
      if (!rowOrigins.some((origin) => originSet.has(origin))) return false;
    }

    return true;
  });
}

export function normalizeCategory(value: string) {
  return value
    .toLowerCase()
    .replace(/[:/]/g, " ")
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function collectOriginOptions(rows: FilterableRow[]) {
  const set = new Set<string>();
  for (const row of rows) {
    for (const origin of row.origins ?? []) {
      if (origin) set.add(origin);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function toggleSelection<T extends string>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export const NEW_MODS = new Set(["hauler's", "raging", "satiated", "tarnished", "vector"]);

export function isNewMod(name: string): boolean {
  return NEW_MODS.has(name.trim().toLowerCase());
}

