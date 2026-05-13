import { NextRequest, NextResponse } from "next/server";
?import { trackVisitor } from "@/lib/metrics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId;
    
    // Perform tracking in the background
    await trackVisitor(userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Metric tracking failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
