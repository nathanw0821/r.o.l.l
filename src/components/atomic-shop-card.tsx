import { ExternalLink } from "lucide-react";

const LINKS = [
  {
    href: "https://uf.atomicshop.fyi/",
    label: "This week's Atomic Shop",
    note: "Prices, discounts and free items, in your currency. Fan-run tracker by uf.atomicshop.fyi.",
  },
  {
    href: "https://uf.atomicshop.fyi/?tab=vault-tec-performance-program",
    label: "Vault-Tec Performance Program",
    note: "The free reward track for logging in and playing.",
  },
  {
    href: "https://fallout.bethesda.net/en-US/news",
    label: "Official Fallout 76 news",
    note: "Bethesda's weekly shop and event announcements.",
  },
];

/** Link-only card: R.O.L.L. does not host or copy Atomic Shop data or images. */
export default function AtomicShopCard() {
  return (
    <section aria-labelledby="atomic-shop-heading" className="rounded-[var(--radius)] border border-border/40 bg-panel p-5 font-mono">
      <h2 id="atomic-shop-heading" className="text-base font-bold text-foreground">
        Atomic Shop
      </h2>
      <p className="mt-1 text-xs text-foreground/55">
        We link out instead of copying the shop. Prices and offers are theirs to show; verify in game.
      </p>
      <ul className="mt-3 space-y-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-sm"
            >
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span>
                <span className="font-bold text-accent group-hover:underline">{l.label}</span>
                <span className="block text-xs text-foreground/60">{l.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
