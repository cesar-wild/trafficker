import { NextRequest, NextResponse } from 'next/server';
import {
  FirstWeekMetrics,
  CreativePerformanceBaseline,
  summarizeFirstWeekPerformance,
  generateMonitoringReport,
} from '@/lib/creative-refresh/monitor';

interface MonitoringPayload {
  campaignId: string;
  metrics: FirstWeekMetrics[];
  baselines: Array<{
    creativeId: string;
    name: string;
    ctrTarget: number;
    conversionRateTarget: number;
    maxFrequency: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const payload: MonitoringPayload = await req.json();

    // Validate required fields
    if (!payload.campaignId || !Array.isArray(payload.metrics) || !Array.isArray(payload.baselines)) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, metrics, baselines' },
        { status: 400 }
      );
    }

    if (payload.metrics.length === 0) {
      return NextResponse.json(
        { error: 'No metrics provided' },
        { status: 400 }
      );
    }

    console.log(
      `[${new Date().toISOString()}] First-week monitoring for campaign ${payload.campaignId}`
    );
    console.log(`  Evaluating ${payload.metrics.length} creatives`);

    // Build baselines map
    const baselines = new Map<string, CreativePerformanceBaseline>();
    for (const baseline of payload.baselines) {
      baselines.set(baseline.creativeId, baseline);
    }

    // Generate summary
    const summary = summarizeFirstWeekPerformance(payload.metrics, baselines);
    const report = generateMonitoringReport(summary);

    console.log(report);

    return NextResponse.json(
      {
        success: true,
        campaignId: payload.campaignId,
        summary,
        report,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Monitoring failed',
      },
      { status: 500 }
    );
  }
}
