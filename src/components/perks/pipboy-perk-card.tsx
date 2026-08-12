"use client";

import * as React from "react";
import { SpecialCategory } from "@/lib/perks/catalog";
import InGamePerkCard from "@/components/perks/in-game-perk-card";

export interface PipBoyPerkCardProps {
  name: string;
  special: SpecialCategory;
  cost: number;
  rank: number;
  maxRank: number;
  minLevel?: number;
  description: string;
  isEquipped?: boolean;
  isOverflow?: boolean;
  isFemale?: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  footerExtra?: React.ReactNode;
}

export default function PipBoyPerkCard(
  props: PipBoyPerkCardProps & { cardId?: string; onRankChange?: (newRank: number) => void }
) {
  return <InGamePerkCard {...props} />;
}
