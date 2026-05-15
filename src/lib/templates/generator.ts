import {
  AdVariant,
  CampaignBrief,
  CreativeTemplate,
  PlaybookType,
  HookType,
  EmotionType,
  CtaType,
  HEADLINE_MAX,
  PRIMARY_TEXT_MAX,
  VIDEO_HOOK_MAX,
} from './schemas';

const PLAYBOOK_STRUCTURES: Record<PlaybookType, string[]> = {
  launch: ['problem', 'solution', 'social_proof', 'cta'],
  scale: ['testimonial', 'benefit', 'urgency', 'cta'],
  retarget: ['reminder', 'discount', 'social_proof', 'scarcity', 'cta'],
};

const CTA_BY_PLAYBOOK: Record<PlaybookType, CtaType> = {
  launch: 'LEARN_MORE',
  scale: 'SHOP_NOW',
  retarget: 'GET_QUOTE',
};

function generateId(): string {
  return `variant_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function substitute(template: string, brief: CampaignBrief): string {
  return template
    .replace(/\{\{product\}\}/g, brief.product)
    .replace(/\{\{audience\}\}/g, brief.audience)
    .replace(/\{\{angle\}\}/g, brief.angle)
    .replace(/\{\{offer\}\}/g, brief.offer || '')
    .replace(/\{\{brand\}\}/g, brief.brand || '');
}

function buildHeadline(brief: CampaignBrief, template: string): string {
  return substitute(template, brief).trim();
}

function buildPrimaryText(brief: CampaignBrief, steps: string[]): string {
  const segments = steps.filter((s) => s !== 'cta').map((step) => {
    switch (step) {
      case 'problem':
        return `Discover how ${brief.product} solves your biggest ${brief.audience} challenges.`;
      case 'solution':
        return `With ${brief.product}, you get ${brief.angle} — designed for ${brief.audience}.`;
      case 'testimonial':
        return `Join thousands of ${brief.audience} who trust ${brief.product}.`;
      case 'benefit':
        return `${brief.emotion === 'excitement' ? 'Feel the difference' : 'Experience the value'} of ${brief.angle}.`;
      case 'urgency':
        return `Limited time: ${brief.offer || 'Exclusive offer'} for ${brief.audience}.`;
      case 'reminder':
        return `Still thinking about ${brief.product}? Here's a reminder why ${brief.audience} love it.`;
      case 'discount':
        return `${brief.offer || 'Special discount'} — available now for ${brief.audience}.`;
      case 'social_proof':
        return `${Math.floor(Math.random() * 500 + 100)} ${brief.audience} already joined this week.`;
      case 'scarcity':
        return `Only a few spots left. Don't miss out on ${brief.product}.`;
      default:
        return '';
    }
  });
  return segments.join(' ').trim();
}

function buildVisualBrief(brief: CampaignBrief): string {
  const emotionMap: Record<EmotionType, string> = {
    excitement: 'Bright, energetic visuals with dynamic composition',
    curiosity: 'Intriguing imagery that sparks curiosity and questions',
    urgency: 'Bold, high-contrast visuals with countdown or time elements',
    trust: 'Clean, professional imagery with warm tones',
    belonging: 'Community-focused visuals with diverse, happy people',
    fear: 'Impactful imagery highlighting the problem before solution',
  };
  return `${emotionMap[brief.emotion]}. Product: ${brief.product}. Audience: ${brief.audience}. Angle: ${brief.angle}. CTA should be visible and prominent.`;
}

function buildVideoHook(brief: CampaignBrief, hook: HookType): string {
  const hookTemplates: Record<HookType, string> = {
    question: `What if ${brief.product} could transform your ${brief.audience} experience?`,
    statement: `This is ${brief.product} — built for ${brief.audience}.`,
    social_proof: `${Math.floor(Math.random() * 300 + 50)} people just switched to ${brief.product}.`,
    urgency: `Ending soon: ${brief.offer || 'This exclusive deal'} for ${brief.audience}.`,
    humor: `Plot twist: ${brief.product} is exactly what ${brief.audience} needed.`,
    shock: `Most ${brief.audience} don't know this about ${brief.product} — until now.`,
  };
  const hookText = hookTemplates[hook];
  if (hookText.length > VIDEO_HOOK_MAX) {
    return hookText.substring(0, VIDEO_HOOK_MAX - 3) + '...';
  }
  return hookText;
}

export function buildTemplate(brief: CampaignBrief): CreativeTemplate {
  return {
    playbook: brief.playbook,
    structure: PLAYBOOK_STRUCTURES[brief.playbook],
    angle: brief.angle,
    emotion: brief.emotion,
    hook: brief.hook,
    headlineTemplate: `{{product}}: {{angle}} for {{audience}}`,
    primaryTextTemplate: PLAYBOOK_STRUCTURES[brief.playbook].join('|'),
    cta: CTA_BY_PLAYBOOK[brief.playbook],
  };
}

export function generateVariant(brief: CampaignBrief, index: number): AdVariant {
  const template = buildTemplate(brief);
  const steps = PLAYBOOK_STRUCTURES[brief.playbook];

  const anglePrefixes = ['', `For ${brief.audience}: `, `${brief.emotion === 'excitement' ? 'Exclusive' : 'Special'} `];
  const anglePrefix = anglePrefixes[index % anglePrefixes.length];
  const headline = buildHeadline(brief, anglePrefix + template.headlineTemplate);

  const primaryText = buildPrimaryText(brief, steps);
  const videoHook = buildVideoHook(brief, brief.hook);
  const visualBrief = buildVisualBrief(brief);

  const qualityScore = scoreVariant(headline, primaryText, template.cta);
  const characterCheck = {
    headline: headline.length <= HEADLINE_MAX,
    primaryText: primaryText.length <= PRIMARY_TEXT_MAX,
    cta: true,
  };

  return {
    id: generateId(),
    angle: brief.angle,
    emotion: brief.emotion,
    hook: brief.hook,
    headline,
    primaryText,
    cta: template.cta,
    visualBrief,
    videoHook,
    playbook: brief.playbook,
    qualityScore,
    characterCheck,
  };
}

export function generateVariants(brief: CampaignBrief, count = 4): AdVariant[] {
  return Array.from({ length: count }, (_, i) => generateVariant(brief, i));
}

export function scoreVariant(
  headline: string,
  primaryText: string,
  cta: string
): number {
  let score = 50;

  if (headline.length <= HEADLINE_MAX) score += 15;
  if (primaryText.length <= PRIMARY_TEXT_MAX) score += 15;
  if (headline.length >= 10) score += 10;
  if (/\d+/.test(headline)) score += 5;
  if (/[!?]/.test(headline)) score += 5;

  return Math.min(100, score);
}