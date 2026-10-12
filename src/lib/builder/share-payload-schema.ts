import { z } from "zod";
import { sanitizePowerArmorPiecesEquipped } from "@/lib/builder/power-armor-stats";
import { sanitizeSandboxMutationIds } from "@/lib/builder/sandbox-mutations";

/** Serialized builds above this size are refused; mirrors the PATCH route's cap. */
export const SHARE_PAYLOAD_MAX_BYTES = 200_000;

const underarmorSchema = z.object({
  shellId: z.string().min(1),
  liningId: z.string().nullable(),
  styleId: z.string().nullable()
});

const armorCraftingRowSchema = z.object({
  materialModId: z.string().min(1),
  miscModId: z.string().min(1)
});

const weaponCraftingSchema = z.object({
  receiverId: z.string().optional(),
  barrelId: z.string().optional(),
  stockId: z.string().optional(),
  magazineId: z.string().optional(),
  sightId: z.string().optional(),
  muzzleId: z.string().optional()
});

const equippedPerkCardSchema = z.object({
  cardId: z.string().min(1),
  rank: z.number().int().min(0).max(6)
});

/**
 * The v5 build a client publishes. `z.object` drops keys it does not name, so every field the
 * builder round-trips (`normalizeBuilderPayload`) must be listed here or a published build loses
 * it silently: until 2026-10-11 the Biometrics switchboard (food buff stack, chems, stance), the
 * equipped perk cards, the active weapon, its crafting and Strange in Numbers were all stripped
 * at publish time while the holotape slots and the PATCH route kept them.
 */
export const sharePayloadSchema = z
  .object({
    version: z.literal(5),
    basePieceId: z.string().min(1),
    activeWeaponPieceId: z.string().min(1).optional(),
    equipmentKind: z.enum(["armor", "powerArmor", "weapon", "underarmor"]),
    weaponSub: z.enum(["melee", "ranged", "energy"]).nullable(),
    legendaryModIds: z.array(z.string().nullable()).length(4),
    armorLegendaryModIds: z.array(z.array(z.string().nullable()).length(4)).length(5),
    weaponCrafting: weaponCraftingSchema.optional(),
    armorPieceCrafting: z.array(armorCraftingRowSchema).length(5),
    armorPieceSetKeys: z.array(z.string().nullable()).max(6).optional(),
    /** Unique armor per body slot (`{ chest: "bulwark" }`); ids are checked by `normalizeBuilderPayload`. */
    uniqueArmorPieceIds: z
      .object({
        chest: z.string().min(1).max(64).optional(),
        leftArm: z.string().min(1).max(64).optional(),
        rightArm: z.string().min(1).max(64).optional(),
        leftLeg: z.string().min(1).max(64).optional(),
        rightLeg: z.string().min(1).max(64).optional()
      })
      .optional(),
    uniqueArmorConditions: z
      .object({
        rageStacks: z.number().min(0).max(1000).optional(),
        movementSpeedPct: z.number().min(0).max(1000).optional()
      })
      .optional(),
    ghoul: z.boolean(),
    underarmor: underarmorSchema,
    powerArmorHelmetId: z.string().nullable().optional(),
    powerArmorHelmetCrafting: armorCraftingRowSchema.optional(),
    powerArmorPiecesEquipped: z.array(z.boolean()).length(6).optional(),
    mutationIds: z.array(z.string()).max(40).optional(),
    ignoreMutationPenalties: z.boolean().optional(),
    baseSpecial: z.record(z.number()).optional(),
    legendaryPerkIds: z.array(z.string()).optional(),
    equippedPerkCards: z.array(equippedPerkCardSchema).max(80).optional(),
    /** Free-form on purpose: the switchboard shape changes with every engine feature. */
    switchboardState: z.record(z.unknown()).optional(),
    hasStrangeInNumbers: z.boolean().optional(),
    ndUrl: z.string().max(2048).optional()
  })
  .transform((p) => ({
    ...p,
    powerArmorHelmetId: p.powerArmorHelmetId ?? null,
    powerArmorHelmetCrafting: p.powerArmorHelmetCrafting ?? { materialModId: "none", miscModId: "none" },
    powerArmorPiecesEquipped: sanitizePowerArmorPiecesEquipped(p.powerArmorPiecesEquipped),
    mutationIds: sanitizeSandboxMutationIds(p.mutationIds ?? []),
    ignoreMutationPenalties: p.ignoreMutationPenalties ?? false,
    baseSpecial: p.baseSpecial ?? {},
    legendaryPerkIds: p.legendaryPerkIds ?? []
  }));

export type SharePayload = z.infer<typeof sharePayloadSchema>;
