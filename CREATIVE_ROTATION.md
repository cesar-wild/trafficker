# Creative Rotation System (PILOT)

## Overview

The Creative Rotation System is a fully integrated workflow for detecting fatigued creatives, generating replacements, and deploying them into live campaigns. It coordinates between SPARK (analysis), MUSE (generation), and PILOT (deployment) agents.

## System Architecture

### 1. **SPARK: Creative Analysis & Decision**
- **Module**: `src/lib/creative-refresh/spark-workflow.ts`
- **Functions**:
  - `runWeeklyCreativeRefresh()` - Detects fatigue, scores, and recommends rotation
  - `planCreativeRotation()` - Plans replacements based on top performers
- **Output**: Rotation decision with retire/keep lists

### 2. **MUSE: Creative Generation**
- **Module**: `src/lib/templates/generator.ts`
- **Functions**:
  - `generateVariants()` - Creates 3-4 ad variant options
  - `scoreVariant()` - Quality-scores each variant
- **Output**: `AdVariant[]` with headlines, copy, visuals, CTAs

### 3. **PILOT: Creative Deployment & Monitoring**
- **Modules**:
  - `src/lib/creative-refresh/deployment.ts` - Deploy new creatives, retire old ones
  - `src/lib/creative-refresh/monitor.ts` - Track first-week performance
- **APIs**:
  - `POST /api/creative-refresh/deploy` - Deploy creatives
  - `POST /api/creative-refresh/monitor` - Evaluate first-week performance

## Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    WEEKLY CREATIVE REFRESH                    │
└──────────────────────────────────────────────────────────────┘

1. SPARK ANALYZES (runWeeklyCreativeRefresh)
   ├─ Detect fatigue triggers
   ├─ Score & rank all creatives
   ├─ Decide rotation (retire/keep)
   └─ → Ready for replacement

2. MUSE GENERATES (generateVariants)
   ├─ Create campaign brief based on top performers
   ├─ Generate 3-4 variants per creative
   ├─ Quality score each variant
   └─ → New creatives ready for deployment

3. PILOT DEPLOYS (deployNewCreatives)
   ├─ Create creatives in Meta Ads API
   ├─ Create ads in the adset (initially paused)
   ├─ Pause old underperforming creatives
   └─ → Rotation complete, monitor begins

4. PILOT MONITORS (First Week)
   ├─ Collect performance metrics daily
   ├─ Compare against baseline targets
   ├─ Alert on underperformance/fatigue/excellence
   └─ → Insights for next week's refresh
```

## Fatigue Detection

Creatives are marked as fatigued when:
- **CTR Decline**: CTR drops 20%+ week-over-week
- **High Frequency**: Impressions/reach ratio exceeds 3.0
- **Conversion Slip**: Conversion rate drops 20%+ week-over-week
- **Long Active Duration**: Running for 20+ days continuously

Example:
```
Creative_004 (UGC Creator Collab):
  ✗ CTR: 0.038 (was 0.052) - 27% decline
  ✗ Frequency: 4.5 (max 3.0) - fatigue signal
  ✗ Conversion: 0.012 (was 0.024) - 50% decline
  ✗ Active Days: 22 - needs refresh
