import { useState } from 'react';
import { adminText as t, translateAdminFeedback as feedback } from '../i18n/admin';
import AdminIcon from './AdminIcon';

export default function InstructorSubjects({ user, subjects, form, busy, onSave, onClose }) {
    const [search, setSearch] = useState('');
    const visible = subjects.filter((subject) => subject.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
    return (
        <form className="w-full" onSubmit={onSave} aria-label={t('مقررات {0}', { 0: user.name })}>
            <div className="admin-account-confirm-text">
                <AdminIcon name="book" />
                <div>
                    <strong>{t('مقررات {0}', { 0: user.name })}</strong>
                    <p>{t('حدد المقررات المسندة للمدرس. إلغاء الإسناد يحفظ الأسئلة والنتائج.')}</p>
                </div>
            </div>
            <div className="admin-subject-field mt-4">
                <label htmlFor={`subjects-search-${user.id}`}>{t('البحث عن مقرر')}</label>
                <input id={`subjects-search-${user.id}`} className="admin-subject-input" value={search}
                    onChange={(event) => setSearch(event.target.value)} disabled={busy} maxLength={255} />
            </div>
            <fieldset className="my-4 max-h-72 space-y-2 overflow-y-auto" disabled={busy}>
                <legend className="sr-only">{t('المقررات المتاحة للإسناد')}</legend>
                {visible.map((subject) => {
                    const unavailable = subject.instructor_id !== null && subject.instructor_id !== user.id;
                    return (
                        <label key={subject.id} className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 ${unavailable ? 'opacity-60' : 'cursor-pointer'}`}>
                            <input type="checkbox" className="size-4 shrink-0" disabled={busy || unavailable}
                                checked={form.data.subject_ids.includes(subject.id)}
                                onChange={(event) => form.setData('subject_ids', event.target.checked
                                    ? [...form.data.subject_ids, subject.id]
                                    : form.data.subject_ids.filter((id) => id !== subject.id))} />
                            <span className="min-w-0">
                                <bdi className="font-semibold">{subject.name}</bdi>
                                <span className="block text-sm text-slate-500">
                                    {t('المستوى {0}', { 0: subject.level })}
                                    {unavailable && <> · {t('مسند إلى: {0}', { 0: subject.instructor_name })}</>}
                                </span>
                            </span>
                        </label>
                    );
                })}
                {!visible.length && <p>{t(subjects.length ? 'لا توجد مقررات مطابقة' : 'لا توجد مقررات حاليًا')}</p>}
            </fieldset>
            {Object.values(form.errors).map((error, index) => <p key={index} className="admin-field-error" role="alert">{feedback(error)}</p>)}
            <div className="admin-account-inline-actions">
                <button type="submit" className="admin-button admin-button-primary" disabled={busy}>
                    <AdminIcon name="tick" />{t(form.processing ? 'جارٍ الحفظ…' : 'حفظ المقررات')}
                </button>
                <button type="button" className="admin-button admin-account-cancel" disabled={busy} onClick={onClose} data-account-cancel>{t('إلغاء')}</button>
            </div>
        </form>
    );
}
