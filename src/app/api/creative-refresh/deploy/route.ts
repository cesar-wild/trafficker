import { NextRequest, NextResponse } from 'next/server';
import { AdVariant } from '@/lib/templates/schemas';
import { deployNewCreatives, DeploymentRequest } from '@/lib/creative-refresh/deployment';

interface DeploymentPayload {
  campaignId: string;
  adSetId: string;
  pageId: string;
  landingUrl: string;
  newVariants: AdVariant[];
  retireCreativeIds: string[];
}

export async function POST(req: NextRequest) {
  try {
    const payload: DeploymentPayload = await req.json();

    // Validate required fields
    if (
      !payload.campaignId ||
      !payload.adSetId ||
      !payload.pageId ||
      !payload.landingUrl ||
      !Array.isArray(payload.newVariants) ||
      !Array.isArray(payload.retireCreativeIds)
    ) {
      return NextResponse.json(
        {
          error: 'Missing required fields: campaignId, adSetId, pageId, landingUrl, newVariants, retireCreativeIds',
        },
        { status: 400 }
      );
    }

    // Check that we have creatives to deploy
    if (payload.newVariants.length === 0) {
      return NextResponse.json(
        { error: 'No new variants to deploy' },
        { status: 400 }
      );
    }

    console.log(
      `[${new Date().toISOString()}] Deployment request received for campaign ${payload.campaignId}`
    );
    console.log(`  New variants: ${payload.newVariants.length}`);
    console.log(`  Creatives to retire: ${payload.retireCreativeIds.length}`);

    const deploymentRequest: DeploymentRequest = {
      campaignId: payload.campaignId,
      adSetId: payload.adSetId,
      pageId: payload.pageId,
      landingUrl: payload.landingUrl,
      newVariants: payload.newVariants,
      retireCreativeIds: payload.retireCreativeIds,
    };

    const result = await deployNewCreatives(deploymentRequest);

    return NextResponse.json(
      {
        success: true,
        message: `Deployed ${result.deployed.length} new creatives, retired ${result.retired.length}`,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Deployment failed',
      },
      { status: 500 }
    );
  }
}
