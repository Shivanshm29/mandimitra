import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';

describe('i18n Translations Dictionary', () => {
  it('contains Marathi, Hindi, and English locales', () => {
    expect(translations['mr-IN']).toBeDefined();
    expect(translations['hi-IN']).toBeDefined();
    expect(translations['en-IN']).toBeDefined();
  });

  it('provides all mandatory navigation keys in each language', () => {
    const locales = ['mr-IN', 'hi-IN', 'en-IN'] as const;
    for (const loc of locales) {
      const t = translations[loc];
      expect(t.appName).toBeTruthy();
      expect(t.nav.dashboard).toBeTruthy();
      expect(t.nav.mandiIntelligence).toBeTruthy();
      expect(t.nav.sellingRecommendations).toBeTruthy();
      expect(t.nav.transactions).toBeTruthy();
      expect(t.nav.payments).toBeTruthy();
      expect(t.nav.profitCoach).toBeTruthy();
      expect(t.nav.sarvamAssistant).toBeTruthy();
      expect(t.nav.profile).toBeTruthy();
    }
  });
});

