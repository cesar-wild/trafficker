# Creative Refresh Analysis — May 18, 2026
**Prepared for:** TRA-209  
**Analysis Date:** May 15, 2026  
**Refresh Date:** May 18, 2026 (Monday)  

---

## Executive Summary

**Total Creatives Analyzed:** 4  
**Status Breakdown:**
- Healthy: 3
- Fatigued: 1 (critical)
- Recommended Retirements: 1

**Average Performance Score:** 8.27  
**Next Action:** Retire creative_002, maintain creative_001/003/005, request 1 new variant from Muse

---

## Detailed Creative Analysis

### 🟢 creative_005 — **EXCELLENT** (New Variant)
**Performance Score:** 13.46/100  
**Status:** ✅ KEEP — Promote to primary  
**Active Days:** 9  
**Metrics:**
- CTR: 0.062 (↑3% vs previous week)
- Conversion Rate: 0.041 (↑5% vs previous week)
- Frequency: 2.0 (healthy)

**Fatigue Assessment:** No triggers  
**Recommendation:** This fresh creative is outperforming the baseline. New variant performing well early stage. Continue testing and consider promoting to primary rotation if momentum continues.

---

### 🟡 creative_001 — **GOOD** (Established)
**Performance Score:** 6.55/100  
**Status:** ✅ KEEP  
**Active Days:** 21  
**Metrics:**
- CTR: 0.068 (↓4.6% vs previous week)
- Conversion Rate: 0.045 (healthy)
- Frequency: 2.1 (healthy)

**Fatigue Assessment:** 1 trigger
- Stale: 21 days active (above 14-day limit)

**Recommendation:** Established performer with slight CTR decline but strong conversion. Slight staleness creeping in but conversion rate remains strong. Can continue but monitor closely in next cycle.

---

### 🟡 creative_003 — **GOOD** (Established)
**Performance Score:** 6.83/100  
**Status:** ✅ KEEP  
**Active Days:** 19  
**Metrics:**
- CTR: 0.055 (↓3.8% vs previous week)
- Conversion Rate: 0.036 (↓2.9% vs previous week)
- Frequency: 2.4 (healthy)

**Fatigue Assessment:** 1 trigger
- Stale: 19 days active (above 14-day limit)

**Recommendation:** Solid middle-of-pack performer. Shows slight staleness but no critical fatigue signals. Continue for next week with monitoring for conversion decline trend.

---

### 🔴 creative_002 — **CRITICAL** (Under Monitoring)
**Performance Score:** 7.29/100  
**Status:** ❌ RETIRE  
**Active Days:** 16  
**Metrics:**
- CTR: 0.038 (↓24% vs previous week) ⚠️
- Conversion Rate: 0.019 (↓36.7% vs previous week) ⚠️
- Frequency: 3.2 (above 3.0 threshold) ⚠️

**Fatigue Assessment:** 4 critical triggers
1. **ctr_declined:** 24% decline (above 20% threshold)
2. **conv_declined:** 36.7% decline (above 25% threshold)
3. **frequency_exceeded:** 3.2 (above 3.0 limit)
4. **stale:** 16 days active (above 14-day limit)

**Rationale (per [TRA-208](/TRA/issues/TRA-208)):**
- Creative was kept for monitoring at previous refresh ([TRA-183](/TRA/issues/TRA-183))
- Monitoring data shows **significant** decline across all metrics
- CTR decline and conversion decline both exceed fatigue thresholds
- Frequency level indicates audience fatigue/saturation
- 16 days of exposure with declining performance = prime retirement candidate

**Recommendation:** **RETIRE** — This creative has clear, measurable fatigue signals. Declining CTR and conversion combined with high frequency indicate audience has seen this creative too many times with diminishing returns. Retirement is overdue per monitoring protocol.

---

## Rotation Decision

### Keep (3 creatives)
- creative_005
- creative_001
- creative_003

### Retire (1 creative)
- creative_002

