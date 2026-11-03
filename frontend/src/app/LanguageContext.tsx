import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLanguage } from '../types/auth';
import type { Translations } from '../i18n/translations';
import { translations } from '../i18n/translations';
import { farmerService } from '../services/farmerService';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage, syncBackend?: boolean) => void;
  syncWithProfile: (preferredLang?: string | null) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('mandimitra_lang') as SupportedLanguage;
    if (saved && (saved === 'mr-IN' || saved === 'hi-IN' || saved === 'en-IN')) {
      return saved;
    }
    return 'mr-IN'; // Default to Marathi for Maharashtra focus
  });

  const setLanguage = (lang: SupportedLanguage, syncBackend: boolean = true) => {
    setLanguageState(lang);
    localStorage.setItem('mandimitra_lang', lang);
    document.documentElement.lang = lang.split('-')[0];

    // If logged in and requested, sync preference to farmer profile in backend
    if (syncBackend && localStorage.getItem('mandimitra_token')) {
      farmerService.updateProfile({ preferred_language: lang }).catch(() => {});
    }
  };

  const syncWithProfile = (preferredLang?: string | null) => {
    if (!preferredLang) return;
    const valid = (preferredLang === 'mr-IN' || preferredLang === 'hi-IN' || preferredLang === 'en-IN') ? preferredLang : null;
    if (valid) {
      setLanguageState(valid as SupportedLanguage);
      localStorage.setItem('mandimitra_lang', valid);
      document.documentElement.lang = valid.split('-')[0];
    }
  };

  useEffect(() => {
    document.documentElement.lang = language.split('-')[0];
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, syncWithProfile, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
