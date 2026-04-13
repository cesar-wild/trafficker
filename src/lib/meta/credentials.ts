import { MetaCredentials } from '../types/meta';

export function getMetaCredentials(): MetaCredentials {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!accessToken || !adAccountId) {
    throw new Error('Missing required Meta API credentials: META_ACCESS_TOKEN and META_AD_ACCOUNT_ID must be set');
  }

  return { accessToken, adAccountId, appId: appId || '', appSecret: appSecret || '' };
}

export function getApiVersion(): string {
  return process.env.META_API_VERSION || 'v21.0';
}

export function buildAccountPath(adAccountId: string): string {
  const cleanId = adAccountId.replace(/^act_/, '');
  return `act_${cleanId}`;
}
