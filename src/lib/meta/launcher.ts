import {
  CampaignConfig,
  AdSetConfig,
  AdCreativeConfig,
  AutomatedRuleConfig,
  CampaignResponse,
  AdSetResponse,
  AdResponse,
  PerformanceMetrics,
} from '../../types/meta';
import * as campaigns from './campaigns';
import * as adsets from './adsets';
import * as creatives from './creatives';
import * as rules from './rules';
import * as insights from './insights';

export interface LaunchRequest {
  campaign: CampaignConfig;
  adSets: AdSetConfig[];
  creatives: Array<{ adSetId: string; creative: AdCreativeConfig }>;
  automatedRules?: AutomatedRuleConfig[];
}

export interface LaunchResult {
  campaign: CampaignResponse;
  adSets: AdSetResponse[];
  ads: AdResponse[];
  ruleIds: Array<{ id: string; name: string }>;
}

export async function launchCampaign(request: LaunchRequest): Promise<LaunchResult> {
  const campaign = await campaigns.createCampaign(request.campaign);

  const adSets: AdSetResponse[] = [];
  const ads: AdResponse[] = [];

  for (const adSetConfig of request.adSets) {
    const fullAdSetConfig: AdSetConfig = {
      ...adSetConfig,
      campaignId: campaign.id,
    };
    const adSet = await adsets.createAdSet(fullAdSetConfig);
    adSets.push(adSet);
  }

  for (const { adSetId, creative: creativeConfig } of request.creatives) {
    const adSet = adSets.find((a) => a.id === adSetId);
    if (!adSet) continue;

    const fullCreativeConfig: AdCreativeConfig = {
      ...creativeConfig,
      adSetId: adSet.id,
    };

    const creative = await creatives.createAdCreative(fullCreativeConfig);
    const ad = await creatives.createAd(fullCreativeConfig, creative.id);
    ads.push(ad);
  }

  const ruleIds: Array<{ id: string; name: string }> = [];
  if (request.automatedRules) {
    for (const ruleConfig of request.automatedRules) {
      const fullRuleConfig: AutomatedRuleConfig = {
        ...ruleConfig,
        campaignId: ruleConfig.campaignId || campaign.id,
      };
      const rule = await rules.createAutomatedRule(fullRuleConfig);
      ruleIds.push(rule);
    }
  }

  return { campaign, adSets, ads, ruleIds };
}

export async function pauseCampaign(campaignId: string): Promise<void> {
  await campaigns.updateCampaignStatus(campaignId, 'PAUSED');
}

export async function resumeCampaign(campaignId: string): Promise<void> {
  await campaigns.updateCampaignStatus(campaignId, 'ACTIVE');
}

export async function scaleCampaignBudget(
  campaignId: string,
  newDailyBudget: number,
  increasePercent: number
): Promise<void> {
  await campaigns.updateCampaignBudget(campaignId, newDailyBudget);

  const adSets = await adsets.listAdSets(campaignId);
  for (const adSet of adSets) {
    const newAdSetBudget = (newDailyBudget / adSets.length) * (1 + increasePercent / 100);
    await adsets.updateAdSetBudget(adSet.id, newAdSetBudget);
  }
}

export async function getCampaignHealth(campaignId: string): Promise<{
  campaign: CampaignResponse;
  metrics: PerformanceMetrics;
  adSets: AdSetResponse[];
}> {
  const campaign = await campaigns.getCampaign(campaignId);
  const metrics = (await insights.getCampaignInsights(campaignId, 'last_7_days'))[0] || {
    campaignId,
    impressions: 0,
    reach: 0,
    clicks: 0,
    spend: 0,
    ctr: 0,
    cpc: 0,
    conversions: 0,
    cpa: 0,
    frequency: 0,
    dateStart: '',
    dateStop: '',
  };
  const adSets = await adsets.listAdSets(campaignId);

  return { campaign, metrics, adSets };
}

export { campaigns, adsets, creatives, rules, insights };
