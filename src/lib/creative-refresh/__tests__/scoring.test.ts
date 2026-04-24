import { describe, it, expect } from "vitest";
import { scoreCreative, rankCreatives, DEFAULT_WEIGHTS } from "../scoring";
import { CreativeMetrics } from "../fatigue";

const healthy: CreativeMetrics = {
  ctr: 0.06,
  ctrPrevWeek: 0.05,
  frequency: 2.0,
  conversionRate: 0.04,
  conversionRatePrevWeek: 0.04,
  activeDays: 5,
};

const weak: CreativeMetrics = {
  ctr: 0.02,
  ctrPrevWeek: 0.03,
  frequency: 4.5,
  conversionRate: 0.01,
  conversionRatePrevWeek: 0.02,
  activeDays: 20,
};

describe("scoreCreative", () => {
  it("scores higher for better metrics", () => {
    const healthyScore = scoreCreative(healthy);
    const weakScore = scoreCreative(weak);
    expect(healthyScore).toBeGreaterThan(weakScore);
  });

  it("is deterministic — same input produces same score", () => {
    const s1 = scoreCreative(healthy);
    const s2 = scoreCreative(healthy);
    expect(s1).toBe(s2);
  });

  it("applies weights correctly", () => {
    const highWeights = { ...DEFAULT_WEIGHTS, ctrWeight: 1.0, convRateWeight: 0, roasWeight: 0, freshnessWeight: 0 };
    const score = scoreCreative(healthy, highWeights);
    expect(score).toBeCloseTo(healthy.ctr * 100);
  });

  it("freshness penalty increases over time", () => {
    const fresh = scoreCreative(healthy, DEFAULT_WEIGHTS, 0);
    const stale = scoreCreative(healthy, DEFAULT_WEIGHTS, 10);
    expect(fresh).toBeGreaterThan(stale);
  });
});

describe("rankCreatives", () => {
  it("ranks by score descending", () => {
    const metrics = new Map<string, CreativeMetrics>([
      ["weak", weak],
      ["healthy", healthy],
    ]);
    const ranked = rankCreatives(metrics);
    expect(ranked[0].id).toBe("healthy");
    expect(ranked[1].id).toBe("weak");
  });

  it("handles empty map", () => {
    const ranked = rankCreatives(new Map());
    expect(ranked).toEqual([]);
  });

  it("returns scores for all creatives", () => {
    const metrics = new Map<string, CreativeMetrics>([
      ["a", healthy],
      ["b", weak],
      ["c", healthy],
    ]);
    const ranked = rankCreatives(metrics);
    expect(ranked.length).toBe(3);
    ranked.forEach((r) => expect(r.score).toBeGreaterThan(0));
  });
});