import * as React from "react";
import Link from "next/link";
import {
  createLinkPlanState,
  planLinkSegments,
  type PlanLinkOptions
} from "@/lib/links/entity-links";

/** Accent underline used for entity links (same accent as the site's other inline links, no motion). */
export const ENTITY_LINK_CLASS =
  "text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent";

/**
 * Plain text with game terms linked on their first occurrence in the block
 * (see `src/lib/links/entity-links.ts`). No hooks, so it renders in server and client components;
 * pass `currentPath` so a page never links to itself.
 */
export function linkifyToNodes(
  text: string,
  options: PlanLinkOptions & { keyPrefix?: string } = {}
): React.ReactNode[] {
  const segments = planLinkSegments(text, options);
  const prefix = options.keyPrefix ?? "lk";
  return segments.map((segment, index) =>
    segment.href ? (
      <Link
        key={`${prefix}-${index}`}
        href={segment.href}
        className={ENTITY_LINK_CLASS}
        data-entity-kind={segment.entity?.kind}
      >
        {segment.text}
      </Link>
    ) : (
      <React.Fragment key={`${prefix}-${index}`}>{segment.text}</React.Fragment>
    )
  );
}

export { createLinkPlanState };

export default function LinkifiedText({
  text,
  maxLinks,
  currentPath,
  skipKeys
}: {
  text: string | null | undefined;
  maxLinks?: number;
  currentPath?: string | null;
  /** Entity keys left as text (e.g. a glossary entry's own term). */
  skipKeys?: ReadonlySet<string>;
}) {
  if (!text) return null;
  return <>{linkifyToNodes(text, { currentPath, maxLinks, skipKeys })}</>;
}
