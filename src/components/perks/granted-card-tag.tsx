/**
 * Tag under a perk card the active weapon grants (Western Spirit: Gunslinger Master). Drawn
 * below the card, never over its art: the card is equipped at no perk-point cost.
 */
export default function GrantedCardTag({ source }: { source: string }) {
  return (
    <span className="block w-full rounded border border-amber-500/50 bg-amber-950/70 px-1.5 py-0.5 text-center font-mono text-3xs font-bold text-amber-200">
      {source} · 0 pts
    </span>
  );
}
