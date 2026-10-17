/** Available throughout the public entry flow, outside the signed-in panels. */
export default function LanguageSwitcher({ language, label, onChange }) {
    return (
        <div className="qb-language" role="group" aria-label={label} dir="ltr">
            {['ar', 'en'].map((locale) => (
                <button
                    key={locale}
                    type="button"
                    lang={locale}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    aria-pressed={language === locale}
                    onClick={() => onChange(locale)}
                >
                    {locale === 'ar' ? 'العربية' : 'English'}
                </button>
            ))}
        </div>
    );
}
