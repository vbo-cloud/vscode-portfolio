import { createContext } from 'react';

export type Language = 'fr' | 'en';

export const LanguageContext = createContext({
    language: 'fr' as Language,
    setLanguage: (_lang: Language) => { }
});
