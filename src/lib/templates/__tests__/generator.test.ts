import { describe, it, expect } from 'vitest';
import { generateVariants, scoreVariant, buildTemplate } from '../generator';
import type { CampaignBrief } from '../schemas';

const baseBrief: CampaignBrief = {
  product: 'Acme Pro',
  audience: 'small businesses',
  angle: 'save time and money',
  emotion: 'excitement',
  hook: 'statement',
  playbook: 'launch',
  offer: '20% off for new customers',
};

describe('generator', () => {
  describe('generateVariants', () => {
    it('generates the requested number of variants', () => {
      const variants = generateVariants(baseBrief, 3);
      expect(variants).toHaveLength(3);
    });

    it('each variant has a unique id', () => {
      const variants = generateVariants(baseBrief, 4);
      const ids = variants.map((v) => v.id);
      expect(new Set(ids).size).toBe(4);
    });

    it('headline does not exceed 40 chars', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        expect(v.headline.length).toBeLessThanOrEqual(40);
      });
    });

    it('primaryText does not exceed 125 chars', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        expect(v.primaryText.length).toBeLessThanOrEqual(125);
      });
    });

    it('videoHook does not exceed 150 chars', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        if (v.videoHook) {
          expect(v.videoHook.length).toBeLessThanOrEqual(150);
        }
      });
    });

    it('characterCheck is set correctly', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        expect(v.characterCheck.headline).toBe(true);
        expect(v.characterCheck.primaryText).toBe(true);
        expect(v.characterCheck.cta).toBe(true);
      });
    });

    it('qualityScore is between 0 and 100', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        expect(v.qualityScore).toBeGreaterThanOrEqual(0);
        expect(v.qualityScore).toBeLessThanOrEqual(100);
      });
    });

    it('all variants share the same angle and playbook', () => {
      const variants = generateVariants(baseBrief, 4);
      variants.forEach((v) => {
        expect(v.angle).toBe(baseBrief.angle);
        expect(v.playbook).toBe(baseBrief.playbook);
      });
    });

    it('supports retarget playbook', () => {
      const retargetBrief = { ...baseBrief, playbook: 'retarget' as const };
      const variants = generateVariants(retargetBrief, 2);
      expect(variants).toHaveLength(2);
      variants.forEach((v) => {
        expect(v.playbook).toBe('retarget');
        expect(v.cta).toBe('GET_QUOTE');
      });
    });

    it('supports scale playbook', () => {
      const scaleBrief = { ...baseBrief, playbook: 'scale' as const };
      const variants = generateVariants(scaleBrief, 2);
      expect(variants).toHaveLength(2);
      variants.forEach((v) => {
        expect(v.playbook).toBe('scale');
        expect(v.cta).toBe('SHOP_NOW');
      });
    });
  });

  describe('scoreVariant', () => {
    it('returns 50 for empty inputs', () => {
      expect(scoreVariant('', '', 'LEARN_MORE')).toBe(50);
    });

    it('awards points for headline within limit', () => {
      const score = scoreVariant('Short headline', 'Some text', 'LEARN_MORE');
      expect(score).toBeGreaterThan(50);
    });

    it('caps score at 100', () => {
      const score = scoreVariant('123! Amazing headline X', 'A'.repeat(100), 'LEARN_MORE');
      expect(score).toBeLessThanOrEqual(100);
    });

    it('rewards numbers in headline', () => {
      const withNumber = scoreVariant('Save 20% today', 'Text here', 'LEARN_MORE');
      const withoutNumber = scoreVariant('Save percent today', 'Text here', 'LEARN_MORE');
      expect(withNumber).toBeGreaterThan(withoutNumber);
    });
  });

  describe('buildTemplate', () => {
    it('returns correct structure for launch playbook', () => {
      const template = buildTemplate(baseBrief);
      expect(template.playbook).toBe('launch');
      expect(template.structure).toEqual(['problem', 'solution', 'social_proof', 'cta']);
    });

    it('returns correct structure for retarget playbook', () => {
      const retarget = { ...baseBrief, playbook: 'retarget' as const };
      const template = buildTemplate(retarget);
      expect(template.structure).toEqual(['reminder', 'discount', 'social_proof', 'scarcity', 'cta']);
    });
  });
});