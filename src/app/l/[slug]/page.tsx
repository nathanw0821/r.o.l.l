import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARMOR_SET_SLOT_LABELS, getArmorSetRow } from "@/lib/builder/armor-sets";
import {
  armorCraftingEffectLayers,
  findArmorMaterialMod,
  findArmorMiscMod
} from "@/lib/builder/armor-piece-mods";
import { getBaseGearPiece } from "@/lib/builder/base-gear";
import {
  aggregateEffectMath,
  BUILDER_SPECIAL_KEYS,
  BUILDER_SPECIAL_LABELS,
  buildShoppingList,
  collectEquippedLegendaryModIds,
  formatEffectMathDeltas,
  isFullArmorSetPayload,
  listEquippedModsInBenchOrder,
  listExtraEffectMathEntries
} from "@/lib/builder/compatibility";
import { getCachedPublishedSharedBuild } from "@/lib/builder/get-shared-build";
import { normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES
} from "@/lib/builder/underarmor";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ slug: string }> };

const modDetailSelect = {
  id: true,
  slug: true,
  name: true,
  starRank: true,
  category: true,
  subCategory: true,
  description: true,
  effectMath: true,
  craftingCost: true,
  allowedOnPowerArmor: true,
  allowedOnArmor: true,
  allowedOnWeapon: true,
  infestationOnly: true,
  fifthStarEligible: true,
  ghoulSpecialCap: true
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);
  if (!row) {
    return { title: "Loadout | R.O.L.L" };
  }
  const title = row.seoTitle?.trim() || `${row.title} | R.O.L.L loadout`;
  const description =
    row.description?.trim() ||
    `Shared Fallout 76 loadout: ${row.title}. Built with R.O.L.L. — modules, underarmor, and legendary slots.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description }
  };
}

function baseArmorFromPayload(payload: BuilderPayload) {
  const piece = getBaseGearPiece(payload.basePieceId);
  if (piece?.kind === "armor" && piece.armorSetKey) {
    return getArmorSetRow(piece.armorSetKey)?.stats ?? null;
  }
  return null;
}

export default async function SharedLoadoutPage({ params }: PageProps) {
  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);
  const payload = normalizeBuilderPayload(row?.payload);
  if (!row || !payload) {
    notFound();
  }

  const piece = getBaseGearPiece(payload.basePieceId);
  const ids = collectEquippedLegendaryModIds(payload);
  const modRows = ids.length
    ? await prisma.legendaryMod.findMany({
        where: { id: { in: ids } },
        select: modDetailSelect
      })
    : [];

  const dtoList: BuilderModDTO[] = modRows.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    starRank: m.starRank,
    category: m.category,
    subCategory: m.subCategory,
    description: m.description,
    effectMath: (m.effectMath as Record<string, unknown>) ?? {},
    craftingCost: (m.craftingCost as Record<string, unknown>) ?? {},
    allowedOnPowerArmor: m.allowedOnPowerArmor,
    allowedOnArmor: m.allowedOnArmor,
    allowedOnWeapon: m.allowedOnWeapon,
    infestationOnly: m.infestationOnly,
    fifthStarEligible: m.fifthStarEligible,
    ghoulSpecialCap: m.ghoulSpecialCap,
    trackerUnlock: "unknown"
  }));

  const equippedOrdered = listEquippedModsInBenchOrder(payload, dtoList);

  const layers: Record<string, number>[] = [];
  const shell = findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId);
  const lining = findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId);
  const style = findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId);
  if (shell?.effectMath) layers.push(shell.effectMath);
  if (lining?.effectMath) layers.push(lining.effectMath);
  if (style?.effectMath) layers.push(style.effectMath);
  if (isFullArmorSetPayload(payload)) {
    for (const layer of armorCraftingEffectLayers(payload.armorPieceCrafting)) {
      layers.push(layer);
    }
  }

  const baseArmorStats = baseArmorFromPayload(payload);
  const totals = aggregateEffectMath(equippedOrdered, {
    ghoul: payload.ghoul,
    extraLayers: layers,
    baseArmorStats
  });
  const shopping = buildShoppingList(equippedOrdered);

  const SLOT_LABELS = ["1st star", "2nd star", "3rd star", "4th star"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{row.title}</h1>
        <p className="mt-1 text-sm text-foreground/65">
          {piece?.label ?? payload.basePieceId} · {payload.ghoul ? "Ghoul" : "Human"} · shared from R.O.L.L.
        </p>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <div className="text-sm font-semibold">Legendary slots</div>
        {isFullArmorSetPayload(payload) ? (
          <div className="mt-3 space-y-4 text-sm">
            {ARMOR_SET_SLOT_LABELS.map((slotLabel, pieceIndex) => {
              const craft = payload.armorPieceCrafting[pieceIndex];
              const mat = craft ? findArmorMaterialMod(craft.materialModId) : undefined;
              const misc = craft ? findArmorMiscMod(craft.miscModId) : undefined;
              return (
              <div key={slotLabel}>
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">{slotLabel}</div>
                {craft ? (
                  <p className="mt-1 text-xs text-foreground/60">
                    Material: {mat?.label ?? craft.materialModId} · Misc: {misc?.label ?? craft.miscModId}
                  </p>
                ) : null}
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  {SLOT_LABELS.map((starLabel, starIndex) => {
                    const id = payload.armorLegendaryModIds[pieceIndex]![starIndex];
                    const mod = id ? modRows.find((m) => m.id === id) : null;
                    const math = (mod?.effectMath as Record<string, unknown>) ?? {};
                    const delta = mod ? formatEffectMathDeltas(math) : "";
                    const extras = mod ? listExtraEffectMathEntries(math) : [];
                    return (
                      <li key={`${pieceIndex}-${starIndex}`} className="space-y-1">
                        <div>
                          <span className="text-foreground/60">{starLabel}: </span>
                          <span className="font-medium">{mod?.name ?? "—"}</span>
                          {delta ? <span className="ml-1 text-accent/90">{delta}</span> : null}
                          {!delta && mod ? (
                            <span className="ml-1 text-xs text-foreground/55">
                              (no modeled resists / SPECIAL in sandbox totals)
                            </span>
                          ) : null}
                        </div>
                        {mod?.description ? (
                          <p className="pl-4 text-xs text-foreground/65">
                            <span className="font-semibold text-foreground/50">Also: </span>
                            {mod.description}
                          </p>
                        ) : null}
                        {extras.length > 0 ? (
                          <ul className="list-disc pl-8 text-xs text-foreground/65">
                            {extras.map((e) => (
                              <li key={e.key}>
                                <span className="font-mono text-[10px] text-foreground/45">{e.key}</span>:{" "}
                                {e.value}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
            })}
          </div>
        ) : (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {payload.legendaryModIds.map((id, i) => {
              const mod = id ? modRows.find((m) => m.id === id) : null;
              const math = (mod?.effectMath as Record<string, unknown>) ?? {};
              const delta = mod ? formatEffectMathDeltas(math) : "";
              const extras = mod ? listExtraEffectMathEntries(math) : [];
              return (
                <li key={i} className="space-y-1">
                  <div>
                    <span className="font-medium">{mod?.name ?? "—"}</span>
                    {delta ? <span className="ml-1 text-accent/90">{delta}</span> : null}
                    {!delta && mod ? (
                      <span className="ml-1 text-xs text-foreground/55">
                        (no modeled resists / SPECIAL in sandbox totals)
                      </span>
                    ) : null}
                  </div>
                  {mod?.description ? (
                    <p className="pl-4 text-xs text-foreground/65">
                      <span className="font-semibold text-foreground/50">Also: </span>
                      {mod.description}
                    </p>
                  ) : null}
                  {extras.length > 0 ? (
                    <ul className="list-disc pl-8 text-xs text-foreground/65">
                      {extras.map((e) => (
                        <li key={e.key}>
                          <span className="font-mono text-[10px] text-foreground/45">{e.key}</span>: {e.value}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">Totals</div>
          {baseArmorStats ? (
            <p className="mt-1 text-xs text-foreground/60">
              Includes full-set base resistances (Backwoods table) plus legendary and underarmor effect math.
            </p>
          ) : null}
          <p className="mt-1 text-xs text-foreground/50">
            These numbers are base math only — they do not include any perk card bonuses.
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-sm">
            <dt className="text-foreground/60">DR</dt>
            <dd>{totals.dr}</dd>
            <dt className="text-foreground/60">ER</dt>
            <dd>{totals.er}</dd>
            <dt className="text-foreground/60">FR</dt>
            <dd>{totals.fr}</dd>
            <dt className="text-foreground/60">CR</dt>
            <dd>{totals.cr}</dd>
            <dt className="text-foreground/60">PR</dt>
            <dd>{totals.pr}</dd>
            <dt className="text-foreground/60">RR</dt>
            <dd>{totals.rr}</dd>
            <dt className="text-foreground/60">HP</dt>
            <dd>{totals.hp}</dd>
            <dt className="text-foreground/60">Damage %</dt>
            <dd>{Math.round(totals.damagePct * 100)}%</dd>
            {BUILDER_SPECIAL_KEYS.flatMap((k) => [
              <dt key={`${k}-l`} className="text-foreground/60">
                {BUILDER_SPECIAL_LABELS[k]}
              </dt>,
              <dd key={`${k}-r`}>{totals[k]}</dd>
            ])}
            <dt className="text-foreground/60">SPECIAL (other)</dt>
            <dd>{totals.specialBonus}</dd>
            <dt className="text-foreground/60">AP regen</dt>
            <dd>{Math.round(totals.apRegen * 100)}%</dd>
            <dt className="text-foreground/60">Carry wt</dt>
            <dd>{totals.carryWeight}</dd>
          </dl>
        </div>
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-sm font-semibold">Shopping list</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {shopping.lines.length === 0 ? <li>No modules recorded.</li> : null}
            {shopping.lines.map((line) => (
              <li key={line.label}>
                {line.count}× {line.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-foreground/60">
        <Link href="/build" className="text-accent underline" prefetch={false}>
          Open the builder
        </Link>{" "}
        to fork this idea.
      </p>
    </div>
  );
}
