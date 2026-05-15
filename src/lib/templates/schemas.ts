export type PlaybookType = 'launch' | 'scale' | 'retarget';
export type CreativeType = 'copy' | 'visual' | 'video';
export type HookType = 'question' | 'statement' | 'social_proof' | 'urgency' | 'humor' | 'shock';
export type EmotionType = 'excitement' | 'curiosity' | 'urgency' | 'trust' | 'belonging' | 'fear';
export type CtaType = 'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'GET_QUOTE' | 'CONTACT_US' | 'DOWNLOAD' | 'BOOK_NOW';

export interface CampaignBrief {
  product: string;
  audience: string;
  angle: string;
  emotion: EmotionType;
  hook: HookType;
  playbook: PlaybookType;
  offer?: string;
  brand?: string;
}

export interface AdVariant {
  id: string;
  angle: string;
  emotion: EmotionType;
  hook: HookType;
  headline: string;
  primaryText: string;
  cta: CtaType;
  visualBrief: string;
  videoHook?: string;
  playbook: PlaybookType;
  qualityScore: number;
  characterCheck: { headline: boolean; primaryText: boolean; cta: boolean };
}

export interface CreativeTemplate {
  playbook: PlaybookType;
  structure: string[];
  angle: string;
  emotion: EmotionType;
  hook: HookType;
  headlineTemplate: string;
  primaryTextTemplate: string;
  cta: CtaType;
}

export const HEADLINE_MAX = 40;
export const PRIMARY_TEXT_MAX = 125;
export const VIDEO_HOOK_MAX = 150;