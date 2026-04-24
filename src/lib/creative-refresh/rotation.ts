import { CreativeMetrics } from "./fatigue";
import { rankCreatives } from "./scoring";

export interface RotationDecision {
  campaignId: string;
  retire: string[];
  keep: string[];
  gracePeriodIds: string[];
}

export const MIN_ACTIVE = 2;
const RETIRE_BOTTOM_PCT = 0.20;
const GRACE_PERIOD_DAYS = 2;

export function decideRotation(
  campaignId: string,
  metrics: Map<string, CreativeMetrics>,
  gracePeriodDays = GRACE_PERIOD_DAYS
): RotationDecision {
  const ranked = rankCreatives(metrics);
  const total = ranked.length;
  if (total <= MIN_ACTIVE) {
    return { campaignId, retire: [], keep: ranked.map((r) => r.id), gracePeriodIds: [] };
  }
  const retireCount = Math.floor(total * RETIRE_BOTTOM_PCT);
  const safeRetireCount = Math.min(retireCount, Math.max(0, total - MIN_ACTIVE));
  return {
    campaignId,
    retire: ranked.slice(-safeRetireCount).map((r) => r.id),
    keep: ranked.slice(0, total - safeRetireCount).map((r) => r.id),
    gracePeriodIds: [],
  };
}