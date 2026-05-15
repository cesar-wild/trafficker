export interface CreativePerformanceBaseline {
  creativeId: string;
  name: string;
  ctrTarget: number;
  conversionRateTarget: number;
  maxFrequency: number;
}

export interface FirstWeekMetrics {
  creativeId: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  frequency: number;
  daysActive: number;
}

export interface PerformanceAlert {
  creativeId: string;
  type: 'underperforming' | 'fatiguing' | 'excellent';
  message: string;
  metric: string;
  actual: number;
  target: number;
}

export function validateFirstWeekMetrics(
  metrics: FirstWeekMetrics,
  baseline: CreativePerformanceBaseline
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  // Check CTR performance
  if (metrics.ctr < baseline.ctrTarget * 0.8) {
    alerts.push({
      creativeId: metrics.creativeId,
      type: 'underperforming',
      message: `CTR is ${(metrics.ctr * 100).toFixed(2)}% (target: ${(baseline.ctrTarget * 100).toFixed(2)}%)`,
      metric: 'CTR',
      actual: metrics.ctr,
      target: baseline.ctrTarget,
    });
  } else if (metrics.ctr >= baseline.ctrTarget * 1.2) {
    alerts.push({
      creativeId: metrics.creativeId,
      type: 'excellent',
      message: `CTR exceeded target by 20%+ at ${(metrics.ctr * 100).toFixed(2)}%`,
      metric: 'CTR',
      actual: metrics.ctr,
      target: baseline.ctrTarget,
    });
  }

  // Check conversion rate performance
  if (metrics.conversionRate < baseline.conversionRateTarget * 0.8) {
    alerts.push({
      creativeId: metrics.creativeId,
      type: 'underperforming',
      message: `Conversion rate is ${(metrics.conversionRate * 100).toFixed(2)}% (target: ${(baseline.conversionRateTarget * 100).toFixed(2)}%)`,
      metric: 'Conversion Rate',
      actual: metrics.conversionRate,
      target: baseline.conversionRateTarget,
    });
  }

  // Check for fatigue signs
  if (metrics.frequency > baseline.maxFrequency) {
    alerts.push({
      creativeId: metrics.creativeId,
      type: 'fatiguing',
      message: `Frequency is ${metrics.frequency.toFixed(2)} (max: ${baseline.maxFrequency})`,
      metric: 'Frequency',
      actual: metrics.frequency,
      target: baseline.maxFrequency,
    });
  }

  return alerts;
}

export function summarizeFirstWeekPerformance(
  allMetrics: FirstWeekMetrics[],
  baselines: Map<string, CreativePerformanceBaseline>
): {
  total: number;
  excellent: number;
  healthy: number;
  underperforming: number;
  fatiguing: number;
  alerts: PerformanceAlert[];
} {
  const alerts: PerformanceAlert[] = [];
  let excellent = 0;
  let healthy = 0;
  let underperforming = 0;
  let fatiguing = 0;

  for (const metrics of allMetrics) {
    const baseline = baselines.get(metrics.creativeId);
    if (!baseline) continue;

    const creativeAlerts = validateFirstWeekMetrics(metrics, baseline);
    alerts.push(...creativeAlerts);

    if (creativeAlerts.length === 0) {
      healthy++;
    } else {
      for (const alert of creativeAlerts) {
        if (alert.type === 'excellent') excellent++;
        if (alert.type === 'underperforming') underperforming++;
        if (alert.type === 'fatiguing') fatiguing++;
      }
    }
  }

  return {
    total: allMetrics.length,
    excellent,
    healthy,
    underperforming,
    fatiguing,
    alerts,
  };
}

export function generateMonitoringReport(
  summary: ReturnType<typeof summarizeFirstWeekPerformance>
): string {
  let report = `
=== FIRST-WEEK PERFORMANCE REPORT ===

Summary:
  Total Creatives: ${summary.total}
  Excellent: ${summary.excellent}
  Healthy: ${summary.healthy}
  Underperforming: ${summary.underperforming}
  Fatiguing: ${summary.fatiguing}

`;

  if (summary.alerts.length > 0) {
    report += `Alerts (${summary.alerts.length}):\n`;
    for (const alert of summary.alerts) {
      const status =
        alert.type === 'excellent'
          ? '✅'
          : alert.type === 'underperforming'
            ? '⚠️'
            : '🔄';
      report += `  ${status} ${alert.creativeId}: ${alert.message}\n`;
    }
  } else {
    report += `No alerts. All creatives performing as expected.\n`;
  }

  report += `\nRecommendations:\n`;
  const hasUnderperforming = summary.underperforming > 0;
  const hasExcellent = summary.excellent > 0;

  if (hasUnderperforming) {
    report += `  → Investigate and either refresh underperforming creatives or adjust targeting\n`;
  }
  if (hasExcellent) {
    report += `  → Scale budget for excellent-performing creatives\n`;
  }
  if (summary.fatiguing > 0) {
    report += `  → Proactively plan next rotation for fatiguing creatives\n`;
  }
  if (summary.healthy > 0 && !hasUnderperforming) {
    report += `  → Maintain current creative rotation; consider A/B testing new angles\n`;
  }

  return report;
}
