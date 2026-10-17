import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FlashMessages from '../FlashMessages';
import { PortalIcon } from './LoginPortal';
import BrandMark from '../BrandMark';
import PortalArtwork from './PortalArtwork';
import usePortalLanguage from './usePortalLanguage';
import { translatePortalFeedback } from './portalLanguage';
import '../../../css/account-portals.css';

const EMPTY_ERRORS = {};

function AccountField({
    name,
    label,
    form,
    messages,
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
                            aria-label={`${visible ? messages.account.hide : messages.account.show} ${label}`}
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
    const { language, messages } = usePortalLanguage();
    const copy = messages.account;
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
    useEffect(() => {
        setError(
            Object.fromEntries(
                Object.entries(pageErrors).map(([key, value]) => [
                    key,
                    translatePortalFeedback(value, language),
                ]),
            ),
        );
    }, [pageErrors, language, setError]);
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
        ? copy.registerTitle
        : recovering
          ? messages.forgotPassword
          : copy.resetTitle;
    const subtitle = registering
        ? copy.registerSubtitle
        : recovering
          ? student
              ? copy.studentRecoverySubtitle
              : copy.adminRecoverySubtitle
          : copy.resetSubtitle;
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
            className="auth-entry qb-account qb-surface"
            lang={language}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            style={{
                '--qb-account-height': `${height}px`,
            }}
        >
            <Head title={title} />
            <header className="qb-top">
                <Link className="qb-brand" href="/">
                    <BrandMark />
                    <span>{messages.brand}</span>
                </Link>
            </header>
            <main className="auth-main">
                <div className="qb-intro">
                    <h1>
                        {registering ? messages.heading : copy.recoveryHeading}
                    </h1>
                </div>
                <section
                    className="qb-account-card"
                    data-role={role}
                    aria-labelledby="account-title"
                >
                    <PortalArtwork
                        role={role}
                        brand={messages.brand}
                        tagline={messages.cardTagline}
                    />
                    <div className="qb-form-panel" ref={panel}>
                        <div className="qb-form-top">
                            <span className="qb-badge">
                                <PortalIcon
                                    name={student ? 'book' : 'shield'}
                                />
                                {student
                                    ? messages.studentPortal
                                    : messages.adminPortal}
                            </span>
                            <Link className="qb-back" href={route(loginRoute)}>
                                <PortalIcon name="arrow" />
                                {copy.backToLogin}
                            </Link>
                        </div>
                        <h2 id="account-title" className="qb-form-title">
                            {title}
                        </h2>
                        <p className="qb-subtitle">{subtitle}</p>
                        <div className="qb-account-flash">
                            <FlashMessages
                                translate={(value) =>
                                    translatePortalFeedback(value, language)
                                }
                            />
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
                                        messages={messages}
                                        name="name"
                                        label={copy.fullName}
                                        form={form}
                                        autoComplete="name"
                                        placeholder={copy.fullNamePlaceholder}
                                        maxLength={255}
                                    />
                                )}
                                {student && (
                                    <AccountField
                                        messages={messages}
                                        name="university_id"
                                        label={messages.universityId}
                                        form={form}
                                        placeholder="M123456789"
                                        dir="ltr"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        hint={copy.universityIdHint}
                                    />
                                )}
                                <AccountField
                                    messages={messages}
                                    name="email"
                                    wide={mode === 'reset' && !student}
                                    label={messages.email}
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
                                            messages={messages}
                                            name="password"
                                            label={
                                                registering
                                                    ? messages.password
                                                    : copy.passwordNew
                                            }
                                            form={form}
                                            type="password"
                                            placeholder={copy.passwordMinimum}
                                            autoComplete="new-password"
                                            minLength={8}
                                        />
                                        <AccountField
                                            messages={messages}
                                            name="password_confirmation"
                                            label={copy.passwordConfirm}
                                            form={form}
                                            type="password"
                                            placeholder={
                                                copy.passwordConfirmPlaceholder
                                            }
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
                                        ? copy.creating
                                        : recovering
                                          ? copy.sending
                                          : copy.saving
                                    : registering
                                      ? copy.createAccount
                                      : recovering
                                        ? copy.sendResetLink
                                        : copy.savePassword}
                                <PortalIcon name="arrow" />
                            </button>
                        </form>
                        <p className="qb-register">
                            {registering
                                ? copy.alreadyHaveAccount
                                : copy.readyToReturn}{' '}
                            <Link
                                className="qb-text-button"
                                href={route(loginRoute)}
                            >
                                {messages.signIn}
                            </Link>
                        </p>
                        {mode === 'reset' && (
                            <Link
                                className="qb-recovery-link"
                                href={route(requestRoute)}
                            >
                                {copy.expiredLink}
                            </Link>
                        )}
                    </div>
                </section>
            </main>
            <footer className="qb-footer">{messages.footer}</footer>
        </div>
    );
}
