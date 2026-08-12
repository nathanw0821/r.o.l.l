import { NextResponse } from "next/server";
import { createShortlink } from "@/lib/shortlinks";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetUrl, payload, title, vanitySlug, userId } = body;

    if (!targetUrl && !payload) {
      return NextResponse.json(
        { success: false, error: "Must provide either targetUrl or build payload" },
        { status: 400 }
      );
    }

    const result = await createShortlink({
      targetUrl,
      payload,
      title,
      vanitySlug,
      userId
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Shortlink creation error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create shortlink" },
      { status: 500 }
    );
  }
}
