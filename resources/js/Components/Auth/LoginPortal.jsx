import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FlashMessages from '../FlashMessages';
import StudentIcon from '../StudentIcon';
import portalArt from '../../../images/auth-portals.webp';
import '../../../css/auth-portals.css';

const EMPTY_ERRORS = {};

function PortalIcon({ name }) {
    if (name === 'eye' || name === 'eye-off') {
        return (
            <svg
                className="auth-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {name === 'eye-off' && <path d="m3 3 18 18" />}
            </svg>
        );
    }
    if (name === 'shield') {
        return (
            <svg
                className="auth-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z" />
                <path d="m8 11 3 3 5-5" />
            </svg>
        );
    }
    return <StudentIcon name={name} className="auth-icon" />;
}

function LoginForm({
    role,
    initialIdentifier,
    serverErrors,
    onBack,
    onBusy,
    onHeight,
}) {
    const student = role === 'student';
    const field = student ? 'university_id' : 'email';
    const label = student ? 'الرقم الجامعي' : 'البريد الإلكتروني';
    const { data, setData, post, reset, processing, errors, setError } =
        useForm({
            [field]: initialIdentifier,
            password: '',
        });
    const [showPassword, setShowPassword] = useState(false);
    const panel = useRef(null);
    const back = useRef(null);

    useEffect(() => {
        setError(serverErrors);
    }, [serverErrors, setError]);

    useLayoutEffect(() => {
        const measure = () =>
            onHeight(Math.ceil(panel.current.getBoundingClientRect().height));
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(panel.current);
        return () => observer.disconnect();
    }, [onHeight]);

    useEffect(() => {
        const timer = setTimeout(
            () =>
                (
                    panel.current?.querySelector('[aria-invalid="true"]') ??
                    back.current
                )?.focus({ preventScroll: true }),
            720,
        );
        return () => clearTimeout(timer);
    }, []);

    const submit = (event) => {
        event.preventDefault();
        if (processing) return;
        post(route(student ? 'login-student.store' : 'login-admin.store'), {
            preserveScroll: true,
            onStart: () => onBusy(true),
            onError: () =>
                requestAnimationFrame(() =>
                    panel.current
                        ?.querySelector('[aria-invalid="true"]')
                        ?.focus(),
                ),
            onFinish: () => {
                reset('password');
                setShowPassword(false);
                onBusy(false);
            },
        });
    };

    return (
        <div id={`${role}-login-panel`} className="qb-form-panel" ref={panel}>
            <div className="qb-form-top">
                <span className="qb-badge">
                    <PortalIcon name={student ? 'book' : 'shield'} />
                    {student ? 'بوابة الطالب' : 'بوابة الإدارة'}
                </span>
                <button
                    type="button"
                    className="qb-back"
                    ref={back}
                    onClick={onBack}
                    disabled={processing}
                >
                    <PortalIcon name="arrow" />
                    رجوع
                </button>
            </div>
            <h2 className="qb-form-title">
                {student ? 'مرحبًا بعودتك' : 'دخول الإدارة'}
            </h2>
            <p className="qb-subtitle">
                {student
                    ? 'سجّل دخولك وواصل رحلتك التعليمية.'
                    : 'إدارة المقررات والأسئلة من مكان واحد.'}
            </p>
            <form
                onSubmit={submit}
                aria-label={
                    student ? 'تسجيل دخول الطالب' : 'تسجيل دخول الإدارة'
                }
                aria-busy={processing}
            >
                <label className="qb-field" htmlFor={`${role}-${field}`}>
                    {label}
                    <span className="qb-input-wrap">
                        <input
                            id={`${role}-${field}`}
                            name={field}
                            type={student ? 'text' : 'email'}
                            value={data[field]}
                            onChange={(event) =>
                                setData(field, event.target.value)
                            }
                            placeholder={
                                student ? 'M123456789' : 'name@example.com'
                            }
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            dir="ltr"
                            required
                            aria-invalid={Boolean(errors[field])}
                            aria-describedby={
                                errors[field]
                                    ? `${role}-identifier-error`
                                    : undefined
                            }
                        />
                    </span>
                    {errors[field] && (
                        <span
                            id={`${role}-identifier-error`}
                            className="qb-error"
                            role="alert"
                        >
                            {errors[field]}
                        </span>
                    )}
                </label>
                <label className="qb-field" htmlFor={`${role}-password`}>
                    كلمة المرور
                    <span className="qb-input-wrap">
                        <input
                            id={`${role}-password`}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            data-password
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            placeholder="أدخل كلمة المرور"
                            autoComplete="current-password"
                            required
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                                errors.password
                                    ? `${role}-password-error`
                                    : undefined
                            }
                        />
                        <button
                            type="button"
                            className="qb-eye"
                            onClick={() => setShowPassword((show) => !show)}
                            aria-label={
                                showPassword
                                    ? 'إخفاء كلمة المرور'
                                    : 'إظهار كلمة المرور'
                            }
                            aria-pressed={showPassword}
                        >
                            <PortalIcon
                                name={showPassword ? 'eye-off' : 'eye'}
                            />
                        </button>
                    </span>
                    {errors.password && (
                        <span
                            id={`${role}-password-error`}
                            className="qb-error"
                            role="alert"
                        >
                            {errors.password}
                        </span>
                    )}
                </label>
                <Link
                    className="qb-forgot"
                    href={route(
                        student
                            ? 'password-request-student.show'
                            : 'password-request-admin.show',
                    )}
                >
                    نسيت كلمة المرور؟
                </Link>
                <button
                    type="submit"
                    className="qb-submit"
                    disabled={processing}
                >
                    {processing ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
                    <PortalIcon name="arrow" />
                </button>
                {student && (
                    <p className="qb-register">
                        ليس لديك حساب؟{' '}
                        <Link
                            className="qb-text-button"
                            href={route('register')}
                        >
                            إنشاء حساب
                        </Link>
                    </p>
                )}
            </form>
        </div>
    );
}