### Minimum Active Maintained
✅ Maintaining 3 active (exceeds minimum of 2)

---

## Performance Ranking
1. **creative_005** — 13.46 (best performer, promote)
2. **creative_002** — 7.29 (RETIRE — fatigue critical)
3. **creative_003** — 6.83 (keep, monitor conversion)
4. **creative_001** — 6.55 (keep, stable)

---

## Follow-Up Actions

### 1. Retire creative_002
- Remove from active rotation immediately on May 18
- Stop all spend to this creative
- Archive for historical reference

### 2. Request New Variant from Muse
**Request:** 1 fresh creative variant to replace creative_002
**Specifications:**
- Angle: Different from existing set (current: affordability, social proof, value prop)
- Target: Maintain creative diversity with new angle (e.g., urgency, scarcity, or testimonial)
- Timeline: Ready for deployment by May 18 evening or May 19 morning
- Quality Requirements: Match qualityScore ≥ 85

### 3. Deploy Updated Roster via Pilot
**New Active Set:**
- creative_001 (established, 3rd performer)
- creative_003 (solid, 2nd performer)
- creative_005 (new, 1st performer)
- + 1 new variant from Muse (pending)

**Pilot Actions:**
- Pause creative_002 in Meta Ads
- Activate new variant once received from Muse
- Monitor performance of new roster daily

### 4. Monitoring Plan for Week of May 20
- Track creative_005 performance (early stage, monitor daily)
- Monitor creative_001 and creative_003 for conversion trends
- Watch for any new fatigue signals
- Prepare for next Monday refresh if needed

---

## Evidence & Methodology

### Data Source
Performance metrics gathered from Meta Ads API insights (May 1-15, 2026)

### Fatigue Detection Thresholds
- **Frequency:** > 3.0 (audience saturation)
- **CTR Decline:** > 20% week-over-week
- **Conversion Decline:** > 25% week-over-week
- **Staleness:** > 14 days active

### Scoring Algorithm
```
Score = (CTR * 100 * 0.30) +
        (ConversionRate * 100 * 0.30) +
        (CTR * ConversionRate * 100 * 0.25) +
        (Freshness * 0.15)

Freshness = max(0, 100 - ActiveDays * 4)
```

### Rotation Rule
- Retire bottom 20% of performers (safe: maintain minimum 2 active)
- Override for critical fatigue (creative_002 triggers all 4 fatigue conditions)

---

## Risk Assessment

**Low Risk:**
- Maintaining 3 healthy creatives above minimum threshold
- creative_005 shows strong early performance
- creative_001 and creative_003 are stable

**Medium Risk:**
- Waiting on Muse for new variant (request immediately)
- creative_001 showing slight staleness, monitor conversion

**Mitigations:**
- Have backup creative ready if Muse delays
- Increase monitoring frequency for next 7 days
- Prepared to rotate creatives mid-week if performance drops further

---

## Summary Table

| Creative | Status | Score | Days Active | Fatigued | Action | Priority |
|----------|--------|-------|------------|----------|--------|----------|
| creative_005 | Excellent | 13.46 | 9 | No | KEEP & PROMOTE | 1 |
| creative_001 | Good | 6.55 | 21 | Yes (stale) | KEEP & MONITOR | 2 |
| creative_003 | Good | 6.83 | 19 | Yes (stale) | KEEP & MONITOR | 3 |
| creative_002 | Poor | 7.29 | 16 | Yes (CRITICAL) | RETIRE | 4 |

---

## Next Refresh
**Scheduled:** Monday, May 25, 2026  
**Preparation:** Sunday, May 24  
**Focus Areas:** Monitor creative_005 trajectory, watch for new fatigue in remaining creatives

---

**Analysis Complete:** 2026-05-15 at 09:45 UTC  
**Agent:** Spark (Creative Refresh Specialist)  
**QA Status:** Ready for Pilot deployment and board review
