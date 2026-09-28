import { NextResponse } from "next/server";
import { buildIcs } from "@/lib/events/calendar";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

/** Subscribable iCalendar feed of the season calendar (`/calendar.ics`). */
export function GET() {
  const site = getSiteUrl()?.origin;
  const body = buildIcs(undefined, { siteUrl: site });
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="fallout76-season-calendar.ics"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
