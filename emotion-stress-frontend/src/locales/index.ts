import { useStressStore } from '@/store/useStressStore';
import { en, LocaleDictionary } from './en';
import { si } from './si';
import { ta } from './ta';
import { Language } from '@/types';

export const dictionaries: Record<Language, LocaleDictionary> = {
  en,
  si,
  ta,
};

/**
 * Returns the dictionary object for a specific language
 */
export function getDictionary(lang: Language): LocaleDictionary {
  return dictionaries[lang] || en;
}

/**
 * React hook that returns the active dictionary and language state from Zustand
 */
export function useTranslation() {
  const language = useStressStore((state) => state.language);
  const toggleLanguage = useStressStore((state) => state.toggleLanguage);
  const setLanguage = useStressStore((state) => state.setLanguage);

  const t = dictionaries[language] || en;

  return {
    t,
    language,
    toggleLanguage,
    setLanguage,
    isEnglish: language === 'en',
    isSinhala: language === 'si',
    isTamil: language === 'ta',
  };
}

export * from './en';
