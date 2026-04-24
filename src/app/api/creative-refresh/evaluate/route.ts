import { NextRequest, NextResponse } from "next/server";
import { detectFatigue } from "@/lib/creative-refresh/fatigue";

export interface EvaluateRequest {
  creatives: Array<{
    id: string;
    metrics: {
      ctr: number;
      ctrPrevWeek: number;
      frequency: number;
      conversionRate: number;
      conversionRatePrevWeek: number;
      activeDays: number;
    };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: EvaluateRequest = await req.json();
    const results = body.creatives.map((c) => ({
      id: c.id,
      triggers: detectFatigue(c.metrics),
      fatigued: detectFatigue(c.metrics).length > 0,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}