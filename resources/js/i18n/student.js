import en from './student-en.json';
import { readPortalLanguage } from '../Components/Auth/portalLanguage';

export const studentLanguage = () => readPortalLanguage();
export const studentDirection = () =>
    studentLanguage() === 'en' ? 'ltr' : 'rtl';
export const studentNumber = (value) =>
    new Intl.NumberFormat(
        studentLanguage() === 'en' ? 'en-US' : 'ar-SA',
    ).format(value);

/** Keep source content separate from interface labels and feedback. */
export function studentText(source, values = {}) {
    if (typeof source !== 'string') return source;
    let text = source;
    if (studentLanguage() === 'en') {
        const trimmed = source.trim();
        text =
            en[source] ??
            (en[trimmed] !== undefined
                ? source.slice(0, source.indexOf(trimmed)) +
                  en[trimmed] +
                  source.slice(source.indexOf(trimmed) + trimmed.length)
                : source);
    }
    return text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

const levelNames = [
    'الأول',
    'الثاني',
    'الثالث',
    'الرابع',
    'الخامس',
    'السادس',
    'السابع',
    'الثامن',
    'التاسع',
];
export const studentLevel = (level) =>
    studentLanguage() === 'en' ? String(level) : levelNames[level - 1] || level;
const optionLabels = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };
export const studentOption = (letter) =>
    studentLanguage() === 'en' ? letter : optionLabels[letter];

export function studentDate(value, dateStyle = 'medium') {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(
        studentLanguage() === 'en' ? 'en-GB' : 'ar-SA-u-ca-gregory-nu-latn',
        {
            dateStyle,
            timeStyle: 'short',
        },
    ).format(date);
}

// Server messages use the same interface dictionary; question/option text never passes here.
export const translateStudentFeedback = (message) => studentText(message);
