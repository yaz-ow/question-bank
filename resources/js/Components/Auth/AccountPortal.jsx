import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FlashMessages from '../FlashMessages';
import { PortalIcon } from './LoginPortal';
import portalArt from '../../../images/auth-portals.webp';
import '../../../css/account-portals.css';

const EMPTY_ERRORS = {};

function AccountField({
    name,
    label,
    form,
    type = 'text',
    hint,
    wide = false,
    ...props
}) {
    const [visible, setVisible] = useState(false);
    const password = type === 'password';
    const error = form.errors[name];
    useEffect(() => {
        if (!form.data[name]) setVisible(false);
    }, [form.data[name]]);

    return (
        <div
            className={`qb-account-field${name === 'name' || wide ? ' qb-field-wide' : ''}`}
        >
            <label className="qb-field" htmlFor={name}>
                {label}
                <span className="qb-input-wrap">
                    <input
                        {...props}
                        id={name}
                        name={name}
                        type={password && visible ? 'text' : type}
                        data-password={password || undefined}
                        value={form.data[name]}
                        onChange={(event) =>
                            form.setData(name, event.target.value)
                        }
                        required
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error
                                ? `${name}-error`
                                : hint
                                  ? `${name}-hint`
                                  : undefined
                        }
                    />
                    {password && (
                        <button
                            type="button"
                            className="qb-eye"
                            onClick={() => setVisible(!visible)}
                            aria-label={`${visible ? 'إخفاء' : 'إظهار'} ${label}`}
                            aria-pressed={visible}
                        >
                            <PortalIcon name={visible ? 'eye-off' : 'eye'} />
                        </button>
                    )}
                </span>
            </label>
            {error ? (
                <span id={`${name}-error`} className="qb-error" role="alert">
                    {error}
                </span>
            ) : (
                hint && (
                    <span id={`${name}-hint`} className="qb-field-hint">
                        {hint}
                    </span>
                )
            )}
        </div>
    );
}

