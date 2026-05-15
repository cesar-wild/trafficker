import { AdVariant } from '../templates/schemas';
import { AdCreativeConfig } from '../../types/meta';
import { createAdCreative, createAd, pauseAd } from '../meta/creatives';

export interface DeploymentRequest {
  campaignId: string;
  adSetId: string;
  pageId: string;
  landingUrl: string;
  newVariants: AdVariant[];
  retireCreativeIds: string[];
}

export interface DeploymentResult {
  timestamp: string;
  campaignId: string;
  deployed: {
    variantId: string;
    creativeId: string;
    adId: string;
    headline: string;
  }[];
  retired: {
    creativeId: string;
    status: 'paused' | 'error';
  }[];
}

export function mapVariantToCreativeConfig(
  variant: AdVariant,
  adSetId: string,
  pageId: string,
  landingUrl: string
): AdCreativeConfig {
  return {
    name: `${variant.angle} - ${variant.hook}`,
    adSetId,
    creativeType: 'IMAGE',
    pageId,
    link: landingUrl,
    message: variant.primaryText,
    headline: variant.headline,
    description: variant.visualBrief,
    callToAction: variant.cta,
  };
}

export async function deployNewCreatives(
  request: DeploymentRequest
): Promise<DeploymentResult> {
  const deployed = [];
  const retired = [];

  console.log(`\n=== PILOT: Creative Deployment for ${request.campaignId} ===\n`);
  console.log(`Deploying ${request.newVariants.length} new variants...`);

  // Deploy new creatives
  for (const variant of request.newVariants) {
    try {
      const creativeConfig = mapVariantToCreativeConfig(
        variant,
        request.adSetId,
        request.pageId,
        request.landingUrl
      );

      console.log(`\n→ Deploying: ${variant.headline}`);

      // Create creative in Meta Ads
      const creative = await createAdCreative(creativeConfig);
      console.log(`  Creative created: ${creative.id}`);

      // Create ad (initially paused)
      const ad = await createAd(creativeConfig, creative.id);
      console.log(`  Ad created (paused): ${ad.id}`);

      deployed.push({
        variantId: variant.id,
        creativeId: creative.id,
        adId: ad.id,
        headline: variant.headline,
      });
    } catch (error) {
      console.error(
        `  ✗ Failed to deploy variant ${variant.id}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Pause old creatives
  console.log(`\nRetiring ${request.retireCreativeIds.length} underperforming creatives...`);

  for (const creativeId of request.retireCreativeIds) {
    try {
      console.log(`\n→ Retiring: ${creativeId}`);
      await pauseAd(creativeId);
      retired.push({ creativeId, status: 'paused' });
      console.log(`  Paused successfully`);
    } catch (error) {
      console.error(
        `  ✗ Failed to pause ${creativeId}:`,
        error instanceof Error ? error.message : String(error)
      );
      retired.push({ creativeId, status: 'error' });
    }
  }

  const result: DeploymentResult = {
    timestamp: new Date().toISOString(),
    campaignId: request.campaignId,
    deployed,
    retired,
  };

  console.log(`\n=== Deployment Complete ===`);
  console.log(`Deployed: ${deployed.length}/${request.newVariants.length}`);
  console.log(`Retired: ${retired.length}/${request.retireCreativeIds.length}`);
  console.log(`\n→ Next: Monitor new creatives for first-week performance\n`);

  return result;
}
