import { Suspense } from "react";
import EffectTable from "@/components/effect-table";
import PageHeader from "@/components/page-header";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";

type SearchParams = Promise<{
  focus?: string | string[];
}>;

function readFocusId(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

async function AllEffectsOverview() {
  const session = await getAppSession();
  const canEdit = Boolean(session?.user?.id);

  return (
    <>
      <PageHeader
        title="All Effects"
        description="Full registry across all tiers. Toggle unlocks if you are signed in."
      />
      <div className="space-y-2">
        <div className="text-xs text-foreground/60">
          Use the Command Hub to search and filter results.
        </div>
        {!canEdit ? (
          <div className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
            Changes are saved locally in this browser. Sign in to sync them to your account.
          </div>
        ) : null}
        <div className="effect-table-header hidden text-xs font-semibold uppercase text-foreground/60 md:grid table-grid">
          <div>Effect</div>
          <div>Categories</div>
          <div>Description</div>
          <div>Extra Component</div>
          <div>Modules</div>
          <div>Status</div>
          <div>Notes</div>
        </div>
      </div>
    </>
  );
}

async function AllEffectsRegistry({
  focusId
}: {
  focusId: string | null;
}) {
  const session = await getAppSession();
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <EffectTable
      rows={rows}
      canEdit={Boolean(session?.user?.id)}
      focusId={focusId}
      showChrome={false}
    />
  );
}

function AllEffectsRegistryFallback() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="effect-table-list">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`row-${index}`}
            className="effect-table-row summary-status-card rounded-[var(--radius)] border"
          >
            <div className="space-y-3">
              <div className="h-5 w-40 rounded bg-foreground/10" />
              <div className="grid gap-2 md:grid-cols-3">
                <div className="h-4 rounded bg-foreground/10" />
                <div className="h-4 rounded bg-foreground/10" />
                <div className="h-4 rounded bg-foreground/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="effect-table-tiles">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={`tile-${index}`}
            className="effect-tile summary-status-card"
          >
            <div className="space-y-3">
              <div className="h-5 w-32 rounded bg-foreground/10" />
              <div className="h-4 w-20 rounded bg-foreground/10" />
              <div className="h-4 rounded bg-foreground/10" />
              <div className="h-4 rounded bg-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AllEffectsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const focusId = readFocusId(searchParams.focus);

  return (
    <div className="space-y-6">
      <AllEffectsOverview />
      <Suspense fallback={<AllEffectsRegistryFallback />}>
        <AllEffectsRegistry focusId={focusId} />
      </Suspense>
    </div>
  );
}