export default function AccountPortal({
    mode,
    role = 'student',
    token = '',
    email = '',
}) {
    const student = role === 'student';
    const registering = mode === 'register';
    const recovering = mode === 'recovery';
    const { errors: pageErrors = EMPTY_ERRORS } = usePage().props;
    const panel = useRef(null);
    const [height, setHeight] = useState(500);
    const form = useForm({
        ...(registering ? { name: '' } : {}),
        ...(student ? { university_id: '' } : {}),
        email,
        ...(!recovering ? { password: '', password_confirmation: '' } : {}),
        ...(mode === 'reset' ? { token } : {}),
    });
    const { setError } = form;
    useEffect(() => setError(pageErrors), [pageErrors, setError]);
    useLayoutEffect(() => {
        const measure = () =>
            setHeight(
                Math.max(
                    500,
                    Math.ceil(panel.current.getBoundingClientRect().height),
                ),
            );
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(panel.current);
        return () => observer.disconnect();
    }, []);

    const loginRoute = student ? 'login-student.show' : 'login-admin.show';
    const requestRoute = student
        ? 'password-request-student.show'
        : 'password-request-admin.show';
    const title = registering
        ? 'إنشاء حساب طالب'
        : recovering
          ? 'نسيت كلمة المرور؟'
          : 'تعيين كلمة مرور جديدة';
    const subtitle = registering
        ? 'ابدأ رحلتك التعليمية بحسابك في بنك الأسئلة.'
        : recovering
          ? student
              ? 'أدخل رقمك الجامعي والبريد المرتبط بحسابك لإرسال رابط الاستعادة.'
              : 'أدخل البريد المرتبط بحساب الإدارة لإرسال رابط الاستعادة.'
          : 'اختر كلمة مرور جديدة، ثم أكّدها للعودة إلى حسابك.';
    const submit = (event) => {
        event.preventDefault();
        if (form.processing) return;
        const endpoint = registering
            ? 'register'
            : recovering
              ? student
                  ? 'password-request-store'
                  : 'password-request-admin'
              : student
                ? 'password-reset.student.store'
                : 'password-reset.admin.store';
        form.post(route(endpoint), {
            preserveScroll: true,
            onError: () =>
                requestAnimationFrame(() =>
                    panel.current
                        ?.querySelector('[aria-invalid="true"]')
                        ?.focus(),
                ),
            onFinish: () => {
                if (!recovering)
                    form.reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <div
            className="auth-entry qb-account"
            dir="rtl"
            style={{
                '--qb-art': `url("${portalArt}")`,
                '--qb-account-height': `${height}px`,
            }}
        >
            <Head title={title} />
            <header className="qb-top">
                <Link className="qb-brand" href="/">
                    <PortalIcon name="book" />
                    <span>بنك الأسئلة</span>
                </Link>
                <span className="qb-tag">QUESTION BANK</span>
            </header>
            <main className="auth-main">
                <div className="qb-intro">
                    <h1>
                        {registering
                            ? 'رحلتك تبدأ من هنا'
                            : 'نساعدك على العودة'}
                    </h1>
                </div>
                <section
                    className="qb-account-card"
                    data-role={role}
                    aria-labelledby="account-title"
                >
                    <div className="qb-art" aria-hidden="true" />
                    <div className="qb-form-panel" ref={panel}>
                        <div className="qb-form-top">
                            <span className="qb-badge">
                                <PortalIcon
                                    name={student ? 'book' : 'shield'}
                                />
                                {student ? 'بوابة الطالب' : 'بوابة الإدارة'}
                            </span>
                            <Link className="qb-back" href={route(loginRoute)}>
                                <PortalIcon name="arrow" />
                                رجوع للدخول
                            </Link>
                        </div>
                        <h2 id="account-title" className="qb-form-title">
                            {title}
                        </h2>
                        <p className="qb-subtitle">{subtitle}</p>
                        <div className="qb-account-flash">
                            <FlashMessages />
                        </div>
                        <form
                            onSubmit={submit}
                            aria-label={title}
                            aria-busy={form.processing}
                        >
                            <div
                                className={`qb-account-fields${!recovering ? ' qb-account-grid' : ''}`}
                            >
                                {registering && (
                                    <AccountField
                                        name="name"
                                        label="الاسم الكامل"
                                        form={form}
                                        autoComplete="name"
                                        placeholder="اسمك الكامل"
                                        maxLength={255}
                                    />
                                )}
                                {student && (
                                    <AccountField
                                        name="university_id"
                                        label="الرقم الجامعي"
                                        form={form}
                                        placeholder="M123456789"
                                        dir="ltr"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        hint="M متبوعًا بتسعة أرقام"
                                    />
                                )}
                                <AccountField
                                    name="email"
                                    wide={mode === 'reset' && !student}
                                    label="البريد الإلكتروني"
                                    form={form}
                                    type="email"
                                    placeholder="name@example.com"
                                    dir="ltr"
                                    autoComplete="email"
                                    maxLength={255}
                                />
                                {!recovering && (
                                    <>
                                        <AccountField
                                            name="password"
                                            label={
                                                registering
                                                    ? 'كلمة المرور'
                                                    : 'كلمة المرور الجديدة'
                                            }
                                            form={form}
                                            type="password"
                                            placeholder="ثمانية أحرف على الأقل"
                                            autoComplete="new-password"
                                            minLength={8}
                                        />
                                        <AccountField
                                            name="password_confirmation"
                                            label="تأكيد كلمة المرور"
                                            form={form}
                                            type="password"
                                            placeholder="أعد كتابة كلمة المرور"
                                            autoComplete="new-password"
                                            minLength={8}
                                        />
                                    </>
                                )}
                            </div>
                            {form.errors.token && (
                                <p className="qb-error" role="alert">
                                    {form.errors.token}
                                </p>
                            )}
                            <button
                                type="submit"
                                className="qb-submit"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? registering
                                        ? 'جارٍ إنشاء الحساب…'
                                        : recovering
                                          ? 'جارٍ إرسال الرابط…'
                                          : 'جارٍ حفظ كلمة المرور…'
                                    : registering
                                      ? 'إنشاء الحساب'
                                      : recovering
                                        ? 'إرسال رابط الاستعادة'
                                        : 'حفظ كلمة المرور الجديدة'}
                                <PortalIcon name="arrow" />
                            </button>
                        </form>
                        <p className="qb-register">
                            {registering ? 'لديك حساب بالفعل؟' : 'جاهز للعودة؟'}{' '}
                            <Link
                                className="qb-text-button"
                                href={route(loginRoute)}
                            >
                                تسجيل الدخول
                            </Link>
                        </p>
                        {mode === 'reset' && (
                            <Link
                                className="qb-recovery-link"
                                href={route(requestRoute)}
                            >
                                انتهت صلاحية الرابط؟ اطلب رابطًا جديدًا
                            </Link>
                        )}
                    </div>
                </section>
            </main>
            <footer className="qb-footer">بنك الأسئلة · تعلّم بثقة</footer>
        </div>
    );
}
