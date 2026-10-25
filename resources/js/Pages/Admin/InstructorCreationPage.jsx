import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../../i18n/admin';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminIcon from '../../Components/AdminIcon';
import FlashMessages from '../../Components/FlashMessages';
import AccountList, {
    AccountMetrics,
} from '../../Components/AdminAccountManagement';
function CreationField({
    form,
    field,
    label,
    placeholder,
    secret = false,
    type = 'text',
    inputRef,
    disabled,
}) {
    const [visible, setVisible] = useState(false);
    const id = `instructor-${field}`;
    const descriptions = [
        form.errors[field] && `${id}-error`,
        field === 'instructor_creation_code' && `${id}-help`,
    ]
        .filter(Boolean)
        .join(' ');
    return (
        <div className="admin-subject-field">
            <label htmlFor={id}>{label}</label>
            <div className={secret ? 'admin-account-secret' : undefined}>
                <input
                    id={id}
                    ref={inputRef}
                    className="admin-subject-input"
                    required
                    type={secret ? (visible ? 'text' : 'password') : type}
                    dir={field === 'name' ? 'auto' : 'ltr'}
                    maxLength={field.startsWith('password') ? undefined : 255}
                    minLength={field.startsWith('password') ? 8 : undefined}
                    autoComplete={
                        field.startsWith('password')
                            ? 'new-password'
                            : field === 'instructor_creation_code'
                              ? 'off'
                              : field === 'email'
                                ? 'email'
                                : 'name'
                    }
                    value={form.data[field]}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={!!form.errors[field]}
                    aria-describedby={descriptions || undefined}
                    onChange={(e) => form.setData(field, e.target.value)}
                />
                {secret && (
                    <button
                        type="button"
                        disabled={disabled}
                        className="admin-account-secret-toggle"
                        aria-label={`${visible ? t('إخفاء') : t('إظهار')} ${label}`}
                        aria-pressed={visible}
                        onClick={() => setVisible((value) => !value)}
                    >
                        <AdminIcon name={visible ? 'eye-off' : 'eye'} />
                    </button>
                )}
            </div>
            {field === 'instructor_creation_code' && (
                <p id={`${id}-help`} className="admin-account-field-help">
                    {t('يتطلب إنشاء الحساب رمز التفويض الخاص بالمؤسس.')}
                </p>
            )}
            {form.errors[field] && (
                <p
                    id={`${id}-error`}
                    className="admin-field-error"
                    role="alert"
                >
                    {feedback(form.errors[field])}
                </p>
            )}
        </div>
    );
}
export default function InstructorCreationPage({
    instructors,
    stats,
    filters,
    subjects = [],
}) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        instructor_creation_code: '',
    });
    const [listBusy, setListBusy] = useState(false);
    const nameRef = useRef(null);
    const busy = form.processing || listBusy;
    const reset = () => {
        form.reset();
        form.clearErrors();
        nameRef.current?.focus();
    };
    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.instructors.store'), {
            preserveScroll: true,
            errorBag: 'createInstructor',
            onSuccess: reset,
            onFinish: () =>
                form.reset(
                    'password',
                    'password_confirmation',
                    'instructor_creation_code',
                ),
        });
    };
    return (
        <AdminLayout activeNav="instructors" breadcrumb={t('إدارة المدرّسين')}>
            <Head title={t('إدارة المدرّسين')} />
            <div className="admin-page-heading">
                <div>
                    <h1>{t('إدارة المدرّسين')}</h1>
                    <p>
                        {t('أضف حسابات المدرّسين وتابع إدارتها من مكان واحد.')}
                    </p>
                </div>
            </div>
            <FlashMessages translate={feedback} />
            <AccountMetrics stats={stats} />
            <section
                className="admin-panel admin-instructor-create"
                aria-labelledby="instructor-create-title"
            >
                <div className="admin-account-create-heading">
                    <h2 id="instructor-create-title">
                        {t('إضافة مدرّس جديد')}
                    </h2>
                    <span className="admin-founder-badge">
                        <AdminIcon name="shield" />
                        {t('للمؤسس فقط')}
                    </span>
                </div>
                <form
                    className="admin-instructor-create-form"
                    onSubmit={submit}
                >
                    <CreationField
                        form={form}
                        field="name"
                        label={t('الاسم الكامل')}
                        placeholder={t('اسم المدرّس')}
                        inputRef={nameRef}
                        disabled={busy}
                    />
                    <CreationField
                        form={form}
                        field="email"
                        label={t('البريد الإلكتروني')}
                        placeholder="name@example.com"
                        type="email"
                        disabled={busy}
                    />
                    <CreationField
                        form={form}
                        field="instructor_creation_code"
                        label={t('رمز التفويض')}
                        placeholder={t('رمز إنشاء المدرّس')}
                        secret
                        disabled={busy}
                    />
                    <CreationField
                        form={form}
                        field="password"
                        label={t('كلمة المرور')}
                        placeholder={t('8 أحرف على الأقل')}
                        secret
                        disabled={busy}
                    />
                    <CreationField
                        form={form}
                        field="password_confirmation"
                        label={t('تأكيد كلمة المرور')}
                        placeholder={t('أعد إدخال كلمة المرور')}
                        secret
                        disabled={busy}
                    />
                    <div className="admin-instructor-create-actions">
                        <button
                            className="admin-button admin-button-primary"
                            type="submit"
                            disabled={busy}
                        >
                            <AdminIcon name="user-plus" />
                            {form.processing
                                ? t('جارٍ الإنشاء…')
                                : t('إنشاء الحساب')}
                        </button>
                        <button
                            className="admin-button admin-account-cancel"
                            type="button"
                            disabled={busy}
                            onClick={reset}
                        >
                            {t('مسح الحقول')}
                        </button>
                    </div>
                </form>
            </section>
            <AccountList
                accounts={instructors}
                subjects={subjects}
                filters={filters}
                disabled={form.processing}
                onBusy={setListBusy}
            />
        </AdminLayout>
    );
}
