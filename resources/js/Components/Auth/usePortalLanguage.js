import { useLayoutEffect, useState } from 'react';
import {
    portalMessages,
    readPortalLanguage,
    savePortalLanguage,
} from './portalLanguage';

/** Keep all entry/account screens on the language selected at the home page. */
export default function usePortalLanguage() {
    const [language, setLanguage] = useState(readPortalLanguage);

    useLayoutEffect(() => {
        const root = document.documentElement;
        const previousLanguage = root.getAttribute('lang');
        const previousDirection = root.getAttribute('dir');
        root.setAttribute('lang', language);
        root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        return () => {
            if (previousLanguage === null) root.removeAttribute('lang');
            else root.setAttribute('lang', previousLanguage);
            if (previousDirection === null) root.removeAttribute('dir');
            else root.setAttribute('dir', previousDirection);
        };
    }, [language]);

    const changeLanguage = (nextLanguage) => {
        setLanguage(nextLanguage);
        savePortalLanguage(nextLanguage);
    };

    return { language, messages: portalMessages[language], changeLanguage };
}
