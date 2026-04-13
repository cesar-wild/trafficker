import { AdCreativeConfig, AdResponse } from '../../types/meta';
import { initMetaApi, FacebookAdsApi } from './client';
import { buildAccountPath } from './credentials';

export async function createAdCreative(config: AdCreativeConfig): Promise<{ id: string }> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  let creativeSpec: Record<string, unknown>;

  switch (config.creativeType) {
    case 'CAROUSEL':
      creativeSpec = {
        [FacebookAdsApi.AdCreativeFields.creative_type]: 'CAROUSEL',
        [FacebookAdsApi.AdCreativeFields.card_links]: config.carouselCards?.map((card) => ({
          link: card.link,
          image_hash: card.imageUrl,
          name: card.title,
          description: card.description,
        })),
      };
      break;
    case 'COLLECTION':
      creativeSpec = {
        [FacebookAdsApi.AdCreativeFields.creative_type]: 'COLLECTION',
        [FacebookAdsApi.AdCreativeFields.product_set_id]: config.productSetId,
      };
      break;
    default:
      creativeSpec = {
        [FacebookAdsApi.AdCreativeFields.creative_type]: 'IMAGE',
        [FacebookAdsApi.AdCreativeFields.image_url]: config.imageUrl,
      };
  }

  const objectStorySpec = {
    [FacebookAdsApi.ObjectStorySpecFields.page_id]: config.pageId,
    [FacebookAdsApi.ObjectStorySpecFields.link_data]: {
      link: config.link,
      message: config.message,
      caption: config.headline,
      description: config.description,
      call_to_action: config.callToAction
        ? { type: config.callToAction, value: { page_id: config.pageId } }
        : undefined,
      image_hash: config.imageUrl,
    },
  };

  const params = {
    [FacebookAdsApi.AdCreativeFields.name]: config.name,
    [FacebookAdsApi.AdCreativeFields.object_story_spec]: objectStorySpec,
  };

  const creative = await account.createAdCreative([], params);

  return { id: creative.id };
}

export async function createAd(creativeConfig: AdCreativeConfig, creativeId: string): Promise<AdResponse> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const params = {
    name: creativeConfig.name,
    adset_id: creativeConfig.adSetId,
    status: 'PAUSED',
    [FacebookAdsApi.Ad.Fields.creative]: { creative_id: creativeId },
  };

  const ad = await account.createAd([], params);

  return {
    id: ad.id,
    name: creativeConfig.name,
    adsetId: creativeConfig.adSetId,
    status: 'PAUSED',
    creative: { id: creativeId },
  };
}

export async function activateAd(adId: string): Promise<void> {
  const api = initMetaApi();
  const ad = new (FacebookAdsApi as any).Ad(adId);
  await ad.api_update([{ status: 'ACTIVE' }]);
}

export async function pauseAd(adId: string): Promise<void> {
  const api = initMetaApi();
  const ad = new (FacebookAdsApi as any).Ad(adId);
  await ad.api_update([{ status: 'PAUSED' }]);
}

export async function deleteAd(adId: string): Promise<void> {
  const api = initMetaApi();
  const ad = new (FacebookAdsApi as any).Ad(adId);
  await ad.api_update([{ status: 'DELETED' }]);
}

export async function listAds(adSetId?: string): Promise<AdResponse[]> {
  const api = initMetaApi();
  const accountId = buildAccountPath(process.env.META_AD_ACCOUNT_ID!);
  const account = new (FacebookAdsApi as any).AdAccount(accountId);

  const params: Record<string, unknown> = { limit: 100 };
  if (adSetId) {
    params.filtering = [{ field: 'ad.adset_id', operator: 'EQUALS', value: adSetId }];
  }

  const ads = await account.getAds(
    ['id', 'name', 'adset_id', 'status', 'creative'],
    params
  );

  return ads.map((a: any) => ({
    id: a.id,
    name: a.name,
    adsetId: a.adset_id,
    status: a.status,
    creative: a.creative,
  }));
}
