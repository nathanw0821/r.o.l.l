import { notFound } from "next/navigation";
import { getPublicCraftingResume } from "@/lib/public-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTierStars } from "@/lib/tier-format";
import { ShieldCheck, User as UserIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type PageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Crafting Resume | R.O.L.L.`,
    description: `Verified legendary crafting knowledge for ${username} in Fallout 76. View learned recipes and crafting stats.`,
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const resume = await getPublicCraftingResume(username);

  if (!resume) {
    notFound();
  }

  const { user, stats, learnedMods } = resume;

  // Group by tier
  const groupedMods: Record<string, typeof learnedMods> = {
    "1 Star": [],
    "2 Star": [],
    "3 Star": [],
    "4 Star": []
  };

  learnedMods.forEach(mod => {
    const tier = mod.tier?.label || "1 Star";
    if (groupedMods[tier]) {
      groupedMods[tier].push(mod);
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header / Brand Protection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center border border-accent/40">
            <UserIcon className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.displayName}</h1>
            <div className="flex items-center gap-2 text-foreground/60 text-sm">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Verified Crafting Resume</span>
              <span className="text-foreground/30">•</span>
              <span>R.O.L.L. Certified</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-accent">{stats.percent}%</div>
          <div className="text-xs text-foreground/50 uppercase tracking-widest">Global Knowledge</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-panel/50">
          <CardContent className="pt-6">
            <div className="text-xs text-foreground/50 uppercase mb-1">Learned Recipes</div>
            <div className="text-2xl font-bold">{stats.unlocked} / {stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-panel/50">
          <CardContent className="pt-6">
            <div className="text-xs text-foreground/50 uppercase mb-1">Reputation</div>
            <div className="text-2xl font-bold">Market76 Verified</div>
          </CardContent>
        </Card>
        <Card className="bg-panel/50">
          <CardContent className="pt-6">
            <div className="text-xs text-foreground/50 uppercase mb-1">Status</div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active Crafter</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Legendary Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Unlocked Legendary Recipes</h2>
          <Link href="/" className="text-xs text-accent hover:underline flex items-center gap-1">
            Build your own <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {Object.entries(groupedMods).map(([tier, mods]) => (
          mods.length > 0 && (
            <div key={tier} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/40 flex items-center gap-2">
                <span>{formatTierStars(tier)}</span>
                <span>{tier}</span>
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {mods.map(mod => (
                  <div 
                    key={mod.id} 
                    className="p-3 rounded-lg border border-border bg-panel hover:border-accent/50 transition-colors"
                  >
                    <div className="font-medium text-sm">{mod.effect.name}</div>
                    <div className="text-[10px] text-foreground/40 mt-1 uppercase">
                      {mod.categories.map(c => c.category.name).join(" • ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {learnedMods.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-xl border-border">
            <p className="text-foreground/50">No learned recipes shared on this profile yet.</p>
          </div>
        )}
      </div>

      {/* Footer / Privacy Note */}
      <div className="pt-8 border-t border-border/50 text-center">
        <p className="text-xs text-foreground/40">
          Character names and specific resource counts are hidden for player privacy (IGN Protection).
          <br />
          Data verified by Record Of Legendary Loadouts.
        </p>
      </div>
    </div>
  );
}
