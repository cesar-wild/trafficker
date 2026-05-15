import {
  validateFirstWeekMetrics,
  summarizeFirstWeekPerformance,
  FirstWeekMetrics,
  CreativePerformanceBaseline,
} from '../monitor';

describe('Monitor', () => {
  const mockBaseline: CreativePerformanceBaseline = {
    creativeId: 'creative_001',
    name: 'Test Creative',
    ctrTarget: 0.05,
    conversionRateTarget: 0.03,
    maxFrequency: 3.0,
  };

  const mockMetrics: FirstWeekMetrics = {
    creativeId: 'creative_001',
    impressions: 10000,
    clicks: 600,
    ctr: 0.06,
    conversions: 200,
    conversionRate: 0.033,
    spend: 500,
    frequency: 2.5,
    daysActive: 7,
  };

  describe('validateFirstWeekMetrics', () => {
    it('should pass healthy metrics with no alerts', () => {
      const alerts = validateFirstWeekMetrics(mockMetrics, mockBaseline);
      expect(alerts.length).toBe(0);
    });

    it('should alert on CTR underperformance (80% below target)', () => {
      const underperformingMetrics: FirstWeekMetrics = {
        ...mockMetrics,
        ctr: 0.035, // 30% below target of 0.05
      };

      const alerts = validateFirstWeekMetrics(underperformingMetrics, mockBaseline);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('underperforming');
      expect(alerts[0].metric).toBe('CTR');
    });

    it('should alert on excellent CTR performance (20% above target)', () => {
      const excellentMetrics: FirstWeekMetrics = {
        ...mockMetrics,
        ctr: 0.062, // 24% above target of 0.05
      };

      const alerts = validateFirstWeekMetrics(excellentMetrics, mockBaseline);
      expect(alerts.some(a => a.type === 'excellent')).toBe(true);
    });

    it('should alert on fatigue when frequency exceeds max', () => {
      const fatiguingMetrics: FirstWeekMetrics = {
        ...mockMetrics,
        frequency: 3.5, // Above max of 3.0
      };

      const alerts = validateFirstWeekMetrics(fatiguingMetrics, mockBaseline);
      expect(alerts.some(a => a.type === 'fatiguing')).toBe(true);
    });
  });

  describe('summarizeFirstWeekPerformance', () => {
    it('should count healthy creatives correctly', () => {
      const baselines = new Map<string, CreativePerformanceBaseline>();
      baselines.set('creative_001', mockBaseline);

      const summary = summarizeFirstWeekPerformance([mockMetrics], baselines);

      expect(summary.total).toBe(1);
      expect(summary.healthy).toBe(1);
      expect(summary.excellent).toBe(0);
      expect(summary.underperforming).toBe(0);
    });

    it('should count excellent performance', () => {
      const excellentMetrics: FirstWeekMetrics = {
        ...mockMetrics,
        ctr: 0.065, // Above target
      };

      const baselines = new Map<string, CreativePerformanceBaseline>();
      baselines.set('creative_001', mockBaseline);

      const summary = summarizeFirstWeekPerformance([excellentMetrics], baselines);

      expect(summary.excellent).toBeGreaterThan(0);
    });

    it('should handle multiple creatives', () => {
      const metrics1: FirstWeekMetrics = {
        ...mockMetrics,
        creativeId: 'creative_001',
      };

      const metrics2: FirstWeekMetrics = {
        ...mockMetrics,
        creativeId: 'creative_002',
        ctr: 0.035, // Underperforming
      };

      const baselines = new Map<string, CreativePerformanceBaseline>();
      baselines.set('creative_001', mockBaseline);
      baselines.set('creative_002', { ...mockBaseline, creativeId: 'creative_002' });

      const summary = summarizeFirstWeekPerformance([metrics1, metrics2], baselines);

      expect(summary.total).toBe(2);
      expect(summary.healthy).toBe(1);
      expect(summary.underperforming).toBeGreaterThan(0);
    });
  });
});
