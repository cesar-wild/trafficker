import { NextRequest, NextResponse } from 'next/server';
import { launchCampaign, pauseCampaign, resumeCampaign, scaleCampaignBudget } from '@/lib/meta/launcher';
import { CampaignConfig, AdSetConfig, AdCreativeConfig, AutomatedRuleConfig } from '@/types/meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'launch': {
        const campaign = body.campaign as CampaignConfig;
        const adSets = body.adSets as AdSetConfig[];
        const creatives = body.creatives as Array<{ adSetId: string; creative: AdCreativeConfig }>;
        const automatedRules = body.automatedRules as AutomatedRuleConfig[] | undefined;

        if (!campaign || !adSets?.length || !creatives?.length) {
          return NextResponse.json(
            { error: 'Missing required fields: campaign, adSets, creatives' },
            { status: 400 }
          );
        }

        const result = await launchCampaign({ campaign, adSets, creatives, automatedRules });
        return NextResponse.json({ success: true, data: result });
      }

      case 'pause': {
        const { campaignId } = body;
        if (!campaignId) {
          return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }
        await pauseCampaign(campaignId);
        return NextResponse.json({ success: true, message: 'Campaign paused' });
      }

      case 'resume': {
        const { campaignId } = body;
        if (!campaignId) {
          return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }
        await resumeCampaign(campaignId);
        return NextResponse.json({ success: true, message: 'Campaign resumed' });
      }

      case 'scale': {
        const { campaignId, newDailyBudget, increasePercent } = body;
        if (!campaignId || !newDailyBudget) {
          return NextResponse.json({ error: 'Missing campaignId or newDailyBudget' }, { status: 400 });
        }
        await scaleCampaignBudget(campaignId, newDailyBudget, increasePercent || 20);
        return NextResponse.json({ success: true, message: 'Budget scaled' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Meta API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
