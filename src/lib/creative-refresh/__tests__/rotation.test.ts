import { describe, it, expect } from "vitest";
import { decideRotation, MIN_ACTIVE } from "../rotation";
import { CreativeMetrics } from "../fatigue";

const makeMetrics = (scores: number[]): Map<string, CreativeMetrics> => {
  const defaults: CreativeMetrics = {
    ctr: 0.05,
    ctrPrevWeek: 0.05,
    frequency: 2.0,
    conversionRate: 0.03,
    conversionRatePrevWeek: 0.03,
    activeDays: 7,
  };
  const map = new Map<string, CreativeMetrics>();
  scores.forEach((s, i) => {
    map.set(`creative-${i}`, { ...defaults, ctr: s, conversionRate: s });
  });
  return map;
};

describe("decideRotation", () => {
  it("keeps minimum 2 active when 2 creatives", () => {
    const metrics = makeMetrics([0.10, 0.01]);
    const decision = decideRotation("camp-A", metrics);
    expect(decision.keep.length).toBeGreaterThanOrEqual(MIN_ACTIVE);
    expect(decision.retire.length).toBe(0);
  });

  it("retires bottom 20% for 5 creatives (1 retire)", () => {
    const metrics = makeMetrics([0.10, 0.08, 0.06, 0.04, 0.02]);
    const decision = decideRotation("camp-B", metrics);
    expect(decision.keep.length).toBe(4);
    expect(decision.retire.length).toBe(1);
    expect(decision.retire).toContain("creative-4");
  });

  it("never retires all creatives", () => {
    const metrics = makeMetrics([0.10, 0.09, 0.08, 0.07]);
    const decision = decideRotation("camp-C", metrics);
    expect(decision.keep.length).toBeGreaterThanOrEqual(MIN_ACTIVE);
  });

  it("always keeps top scorer", () => {
    const metrics = makeMetrics([0.10, 0.01]);
    const decision = decideRotation("camp-D", metrics);
    expect(decision.keep).toContain("creative-0");
  });

  it("grace period ids defaults to empty array", () => {
    const metrics = makeMetrics([0.10, 0.01]);
    const decision = decideRotation("camp-E", metrics);
    expect(decision.gracePeriodIds).toEqual([]);
  });
});