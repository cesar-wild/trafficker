import { NextRequest, NextResponse } from "next/server";
import { decideRotation } from "@/lib/creative-refresh/rotation";
import { CreativeMetrics } from "@/lib/creative-refresh/fatigue";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, creatives } = body;
    if (!campaignId || !creatives) {
      return NextResponse.json({ error: "campaignId and creatives required" }, { status: 400 });
    }
    const metrics = new Map<string, CreativeMetrics>(
      creatives.map((c: any) => [c.id, c.metrics])
    );
    const decision = decideRotation(campaignId, metrics);
    console.log(`[${new Date().toISOString()}] Rotation decision for ${campaignId}:`, decision);
    return NextResponse.json({ decision });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}