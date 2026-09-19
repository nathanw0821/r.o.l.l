import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  let characterId = searchParams.get("characterId");

  if (!characterId) {
    const char = await prisma.character.findFirst({
      where: { userId: auth.session.user.id }
    });
    if (!char) {
      return ok({ loadouts: [] });
    }
    characterId = char.id;
  } else {
    const char = await prisma.character.findFirst({
      where: { id: characterId, userId: auth.session.user.id }
    });
    if (!char) {
      const fallback = await prisma.character.findFirst({
        where: { userId: auth.session.user.id }
      });
      if (!fallback) return ok({ loadouts: [] });
      characterId = fallback.id;
    }
  }

  const loadouts = await prisma.characterPerkLoadout.findMany({
    where: { characterId },
    orderBy: { slotIndex: "asc" }
  });

  return ok({ loadouts, characterId });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const body = (await request.json()) as {
      characterId?: string;
      slotIndex?: number;
      name?: string;
      specials?: Prisma.InputJsonObject;
      equippedCards?: Prisma.InputJsonArray;
    };
    const { characterId, slotIndex, name, specials, equippedCards } = body;

    if (typeof slotIndex !== "number" || !Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 5) {
      return badRequest("Invalid loadout parameters (slotIndex 0-5 required)");
    }
    // Stored as JSON: keep it to the shapes the perk builder writes and a sane size.
    if (name !== undefined && (typeof name !== "string" || name.length > 60)) {
      return badRequest("Loadout name must be at most 60 characters.");
    }
    if (
      specials !== undefined &&
      (typeof specials !== "object" || specials === null || Array.isArray(specials) || Object.keys(specials).length > 7 ||
        Object.values(specials).some((v) => typeof v !== "number" || v < 0 || v > 99))
    ) {
      return badRequest("Invalid SPECIAL values.");
    }
    if (equippedCards !== undefined && (!Array.isArray(equippedCards) || equippedCards.length > 100)) {
      return badRequest("Too many equipped cards.");
    }
    if (JSON.stringify({ specials, equippedCards }).length > 20_000) {
      return badRequest("Loadout is too large.");
    }

    let targetCharacter: { id: string } | null = null;
    if (characterId) {
      targetCharacter = await prisma.character.findFirst({
        where: { id: characterId, userId: auth.session.user.id }
      });
    }

    if (!targetCharacter) {
      targetCharacter = await prisma.character.findFirst({
        where: { userId: auth.session.user.id }
      });

      if (!targetCharacter) {
        targetCharacter = await prisma.character.create({
          data: {
            userId: auth.session.user.id,
            name: "Vault Dweller 1"
          }
        });
      }
    }

    const targetCharacterId = targetCharacter.id;

    const loadout = await prisma.characterPerkLoadout.upsert({
      where: {
        characterId_slotIndex: { characterId: targetCharacterId, slotIndex }
      },
      update: {
        name: name || `Punch Card Loadout ${slotIndex + 1}`,
        specials: specials || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 },
        equippedCards: equippedCards || []
      },
      create: {
        characterId: targetCharacterId,
        slotIndex,
        name: name || `Punch Card Loadout ${slotIndex + 1}`,
        specials: specials || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 },
        equippedCards: equippedCards || []
      }
    });

    return ok({ loadout, characterId: targetCharacterId });
  } catch (error) {
    console.error("[PERK Loadouts Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save perk loadout" }, { status: 500 });
  }
}
