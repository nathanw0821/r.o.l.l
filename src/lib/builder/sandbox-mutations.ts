/**
 * Curated Fallout 76 mutations for the builder sandbox: each row splits stat-like
 * `effectMath` into positives vs negatives so “Ignore mutation penalties” can
 * approximate serum (removes downsides only — not Class Freak / team scaling).
 */
export type SandboxMutationDef = {
  id: string;
  label: string;
  /** Rolled into Live totals when the mutation is selected. */
  benefit: Record<string, number>;
  /** Dropped from totals when “Ignore mutation penalties” is on. */
  penalty: Record<string, number>;
};

function mergeNumericLayers(
  target: Record<string, number>,
  layer: Record<string, number>
) {
  for (const [k, v] of Object.entries(layer)) {
    if (!Number.isFinite(v) || v === 0) continue;
    target[k] = (target[k] ?? 0) + v;
  }
}

export const SANDBOX_MUTATIONS: readonly SandboxMutationDef[] = [
  {
    id: "egg-head",
    label: "Egg Head",
    benefit: { int: 6 },
    penalty: { str: -3, end: -3 }
  },
  {
    id: "eagle-eyes",
    label: "Eagle Eyes",
    benefit: { per: 4, damagePct: 0.06 },
    penalty: { str: -4 }
  },
  {
    id: "bird-bones",
    label: "Bird Bones",
    benefit: { agi: 4 },
    penalty: { str: -4 }
  },
  {
    id: "marsupial",
    label: "Marsupial",
    benefit: { carryWeight: 20 },
    penalty: { int: -4 }
  },
  {
    id: "scaly-skin",
    label: "Scaly Skin",
    benefit: { dr: 50, er: 50 },
    penalty: { apRegen: -0.2 }
  },
  {
    id: "grounded",
    label: "Grounded",
    benefit: { er: 100 },
    penalty: { damagePct: -0.15 }
  },
  {
    id: "twisted-muscles",
    label: "Twisted Muscles",
    benefit: { damagePct: 0.15 },
    penalty: { per: -4 }
  },
  {
    id: "talons",
    label: "Talons",
    benefit: { damagePct: 0.05 },
    penalty: { agi: -4 }
  },
  {
    id: "healing-factor",
    label: "Healing Factor",
    benefit: { hp: 10 },
    penalty: { int: -2 }
  },
  {
    id: "speed-demon",
    label: "Speed Demon",
    benefit: { apRegen: 0.12 },
    penalty: { end: -1 }
  },
  {
    id: "empath",
    label: "Empath (self)",
    benefit: {},
    penalty: { dr: -8, er: -8 }
  },
  {
    id: "adrenal-reaction",
    label: "Adrenal Reaction",
    benefit: { damagePct: 0.08 },
    penalty: { hp: -15 }
  },
  {
    id: "herd-mentality",
    label: "Herd Mentality (solo)",
    benefit: {},
    penalty: { str: -2, per: -2, end: -2, cha: -2, int: -2, agi: -2, lck: -2 }
  },
  {
    id: "herd-mentality-team",
    label: "Herd Mentality (on team)",
    benefit: { str: 2, per: 2, end: 2, cha: 2, int: 2, agi: 2, lck: 2 },
    penalty: {}
  },
  {
    id: "carnivore",
    label: "Carnivore",
    benefit: { damagePct: 0.03, hp: 4 },
    penalty: {}
  },
  {
    id: "herbivore",
    label: "Herbivore",
    benefit: { rr: 8, hp: 4 },
    penalty: {}
  },
  {
    id: "electrically-charged",
    label: "Electrically Charged",
    benefit: {},
    penalty: { agi: -1, int: -1 }
  },
  {
    id: "unstable-isotope",
    label: "Unstable Isotope",
    benefit: {},
    penalty: { end: -1, rr: -3 }
  },
  {
    id: "plague-walker",
    label: "Plague Walker",
    benefit: { damagePct: 0.03 },
    penalty: { cha: -2 }
  },
  {
    id: "chameleon",
    label: "Chameleon",
    benefit: { agi: 2 },
    penalty: {}
  }
] as const;

const MUTATION_BY_ID = new Map(SANDBOX_MUTATIONS.map((m) => [m.id, m]));

/** Merge selected sandbox mutations into one `effectMath`-shaped layer. */
export function sandboxMutationMathLayer(
  mutationIds: readonly string[] | undefined,
  ignorePenalties: boolean | undefined
): Record<string, number> | null {
  const ids = mutationIds ?? [];
  const out: Record<string, number> = {};
  const dropPenalties = Boolean(ignorePenalties);
  for (const id of ids) {
    const def = MUTATION_BY_ID.get(id);
    if (!def) continue;
    mergeNumericLayers(out, def.benefit);
    if (!dropPenalties) mergeNumericLayers(out, def.penalty);
  }
  const hasNonZero = Object.values(out).some((n) => Number.isFinite(n) && n !== 0);
  return hasNonZero ? out : null;
}

export function sanitizeSandboxMutationIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x !== "string") continue;
    if (!MUTATION_BY_ID.has(x)) continue;
    if (!out.includes(x)) out.push(x);
  }
  return out;
}
