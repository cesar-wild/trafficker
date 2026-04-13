import { CampaignConfig, CampaignResponse } from '../../types/meta';
import { initMetaApi, FacebookAdsApi } from './client';
import { buildAccountPath } from './credentials';

const Campaign = FacebookAdsApi.Campaign;

export async function createCampaign(config: CampaignConfig): Promise<CampaignResponse> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const params: Record<string, unknown> = {
    [FacebookAdsApi.Campaign.Fields.name]: config.name,
    [FacebookAdsApi.Campaign.Fields.objective]: config.objective,
    [FacebookAdsApi.Campaign.Fields.status]: config.status,
    [FacebookAdsApi.Campaign.Fields.daily_budget]: Math.round(config.dailyBudget * 100),
  };

  if (config.totalBudget) {
    params[FacebookAdsApi.Campaign.Fields.lifetime_budget] = Math.round(config.totalBudget * 100);
  }

  if (config.bidStrategy) {
    params[FacebookAdsApi.Campaign.Fields.bid_strategy] = config.bidStrategy;
  }

  const campaign = await account.createCampaign([], params);

  return {
    id: campaign.id,
    name: config.name,
    status: config.status,
    effectiveStatus: 'ACTIVE',
  };
}

export async function getCampaign(campaignId: string): Promise<CampaignResponse> {
  const api = initMetaApi();
  const campaign = new (FacebookAdsApi as any).Campaign(campaignId);

  const data = await campaign.api_get([
    FacebookAdsApi.Campaign.Fields.name,
    FacebookAdsApi.Campaign.Fields.status,
    FacebookAdsApi.Campaign.Fields.effective_status,
  ]);

  return {
    id: data.id,
    name: data.name,
    status: data.status,
    effectiveStatus: data.effective_status,
  };
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'PAUSED' | 'ACTIVE' | 'DELETED'
): Promise<void> {
  const api = initMetaApi();
  const campaign = new (FacebookAdsApi as any).Campaign(campaignId);
  await campaign.api_update([{ status }]);
}

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudget: number,
  totalBudget?: number
): Promise<void> {
  const api = initMetaApi();
  const campaign = new (FacebookAdsApi as any).Campaign(campaignId);
  const params: Record<string, unknown> = {
    [FacebookAdsApi.Campaign.Fields.daily_budget]: Math.round(dailyBudget * 100),
  };
  if (totalBudget) {
    params[FacebookAdsApi.Campaign.Fields.lifetime_budget] = Math.round(totalBudget * 100);
  }
  await campaign.api_update([params]);
}

export async function listCampaigns(status?: string): Promise<CampaignResponse[]> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const fields = [
    FacebookAdsApi.Campaign.Fields.id,
    FacebookAdsApi.Campaign.Fields.name,
    FacebookAdsApi.Campaign.Fields.status,
    FacebookAdsApi.Campaign.Fields.effective_status,
  ];

  const params: Record<string, unknown> = {
    limit: 100,
  };

  if (status) {
    params.filtering = [{ field: 'campaign.status', operator: 'EQUALS', value: status }];
  }

  const campaigns = await account.getCampaigns(fields, params);

  return campaigns.map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    effectiveStatus: c.effective_status,
  }));
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await updateCampaignStatus(campaignId, 'DELETED');
}
