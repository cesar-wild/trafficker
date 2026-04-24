import { describe, it, expect } from "vitest";
import { detectFatigue, CreativeMetrics } from "../fatigue";

describe("detectFatigue", () => {
  it("returns empty array when no thresholds exceeded", () => {
    const m: CreativeMetrics = {
      ctr: 0.05,
      ctrPrevWeek: 0.05,
      frequency: 2.0,
      conversionRate: 0.03,
      conversionRatePrevWeek: 0.03,
      activeDays: 7,
    };
    expect(detectFatigue(m)).toEqual([]);
  });

  it("triggers frequency_exceeded when frequency > 3.0", () => {
    const m: CreativeMetrics = {
      ctr: 0.05,
      ctrPrevWeek: 0.05,
      frequency: 4.5,
      conversionRate: 0.03,
      conversionRatePrevWeek: 0.03,
      activeDays: 7,
    };
    const triggers = detectFatigue(m);
    expect(triggers).toContainEqual({ type: "frequency_exceeded", value: 4.5 });
  });

  it("triggers ctr_declined when CTR dropped > 20%", () => {
    const m: CreativeMetrics = {
      ctr: 0.04,
      ctrPrevWeek: 0.05,
      frequency: 2.0,
      conversionRate: 0.03,
      conversionRatePrevWeek: 0.03,
      activeDays: 7,
    };
    const triggers = detectFatigue(m);
    expect(triggers).toContainEqual({ type: "ctr_declined", pct: 20 });
  });

  it("triggers conv_declined when conversion rate dropped > 25%", () => {
    const m: CreativeMetrics = {
      ctr: 0.05,
      ctrPrevWeek: 0.05,
      frequency: 2.0,
      conversionRate: 0.02,
      conversionRatePrevWeek: 0.04,
      activeDays: 7,
    };
    const triggers = detectFatigue(m);
    expect(triggers).toContainEqual({ type: "conv_declined", pct: 50 });
  });

  it("triggers stale when activeDays > 14", () => {
    const m: CreativeMetrics = {
      ctr: 0.05,
      ctrPrevWeek: 0.05,
      frequency: 2.0,
      conversionRate: 0.03,
      conversionRatePrevWeek: 0.03,
      activeDays: 20,
    };
    const triggers = detectFatigue(m);
    expect(triggers).toContainEqual({ type: "stale", days: 20 });
  });

  it("returns multiple triggers when multiple thresholds exceeded", () => {
    const m: CreativeMetrics = {
      ctr: 0.03,
      ctrPrevWeek: 0.06,
      frequency: 4.0,
      conversionRate: 0.01,
      conversionRatePrevWeek: 0.04,
      activeDays: 18,
    };
    const triggers = detectFatigue(m);
    expect(triggers.length).toBe(4);
    expect(triggers).toContainEqual({ type: "frequency_exceeded", value: 4.0 });
    expect(triggers).toContainEqual({ type: "ctr_declined", pct: 50 });
    expect(triggers).toContainEqual({ type: "conv_declined", pct: 75 });
    expect(triggers).toContainEqual({ type: "stale", days: 18 });
  });
});