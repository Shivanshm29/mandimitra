import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';

describe('Global Translation Completeness', () => {
  const languages = ['mr-IN', 'hi-IN', 'en-IN'] as const;

  function getAllLeafPaths(obj: Record<string, any>, prefix = ''): string[] {
    let paths: string[] = [];
    for (const key of Object.keys(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths = paths.concat(getAllLeafPaths(obj[key], currentPath));
      } else {
        paths.push(currentPath);
      }
    }
    return paths;
  }

  function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  const enPaths = getAllLeafPaths(translations['en-IN']);

  it('should have all languages defined', () => {
    expect(translations['mr-IN']).toBeDefined();
    expect(translations['hi-IN']).toBeDefined();
    expect(translations['en-IN']).toBeDefined();
  });

  languages.forEach((lang) => {
    it(`should have all keys populated and non-empty for ${lang}`, () => {
      const targetObj = translations[lang];
      for (const path of enPaths) {
        const value = getNestedValue(targetObj, path);
        expect(value, `Missing or empty translation at "${path}" for language ${lang}`).toBeDefined();
        expect(typeof value).toBe('string');
        expect(value.trim().length, `Empty string at "${path}" for language ${lang}`).toBeGreaterThan(0);
      }
    });
  });
});

