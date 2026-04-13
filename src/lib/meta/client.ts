import FacebookAdsApi from 'facebook-nodejs-business-sdk';
import { getMetaCredentials, getApiVersion } from './credentials';

let apiInstance: FacebookAdsApi | null = null;

export function initMetaApi(): FacebookAdsApi {
  if (apiInstance) return apiInstance;

  const creds = getMetaCredentials();
  FacebookAdsApi.init(creds.accessToken);
  apiInstance = FacebookAdsApi;
  return apiInstance;
}

export function getMetaApi(): FacebookAdsApi {
  if (!apiInstance) {
    return initMetaApi();
  }
  return apiInstance;
}

export { FacebookAdsApi };
