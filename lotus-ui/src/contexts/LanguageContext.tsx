import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en, TranslationKeys } from '../locales/en';
import { vi } from '../locales/vi';

export type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  availableLanguages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationKeys> = {
  en,
  vi,
};

const availableLanguages = [
  { code: 'en' as Language, name: 'English', nativeName: 'English' },
  { code: 'vi' as Language, name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en',
}) => {
  // Try to get language from localStorage or use default
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('lotus-bridge-language') as Language;
      if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
        return savedLanguage;
      }
      
      // Try to detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      if (Object.keys(translations).includes(browserLanguage)) {
        return browserLanguage as Language;
      }
    }
    return defaultLanguage;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lotus-bridge-language', newLanguage);
    }
  }, []);

  // Translation function with support for nested keys and variable interpolation
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation key "${key}" not found in ${language} or English fallback`);
            return key; // Return the key itself if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" does not resolve to a string`);
      return key;
    }

    // Replace variables in the string
    if (variables) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
        const replacement = variables[variableName];
        return replacement !== undefined ? String(replacement) : match;
      });
    }

    return value;
  }, [language]);

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook for quick translation access
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};
