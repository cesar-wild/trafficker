import { mapVariantToCreativeConfig } from '../deployment';
import { AdVariant } from '@/lib/templates/schemas';

describe('Deployment', () => {
  const mockVariant: AdVariant = {
    id: 'variant_001',
    angle: 'affordability',
    emotion: 'excitement',
    hook: 'social_proof',
    headline: 'Save 50% on Premium Plans',
    primaryText: 'Join thousands of happy customers',
    cta: 'SHOP_NOW',
    visualBrief: 'Bright, colorful visuals showing savings',
    videoHook: 'Discover how to save big',
    playbook: 'scale',
    qualityScore: 92,
    characterCheck: {
      headline: true,
      primaryText: true,
      cta: true,
    },
  };

  describe('mapVariantToCreativeConfig', () => {
    it('should map AdVariant to AdCreativeConfig correctly', () => {
      const config = mapVariantToCreativeConfig(
        mockVariant,
        'adset_123',
        'page_456',
        'https://example.com/offer'
      );

      expect(config.name).toBe('affordability - social_proof');
      expect(config.adSetId).toBe('adset_123');
      expect(config.pageId).toBe('page_456');
      expect(config.link).toBe('https://example.com/offer');
      expect(config.headline).toBe('Save 50% on Premium Plans');
      expect(config.message).toBe('Join thousands of happy customers');
      expect(config.callToAction).toBe('SHOP_NOW');
      expect(config.creativeType).toBe('IMAGE');
    });

    it('should include visual brief as description', () => {
      const config = mapVariantToCreativeConfig(
        mockVariant,
        'adset_123',
        'page_456',
        'https://example.com/offer'
      );

      expect(config.description).toBe('Bright, colorful visuals showing savings');
    });
  });
});
