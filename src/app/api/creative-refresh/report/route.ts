import { NextRequest, NextResponse } from "next/server";
import { rankCreatives } from "@/lib/creative-refresh/scoring";
import { detectFatigue, CreativeMetrics } from "@/lib/creative-refresh/fatigue";

export async function GET() {
  return NextResponse.json({ report: "report endpoint — connect data source" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const metrics = new Map<string, CreativeMetrics>(
      body.creatives?.map((c: any) => [c.id, c.metrics]) ?? []
    );
    const ranked = rankCreatives(metrics);
    const health = [...metrics.entries()].map(([id, m]) => ({
      id,
      score: ranked.find((r) => r.id === id)?.score ?? 0,
      fatigued: detectFatigue(m).length > 0,
      triggers: detectFatigue(m),
    }));
    return NextResponse.json({ health });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}