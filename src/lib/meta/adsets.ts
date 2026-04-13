import { AdSetConfig, AdSetResponse } from '../../types/meta';
import { initMetaApi, FacebookAdsApi } from './client';
import { buildAccountPath } from './credentials';

export async function createAdSet(config: AdSetConfig): Promise<AdSetResponse> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const params: Record<string, unknown> = {
    name: config.name,
    campaign_id: config.campaignId,
    daily_budget: Math.round(config.dailyBudget * 100),
    optimization_goal: config.optimizationGoal,
    billing_event: config.billingEvent,
    targeting: config.targeting,
  };

  if (config.status) {
    params.status = config.status;
  }
  if (config.startTime) {
    params.start_time = config.startTime;
  }
  if (config.endTime) {
    params.end_time = config.endTime;
  }

  const adset = await account.createAdSet([], params);

  return {
    id: adset.id,
    name: config.name,
    campaignId: config.campaignId,
    status: config.status || 'ACTIVE',
  };
}

export async function updateAdSetBudget(adSetId: string, dailyBudget: number): Promise<void> {
  const api = initMetaApi();
  const adset = new (FacebookAdsApi as any).AdSet(adSetId);
  await adset.api_update([{ daily_budget: Math.round(dailyBudget * 100) }]);
}

export async function updateAdSetStatus(
  adSetId: string,
  status: 'PAUSED' | 'ACTIVE' | 'DELETED'
): Promise<void> {
  const api = initMetaApi();
  const adset = new (FacebookAdsApi as any).AdSet(adSetId);
  await adset.api_update([{ status }]);
}

export async function getAdSet(adSetId: string): Promise<AdSetResponse> {
  const api = initMetaApi();
  const adset = new (FacebookAdsApi as any).AdSet(adSetId);
  const data = await adset.api_get(['id', 'name', 'campaign_id', 'status']);
  return {
    id: data.id,
    name: data.name,
    campaignId: data.campaign_id,
    status: data.status,
  };
}

export async function listAdSets(campaignId?: string): Promise<AdSetResponse[]> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const params: Record<string, unknown> = { limit: 100 };
  if (campaignId) {
    params.filtering = [{ field: 'adset.campaign_id', operator: 'EQUALS', value: campaignId }];
  }

  const adsets = await account.getAdSets(['id', 'name', 'campaign_id', 'status'], params);

  return adsets.map((a: any) => ({
    id: a.id,
    name: a.name,
    campaignId: a.campaign_id,
    status: a.status,
  }));
}