export default function LoginPortal({
    initialRole = null,
    initialIdentifier = '',
}) {
    const { errors: pageErrors = EMPTY_ERRORS } = usePage().props;
    const [activeRole, setActiveRole] = useState(initialRole);
    const [busy, setBusy] = useState(false);
    const [formHeight, setFormHeight] = useState(500);
    const choices = useRef({});
    const closingRole = useRef(null);

    const close = () => {
        if (busy) return;
        closingRole.current = activeRole;
        setActiveRole(null);
    };

    useEffect(() => {
        if (!activeRole && closingRole.current) {
            choices.current[closingRole.current]?.focus({
                preventScroll: true,
            });
            closingRole.current = null;
        }
    }, [activeRole]);

    return (
        <div
            className={`auth-entry${activeRole ? ' qb-open' : ''}`}
            dir="rtl"
            style={{
                '--qb-art': `url("${portalArt}")`,
                '--auth-form-height': `${formHeight}px`,
            }}
            onKeyDown={(event) => {
                if (event.key === 'Escape' && activeRole) close();
            }}
        >
            <Head
                title={
                    activeRole === 'student'
                        ? 'دخول الطالب'
                        : activeRole === 'admin'
                          ? 'دخول الإدارة'
                          : 'مرحبًا بك'
                }
            />
            <header className="qb-top">
                <Link className="qb-brand" href="/">
                    <PortalIcon name="book" />
                    <span>بنك الأسئلة</span>
                </Link>
                <span className="qb-tag">QUESTION BANK</span>
            </header>
            <main className="auth-main">
                <div className="qb-intro">
                    <h1>رحلتك تبدأ من هنا</h1>
                    <p>تعلّم، تدرّب، وتابع تقدّمك.</p>
                </div>
                <div className="qb-flash">
                    <FlashMessages />
                </div>
                <div className="qb-stage">
                    {['student', 'admin'].map((role) => {
                        const selected = activeRole === role;
                        const away = Boolean(activeRole && !selected);
                        return (
                            <section
                                key={role}
                                className={`qb-portal${selected ? ' qb-selected' : ''}${away ? ' qb-away' : ''}`}
                                data-role={role}
                                inert={away}
                                aria-label={
                                    role === 'student'
                                        ? 'بوابة الطالب'
                                        : 'بوابة الإدارة'
                                }
                            >
                                <div className="qb-art">
                                    <button
                                        type="button"
                                        className="qb-select"
                                        ref={(node) => {
                                            choices.current[role] = node;
                                        }}
                                        onClick={() => setActiveRole(role)}
                                        aria-label={
                                            role === 'student'
                                                ? 'فتح تسجيل دخول الطالب'
                                                : 'فتح تسجيل دخول الإدارة'
                                        }
                                        aria-expanded={selected}
                                        aria-controls={`${role}-login-panel`}
                                    >
                                        <span className="qb-choice">
                                            {role === 'student'
                                                ? 'الطالب'
                                                : 'الإدارة'}
                                            <PortalIcon name="arrow" />
                                        </span>
                                    </button>
                                </div>
                                {selected && (
                                    <LoginForm
                                        key={role}
                                        role={role}
                                        initialIdentifier={
                                            role === initialRole
                                                ? initialIdentifier
                                                : ''
                                        }
                                        serverErrors={
                                            role === initialRole
                                                ? pageErrors
                                                : EMPTY_ERRORS
                                        }
                                        onBack={close}
                                        onBusy={setBusy}
                                        onHeight={setFormHeight}
                                    />
                                )}
                            </section>
                        );
                    })}
                </div>
            </main>
            <footer className="qb-footer">بنك الأسئلة · تعلّم بثقة</footer>
        </div>
    );
}
