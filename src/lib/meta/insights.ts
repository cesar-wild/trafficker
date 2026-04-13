import { PerformanceMetrics } from '../../types/meta';
import { initMetaApi, FacebookAdsApi } from './client';
import { buildAccountPath } from './credentials';

export async function getCampaignInsights(
  campaignId: string,
  datePreset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'today' | 'yesterday'
): Promise<PerformanceMetrics[]> {
  const api = initMetaApi();
  const campaign = new (FacebookAdsApi as any).Campaign(campaignId);

  const params: Record<string, unknown> = {
    fields: [
      'impressions',
      'reach',
      'clicks',
      'spend',
      'ctr',
      'cpc',
      'actions',
      'action_values',
      'frequency',
      'date_start',
      'date_stop',
    ],
    level: 'campaign',
    limit: 100,
  };

  if (datePreset) {
    params.date_preset = datePreset;
  }

  const insights = await campaign.getInsights([], params);

  return insights.map((ins: any) => {
    const conversions = parseConversionActions(ins.actions);
    const revenue = parseRevenueActions(ins.action_values);
    const roas = revenue > 0 && ins.spend > 0 ? revenue / ins.spend : undefined;

    return {
      campaignId,
      impressions: parseInt(ins.impressions) || 0,
      reach: parseInt(ins.reach) || 0,
      clicks: parseInt(ins.clicks) || 0,
      spend: parseFloat(ins.spend) || 0,
      ctr: parseFloat(ins.ctr) || 0,
      cpc: parseFloat(ins.cpc) || 0,
      conversions,
      cpa: conversions > 0 ? (parseFloat(ins.spend) || 0) / conversions : 0,
      roas,
      frequency: parseFloat(ins.frequency) || 0,
      dateStart: ins.date_start,
      dateStop: ins.date_stop,
    };
  });
}

function parseConversionActions(actions: Array<{ action_type: string; value: string }> | undefined): number {
  if (!actions) return 0;
  const conversion = actions.find(
    (a) => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase'
  );
  return conversion ? parseInt(conversion.value) : 0;
}

function parseRevenueActions(actionValues: Array<{ action_type: string; value: string }> | undefined): number {
  if (!actionValues) return 0;
  const revenue = actionValues.find(
    (a) => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'purchase'
  );
  return revenue ? parseFloat(revenue.value) : 0;
}

export async function getAdSetInsights(
  adSetId: string,
  datePreset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'today' | 'yesterday'
): Promise<PerformanceMetrics[]> {
  const api = initMetaApi();
  const adset = new (FacebookAdsApi as any).AdSet(adSetId);

  const params: Record<string, unknown> = {
    fields: [
      'impressions',
      'reach',
      'clicks',
      'spend',
      'ctr',
      'cpc',
      'actions',
      'action_values',
      'frequency',
      'date_start',
      'date_stop',
    ],
    level: 'adset',
    limit: 100,
  };

  if (datePreset) {
    params.date_preset = datePreset;
  }

  const insights = await adset.getInsights([], params);

  return insights.map((ins: any) => {
    const conversions = parseConversionActions(ins.actions);
    const revenue = parseRevenueActions(ins.action_values);
    const roas = revenue > 0 && ins.spend > 0 ? revenue / ins.spend : undefined;

    return {
      campaignId: adSetId,
      impressions: parseInt(ins.impressions) || 0,
      reach: parseInt(ins.reach) || 0,
      clicks: parseInt(ins.clicks) || 0,
      spend: parseFloat(ins.spend) || 0,
      ctr: parseFloat(ins.ctr) || 0,
      cpc: parseFloat(ins.cpc) || 0,
      conversions,
      cpa: conversions > 0 ? (parseFloat(ins.spend) || 0) / conversions : 0,
      roas,
      frequency: parseFloat(ins.frequency) || 0,
      dateStart: ins.date_start,
      dateStop: ins.date_stop,
    };
  });
}

export async function getAccountSpendToday(): Promise<number> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const insights = await account.getInsights(
    ['spend'],
    { date_preset: 'today', level: 'account' }
  );

  if (insights.length === 0) return 0;
  return parseFloat(insights[0].spend) || 0;
}
