import type { Language } from '../context/LanguageContext';

/** A field that may be translated ({en, fr}) or left as a single string (shown as-is in both languages until translated). */
export type LocalizedString = string | { en: string; fr: string };

export const localize = (value: LocalizedString | undefined | null, lang: Language): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] ?? value.en ?? '';
};

/** Same as localize, but for optional string arrays (e.g. highlights). */
export const localizeList = (value: string[] | { en: string[]; fr: string[] } | undefined | null, lang: Language): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value[lang] ?? value.en ?? [];
};
