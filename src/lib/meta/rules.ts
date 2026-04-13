import { AutomatedRuleConfig, PerformanceMetrics } from '../../types/meta';
import { initMetaApi, FacebookAdsApi } from './client';
import { buildAccountPath } from './credentials';

const AutomatedRule = FacebookAdsApi.AutomatedRule;

export async function createAutomatedRule(config: AutomatedRuleConfig): Promise<{ id: string; name: string }> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const spec = buildRuleSpec(config);
  const params: Record<string, unknown> = {
    [AutomatedRule.Fields.name]: config.name,
    [AutomatedRule.Fields.status]: 'PAUSED',
    ...spec,
  };

  if (config.schedule) {
    params[AutomatedRule.Fields.schedule] = {
      days: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      frequency: config.schedule === 'HOURLY' ? 3600 : config.schedule === 'DAILY' ? 86400 : 0,
    };
  }

  const rule = await account.createAutomatedRule([], params);

  return { id: rule.id, name: config.name };
}

function buildRuleSpec(config: AutomatedRuleConfig): Record<string, unknown> {
  const objectType = config.campaignId
    ? 'CAMPAIGN'
    : config.adSetId
    ? 'ADSET'
    : 'AD';

  const scope: Record<string, unknown> = {};
  if (config.campaignId) scope.campaign_id = [config.campaignId];
  if (config.adSetId) scope.adset_id = [config.adSetId];

  const condition = {
    field: `campaign.delivery.${config.triggerType}`,
    operator: config.operator,
    value: config.value,
  };

  const actions = [mapAction(config)];

  return {
    [AutomatedRule.Fields.object_type]: objectType,
    [AutomatedRule.Fields.object_id]: config.campaignId || config.adSetId || '',
    [AutomatedRule.Fields.scope]: scope,
    [AutomatedRule.Fields.config]: {
      condition_operator: 'AND',
      conditions: [condition],
    },
    [AutomatedRule.Fields.actions]: actions,
  };
}

function mapAction(config: AutomatedRuleConfig): Record<string, unknown> {
  const actionConfig: Record<string, unknown> = {};

  switch (config.action) {
    case 'PAUSE':
      return { type: 'PAUSE', field: 'campaign.status', value: 'PAUSED' };
    case 'INCREASE_BUDGET':
      return {
        type: 'CHANGE_BUDGET',
        field: 'campaign.daily_budget',
        value: config.budgetAdjustmentPercent || 20,
        operator: 'MULTIPLY',
      };
    case 'DECREASE_BUDGET':
      return {
        type: 'CHANGE_BUDGET',
        field: 'campaign.daily_budget',
        value: config.budgetAdjustmentPercent || 20,
        operator: 'DIVIDE',
      };
    case 'NOTIFY':
      return { type: 'EMAIL' };
    default:
      return { type: 'PAUSE' };
  }
}

export async function activateRule(ruleId: string): Promise<void> {
  const api = initMetaApi();
  const rule = new (FacebookAdsApi as any).AutomatedRule(ruleId);
  await rule.api_update([{ status: 'ACTIVE' }]);
}

export async function pauseRule(ruleId: string): Promise<void> {
  const api = initMetaApi();
  const rule = new (FacebookAdsApi as any).AutomatedRule(ruleId);
  await rule.api_update([{ status: 'PAUSED' }]);
}

export async function deleteRule(ruleId: string): Promise<void> {
  const api = initMetaApi();
  const rule = new (FacebookAdsApi as any).AutomatedRule(ruleId);
  await rule.api_delete();
}

export async function getRulesForCampaign(campaignId: string): Promise<Array<{ id: string; name: string; status: string }>> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const rules = await account.getAutomatedRules(
    ['id', 'automated_rule.name', 'automated_rule.status'],
    {
      filtering: [{ field: 'automated_rule.campaign_id', operator: 'EQUALS', value: campaignId }],
    }
  );

  return rules.map((r: any) => ({
    id: r.id,
    name: r.automated_rule?.name || r.name,
    status: r.automated_rule?.status || r.status,
  }));
}
