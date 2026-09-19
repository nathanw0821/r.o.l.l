import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedPublishedSharedBuild } from "@/lib/builder/get-shared-build";
import { sameSiteRedirectPath } from "@/lib/links/safe-redirect";
import { normalizeBuilderPayload } from "@/lib/builder/normalize-builder-payload";
import { getAppSession } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { LazyBuildPageClient } from "@/components/builder/dynamic-builder-wrapper";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);
  if (!row) {
    return { title: "Loadout | R.O.L.L" };
  }
  const title = row.seoTitle?.trim() || `${row.title} | R.O.L.L loadout`;
  const description =
    row.description?.trim() ||
    `Shared Fallout 76 loadout: ${row.title}. Built with R.O.L.L. — Gear, Perk Deck, Biometrics, and Combat DPS.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary", title, description }
  };
}

export default async function SharedLoadoutPage({ params }: PageProps) {
  const { slug } = await params;
  const row = await getCachedPublishedSharedBuild(slug);

  // Shortlinks redirect, but only to pages on this site (never an open redirect).
  if (row?.payload && typeof row.payload === "object" && "redirectUrl" in row.payload) {
    const target = sameSiteRedirectPath((row.payload as { redirectUrl?: unknown }).redirectUrl);
    if (target) {
      const { redirect } = await import("next/navigation");
      redirect(target);
    }
  }

  const payload = normalizeBuilderPayload(row?.payload);
  if (!row || !payload) {
    notFound();
  }

  let session = null;
  try {
    session = await getAppSession();
  } catch {
    // Session fallback
  }

  const currentUserId = session?.user?.id;
  const isAdmin = isAdminUser(session?.user);
  const isOwner = Boolean((currentUserId && row.userId === currentUserId) || isAdmin);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <LazyBuildPageClient
        readOnly={true}
        initialPayload={payload}
        sharedTransmissionTitle={row.title}
        sharedTransmissionSlug={row.slug}
        sharedTransmissionId={row.id}
        isOwner={isOwner}
        isAdmin={isAdmin}
      />
    </div>
  );
}
