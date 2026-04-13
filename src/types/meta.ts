export interface CampaignConfig {
  name: string;
  objective: 'LINK_CLICKS' | 'CONVERSIONS' | 'REACH' | 'BRAND_AWARENESS' | 'VIDEO_VIEWS';
  status: 'PAUSED' | 'ACTIVE';
  dailyBudget: number;
  totalBudget?: number;
  bidStrategy?: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP' | 'TARGET_COST';
  attributionWindow?: number;
}

export interface AdSetConfig {
  name: string;
  campaignId: string;
  targeting: TargetingConfig;
  dailyBudget: number;
  optimizationGoal: 'OFFSITE_CONVERSIONS' | 'LINK_CLICKS' | 'REACH' | 'IMPRESSIONS';
  billingEvent: 'IMPRESSIONS' | 'LINK_CLICKS' | 'CONVERSIONS';
  status?: 'PAUSED' | 'ACTIVE';
  startTime?: string;
  endTime?: string;
}

export interface TargetingConfig {
  ageMin?: number;
  ageMax?: number;
  genders?: number[];
  geoLocations?: { countries: string[]; [key: string]: unknown };
  interests?: Array<{ id: number; name: string }>;
  behaviors?: Array<{ id: number; name: string }>;
  placements?: {
    facebookPositions?: string[];
    instagramPositions?: string[];
    audienceNetworkPositions?: string[];
  };
  flexibleSpec?: Array<{ interests?: Array<{ id: number; name: string }> }>;
}

export interface AdCreativeConfig {
  name: string;
  adSetId: string;
  creativeType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'COLLECTION';
  pageId: string;
  link: string;
  message?: string;
  headline?: string;
  description?: string;
  callToAction?: 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'DOWNLOAD' | 'GET_QUOTE' | 'CONTACT_US';
  imageUrl?: string;
  videoId?: string;
  carouselCards?: CarouselCard[];
  productSetId?: string;
}

export interface CarouselCard {
  imageUrl: string;
  link: string;
  title: string;
  description?: string;
}

export interface AutomatedRuleConfig {
  name: string;
  campaignId?: string;
  adSetId?: string;
  triggerType: 'cost_per_result' | 'frequency' | 'roas' | 'daily_spend' | 'impression';
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS';
  value: number;
  action: 'PAUSE' | 'INCREASE_BUDGET' | 'DECREASE_BUDGET' | 'NOTIFY';
  budgetAdjustmentPercent?: number;
  schedule?: 'DAILY' | 'HOURLY' | 'CONTINUOUS';
}

export interface CampaignResponse {
  id: string;
  name: string;
  status: string;
  effectiveStatus: string;
}

export interface AdSetResponse {
  id: string;
  name: string;
  campaignId: string;
  status: string;
}

export interface AdResponse {
  id: string;
  name: string;
  adsetId: string;
  status: string;
  creative: { id: string };
}

export interface PerformanceMetrics {
  campaignId: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  conversions: number;
  cpa: number;
  roas?: number;
  frequency: number;
  dateStart: string;
  dateStop: string;
}

export interface MetaCredentials {
  accessToken: string;
  adAccountId: string;
  appId: string;
  appSecret: string;
}
