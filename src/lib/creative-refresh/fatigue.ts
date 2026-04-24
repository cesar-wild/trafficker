export interface CreativeMetrics {
  ctr: number;
  ctrPrevWeek: number;
  frequency: number;
  conversionRate: number;
  conversionRatePrevWeek: number;
  activeDays: number;
}

export type FatigueTrigger =
  | { type: "frequency_exceeded"; value: number }
  | { type: "ctr_declined"; pct: number }
  | { type: "conv_declined"; pct: number }
  | { type: "stale"; days: number };

export function detectFatigue(m: CreativeMetrics): FatigueTrigger[] {
  const triggers: FatigueTrigger[] = [];
  if (m.frequency > 3.0) {
    triggers.push({ type: "frequency_exceeded", value: m.frequency });
  }
  if (m.ctrPrevWeek > 0) {
    const ctrPct = (m.ctrPrevWeek - m.ctr) / m.ctrPrevWeek;
    if (ctrPct > 0.20) {
      triggers.push({ type: "ctr_declined", pct: Math.round(ctrPct * 100) });
    }
  }
  if (m.conversionRatePrevWeek > 0) {
    const convPct = (m.conversionRatePrevWeek - m.conversionRate) / m.conversionRatePrevWeek;
    if (convPct > 0.25) {
      triggers.push({ type: "conv_declined", pct: Math.round(convPct * 100) });
    }
  }
  if (m.activeDays > 14) {
    triggers.push({ type: "stale", days: m.activeDays });
  }
  return triggers;
}