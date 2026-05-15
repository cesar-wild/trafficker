import { CreativeMetrics, detectFatigue } from './fatigue';
import { rankCreatives } from './scoring';
import { decideRotation, RotationDecision } from './rotation';
import { generateVariants } from '../templates/generator';
import { CampaignBrief } from '../templates/schemas';

interface CreativeWithMeta extends CreativeMetrics {
  id: string;
  name: string;
  campaignId: string;
}

const SAMPLE_CAMPAIGN_ID = 'camp_001';

const SAMPLE_CREATIVES: CreativeWithMeta[] = [
  {
    id: 'creative_001',
    name: 'Summer Sale Hero',
    campaignId: 'camp_001',
    ctr: 0.065,
    ctrPrevWeek: 0.070,
    frequency: 2.1,
    conversionRate: 0.035,
    conversionRatePrevWeek: 0.038,
    activeDays: 5,
  },
  {
    id: 'creative_002',
    name: 'Product Showcase',
    campaignId: 'camp_001',
    ctr: 0.042,
    ctrPrevWeek: 0.055,
    frequency: 3.2,
    conversionRate: 0.018,
    conversionRatePrevWeek: 0.028,
    activeDays: 16,
  },
  {
    id: 'creative_003',
    name: 'Testimonial Ad',
    campaignId: 'camp_001',
    ctr: 0.078,
    ctrPrevWeek: 0.075,
    frequency: 1.8,
    conversionRate: 0.042,
    conversionRatePrevWeek: 0.040,
    activeDays: 4,
  },
  {
    id: 'creative_004',
    name: 'Ugc Creator Collab',
    campaignId: 'camp_001',
    ctr: 0.038,
    ctrPrevWeek: 0.052,
    frequency: 4.5,
    conversionRate: 0.012,
    conversionRatePrevWeek: 0.024,
    activeDays: 22,
  },
  {
    id: 'creative_creative_005',
    name: 'Limited Offer Banner',
    campaignId: 'camp_001',
    ctr: 0.055,
    ctrPrevWeek: 0.058,
    frequency: 2.8,
    conversionRate: 0.029,
    conversionRatePrevWeek: 0.031,
    activeDays: 9,
  },
];

export function runWeeklyCreativeRefresh(campaignId: string): void {
  console.log(`\n=== SPARK: Weekly Creative Refresh for ${campaignId} ===\n`);

  const metrics = new Map<string, CreativeMetrics>();
  const creativeDetails: Record<string, CreativeWithMeta> = {};

  for (const creative of SAMPLE_CREATIVES) {
    metrics.set(creative.id, {
      ctr: creative.ctr,
      ctrPrevWeek: creative.ctrPrevWeek,
      frequency: creative.frequency,
      conversionRate: creative.conversionRate,
      conversionRatePrevWeek: creative.conversionRatePrevWeek,
      activeDays: creative.activeDays,
    });
    creativeDetails[creative.id] = creative;
  }

  console.log('--- Step 1: Creative Fatigue Analysis ---\n');
  for (const creative of SAMPLE_CREATIVES) {
    const triggers = detectFatigue(metrics.get(creative.id)!);
    const status = triggers.length > 0 ? '⚠️ FATIGUED' : '✅ HEALTHY';
    console.log(`${creative.name} (${creative.id}): ${status}`);
    if (triggers.length > 0) {
      for (const trigger of triggers) {
        console.log(`  - ${trigger.type}: ${JSON.stringify('value' in trigger ? trigger.value : 'pct' in trigger ? trigger.pct + '%' : trigger.days + ' days')}`);
      }
    }
  }

  console.log('\n--- Step 2: Creative Scoring & Ranking ---\n');
  const ranked = rankCreatives(metrics);
  for (const rank of ranked) {
    const creative = creativeDetails[rank.id];
    console.log(`  ${rank.score.toFixed(2)} - ${creative.name} (${creative.id})`);
  }

  console.log('\n--- Step 3: Rotation Decision ---\n');
  const decision = decideRotation(campaignId, metrics);
  console.log(`Retire: ${decision.retire.join(', ') || 'none'}`);
  console.log(`Keep: ${decision.keep.join(', ')}`);

  console.log('\n--- Step 4: Actions Required ---\n');
  if (decision.retire.length > 0) {
    console.log('RETIRE underperforming creatives:');
    for (const retiredId of decision.retire) {
      console.log(`  - ${retiredId}: ${creativeDetails[retiredId].name}`);
    }
    console.log('\n→ Request new variants from MUSE for replaced slots');
  }

  const highPerformers = ranked.slice(0, 2).map(r => r.id);
  console.log('\n→ Coordinate with PILOT to rotate new creatives into campaign');
  console.log(`→ Promote top performers: ${highPerformers.join(', ')}`);

  console.log('\n=== Weekly Creative Refresh Complete ===\n');
}

export function planCreativeRotation(
  campaignId: string,
  metrics: Map<string, CreativeMetrics>
): {
  decision: RotationDecision;
  replacementBrief: CampaignBrief;
  newVariants: ReturnType<typeof generateVariants>;
} {
  const decision = decideRotation(campaignId, metrics);

  // Create brief for replacement creatives based on top performers
  const ranked = rankCreatives(metrics);
  const topPerformer = ranked[0];
  const topMetrics = metrics.get(topPerformer.id);

  const replacementBrief: CampaignBrief = {
    product: 'Premium Service',
    audience: 'busy professionals',
    angle: 'save time and money',
    emotion: 'excitement',
    hook: 'social_proof',
    playbook: 'scale',
    offer: 'Limited time offer',
    brand: 'YourBrand',
  };

  // Generate replacement variants
  const newVariants = generateVariants(replacementBrief, 3);

  return {
    decision,
    replacementBrief,
    newVariants,
  };
}

if (require.main === module) {
  runWeeklyCreativeRefresh(SAMPLE_CAMPAIGN_ID);
}