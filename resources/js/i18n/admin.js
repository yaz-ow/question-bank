import en from './admin-en.json';
import { readPortalLanguage } from '../Components/Auth/portalLanguage';

export const adminLanguage = () => readPortalLanguage();
export const adminDirection = () => (adminLanguage() === 'en' ? 'ltr' : 'rtl');

const interpolate = (text, values) =>
    text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

/** Arabic source keys keep the existing UI intact; only interface copy is translated. */
export function adminText(source, values = {}) {
    if (typeof source !== 'string') return source;
    let text = source;
    if (adminLanguage() === 'en') {
        const trimmed = source.trim();
        text =
            en[source] ??
            (en[trimmed] !== undefined
                ? source.slice(0, source.indexOf(trimmed)) +
                  en[trimmed] +
                  source.slice(source.indexOf(trimmed) + trimmed.length)
                : source);
    }
    return interpolate(text, values);
}

const importResult = /^تم استيراد (\d+) سؤال بنجاح وتخطي (\d+) سؤال مكرر\.$/;

/** Apply only to server feedback, never to teacher-entered course/question content. */
export function translateAdminFeedback(message) {
    if (typeof message !== 'string' || adminLanguage() !== 'en') return message;
    const result = message.match(importResult);
    if (result)
        return `Imported ${result[1]} questions successfully; skipped ${result[2]} duplicates.`;
    const translated = adminText(message);
    if (translated !== message) return translated;
    return message.replace(
        /نص السؤال|الخيار أ|الخيار ب|الخيار ج|الخيار د|الإجابة الصحيحة/g,
        (value) =>
            ({
                'الخيار أ': 'option A',
                'الخيار ب': 'option B',
                'الخيار ج': 'option C',
                'الخيار د': 'option D',
            })[value] ?? adminText(value),
    );
}
