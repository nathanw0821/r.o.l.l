import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const { searchParams } = new URL(request.url);
  const characterId = searchParams.get("characterId");

  if (!characterId) {
    return badRequest("characterId param is required");
  }

  // Ensure character belongs to user
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId: auth.session.user.id }
  });

  if (!character) {
    return badRequest("Character not found");
  }

  const loadouts = await prisma.characterPerkLoadout.findMany({
    where: { characterId },
    orderBy: { slotIndex: "asc" }
  });

  return ok({ loadouts });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const { characterId, slotIndex, name, specials, equippedCards } = body;

    if (!characterId || typeof slotIndex !== "number" || slotIndex < 0 || slotIndex > 5) {
      return badRequest("Invalid loadout parameters (slotIndex 0-5 required)");
    }

    // Ensure character belongs to user
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: auth.session.user.id }
    });

    if (!character) {
      return badRequest("Character not found");
    }

    const loadout = await prisma.characterPerkLoadout.upsert({
      where: {
        characterId_slotIndex: { characterId, slotIndex }
      },
      update: {
        name: name || `Punch Card Loadout ${slotIndex + 1}`,
        specials: specials || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 },
        equippedCards: equippedCards || []
      },
      create: {
        characterId,
        slotIndex,
        name: name || `Punch Card Loadout ${slotIndex + 1}`,
        specials: specials || { S: 1, P: 1, E: 1, C: 1, I: 1, A: 1, L: 1 },
        equippedCards: equippedCards || []
      }
    });

    return ok({ loadout });
  } catch (error) {
    console.error("[PERK Loadouts Error]", error);
    return NextResponse.json({ success: false, error: "Failed to save perk loadout" }, { status: 500 });
  }
}
