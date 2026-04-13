import { NextRequest, NextResponse } from 'next/server';
import { insights } from '@/lib/meta/launcher';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const adSetId = searchParams.get('adSetId');
    const datePreset = (searchParams.get('datePreset') || 'last_7_days') as
      | 'last_7_days'
      | 'last_30_days'
      | 'last_90_days'
      | 'today'
      | 'yesterday';

    if (adSetId) {
      const metrics = await insights.getAdSetInsights(adSetId, datePreset);
      return NextResponse.json({ success: true, data: metrics });
    }

    if (campaignId) {
      const metrics = await insights.getCampaignInsights(campaignId, datePreset);
      return NextResponse.json({ success: true, data: metrics });
    }

    const spend = await insights.getAccountSpendToday();
    return NextResponse.json({ success: true, data: { spendToday: spend } });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
