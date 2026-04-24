import { CreativeMetrics } from "./fatigue";

export interface ScoringWeights {
  ctrWeight: number;
  convRateWeight: number;
  roasWeight: number;
  freshnessWeight: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  ctrWeight: 0.30,
  convRateWeight: 0.30,
  roasWeight: 0.25,
  freshnessWeight: 0.15,
};

export function scoreCreative(
  m: CreativeMetrics,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  nowDays = 0
): number {
  const ctrScore = m.ctr * 100;
  const convScore = m.conversionRate * 100;
  const roasScore = m.ctr * m.conversionRate * 100;
  const freshnessScore = Math.max(0, 100 - nowDays * 4);
  return (
    ctrScore * weights.ctrWeight +
    convScore * weights.convRateWeight +
    roasScore * weights.roasWeight +
    freshnessScore * weights.freshnessWeight
  );
}

export function rankCreatives(
  metrics: Map<string, CreativeMetrics>
): Array<{ id: string; score: number }> {
  return [...metrics.entries()]
    .map(([id, m]) => ({ id, score: scoreCreative(m) }))
    .sort((a, b) => b.score - a.score);
}