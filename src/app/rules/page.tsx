import BrandStack from "@/components/brand-stack";
import Link from "next/link";

export const metadata = {
  title: "Rules | R.O.L.L.",
  description: "Community rules for R.O.L.L."
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 px-4 animate-in fade-in duration-200">
      <div className="rounded-xl border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[0.7rem] uppercase font-mono tracking-widest text-accent font-bold">COMMUNITY RULES</span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 font-mono">Community Guidelines</h1>
            <p className="text-xs text-foreground/50 mt-1 font-mono">Code of conduct for R.O.L.L.</p>
          </div>
          <BrandStack />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-6 space-y-5 font-mono text-xs leading-relaxed text-foreground/80">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">1. Be Respectful</h2>
          <p>Zero tolerance for harassment, hate speech, or toxicity. Keep discussions helpful and constructive.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">2. Trading Etiquette</h2>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>No Real-Money Trading (RMT):</strong> Trade only with in-game items, caps, or junk. No real money sales.</li>
            <li><strong>No Scamming:</strong> Verify item stats before trading. Scammers will be permanently banned.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">3. No Bot Abuse or Exploits</h2>
          <p>Do not spam API endpoints, flood Discord bot commands, or distribute malicious files.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-accent border-b border-border/60 pb-1 uppercase">4. Privacy</h2>
          <p>Read our <Link href="/privacy" className="text-accent underline">Privacy Policy</Link> and <Link href="/terms" className="text-accent underline">Terms of Service</Link> for details on account data safety.</p>
        </section>
      </div>

      <div className="flex justify-between items-center text-xs font-mono text-foreground/50 px-2">
        <Link href="/" className="hover:text-accent transition-colors">
          &gt; HOME
        </Link>
        <span>R.O.L.L. v1.0</span>
      </div>
    </div>
  );
}