```

## Scoring & Ranking

Creatives are scored on a 0-100 scale considering:
- CTR strength and trend
- Conversion rate performance
- Frequency (lower is better)
- Days active (newer is better)
- Engagement metrics

Top 2 performers become the template for new creatives.

## Rotation Decision Rules

**Keep**: Healthy creatives with no fatigue signals
**Retire**: Creatives with 2+ fatigue triggers
**Ratio**: Maintain 60% keepers, 40% rotation

## Deployment Process

### Step 1: Prepare Variants
```typescript
const variants = generateVariants(campaignBrief, 4);
// Returns AdVariant[] with all metadata
```

### Step 2: Deploy
```typescript
await deployNewCreatives({
  campaignId: 'camp_001',
  adSetId: 'adset_123',
  pageId: 'page_456',
  landingUrl: 'https://example.com/offer',
  newVariants: variants,
  retireCreativeIds: ['creative_004'],
});
// Maps variants → Meta Ads creatives → ads
// Activates new ads (paused), pauses old creatives
```

### Step 3: Monitor
```typescript
await fetch('/api/creative-refresh/monitor', {
  method: 'POST',
  body: JSON.stringify({
    campaignId: 'camp_001',
    metrics: [
      {
        creativeId: 'variant_new_001',
        impressions: 5000,
        ctr: 0.062,
        conversionRate: 0.035,
        frequency: 2.1,
        daysActive: 7,
      },
    ],
    baselines: [
      {
        creativeId: 'variant_new_001',
        ctrTarget: 0.055,
        conversionRateTarget: 0.030,
        maxFrequency: 3.0,
      },
    ],
  }),
});
// Returns performance alerts and recommendations
```

## Performance Thresholds

| Metric | Alert | Excellent |
|--------|-------|-----------|
| CTR | < 80% of target | > 120% of target |
| Conversion Rate | < 80% of target | > 120% of target |
| Frequency | > max threshold | Lower is better |

## API Endpoints

### POST /api/creative-refresh/deploy
Deploy new creatives and retire old ones.

**Request**:
```json
{
  "campaignId": "camp_001",
  "adSetId": "adset_123",
  "pageId": "page_456",
  "landingUrl": "https://example.com",
  "newVariants": [{ /* AdVariant */ }],
  "retireCreativeIds": ["creative_004"]
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "deployed": [
      {
        "variantId": "variant_001",
        "creativeId": "123456789",
        "adId": "987654321",
        "headline": "Save 50% Today"
      }
    ],
    "retired": [
      {
        "creativeId": "creative_004",
        "status": "paused"
      }
    ]
  }
}
```

### POST /api/creative-refresh/monitor
Evaluate first-week performance against baselines.

**Request**:
```json
{
  "campaignId": "camp_001",
  "metrics": [
    {
      "creativeId": "variant_001",
      "impressions": 10000,
      "clicks": 600,
      "ctr": 0.060,
      "conversions": 300,
      "conversionRate": 0.030,
      "spend": 500,
      "frequency": 2.5,
      "daysActive": 7
    }
  ],
  "baselines": [
    {
      "creativeId": "variant_001",
      "ctrTarget": 0.050,
      "conversionRateTarget": 0.025,
      "maxFrequency": 3.0
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "summary": {
    "total": 3,
    "excellent": 1,
    "healthy": 2,
    "underperforming": 0,
    "fatiguing": 0,
    "alerts": [
      {
        "creativeId": "variant_001",
        "type": "excellent",
        "message": "CTR exceeded target by 20%+ at 6.00%"
      }
    ]
  },
  "report": "=== FIRST-WEEK PERFORMANCE REPORT ===..."
}
```

## Testing

Run tests for deployment and monitoring:

```bash
npm test -- deployment.test.ts
npm test -- monitor.test.ts
```

Tests cover:
- Creative variant mapping
- Performance validation
- Alert generation
- Summary reporting

## Next Steps

1. **Execute Rotation** (This Task)
   - Generate replacement variants with MUSE
   - Deploy with PILOT
   - Set up monitoring

2. **Monitor First Week**
   - Collect daily performance metrics
   - Validate new creatives are meeting targets
   - Alert on underperformance

3. **Report & Iterate**
   - Generate performance report
   - Identify top performers for next week
   - Plan following week's refresh

## Troubleshooting

### Issue: Deployment fails
- Check Meta Ads API credentials
- Verify adSetId exists
- Ensure pageId is valid

### Issue: Monitoring shows no alerts
- Verify metrics are being passed
- Check that baselines match creative IDs
- Ensure sufficient time has passed (7+ days recommended)

### Issue: Creative not performing
- Review variant quality score
- Check targeting/audience alignment
- Consider different hooks/emotions in next batch

## References

- [Spark Workflow](./spark-workflow.ts) - Analysis & decision
- [Template Generator](../templates/generator.ts) - Creative generation
- [Deployment](./deployment.ts) - Meta Ads integration
- [Monitor](./monitor.ts) - Performance tracking
