import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { t as translate, type UIKey } from './ui';
import { localize, localizeList, type LocalizedString } from './localize';

export const useTranslation = () => {
    const { language, setLanguage } = useContext(LanguageContext);

    return {
        language,
        setLanguage,
        t: (key: UIKey) => translate(key, language),
        localize: (value: LocalizedString | undefined | null) => localize(value, language),
        localizeList: (value: string[] | { en: string[]; fr: string[] } | undefined | null) => localizeList(value, language),
    };
};
