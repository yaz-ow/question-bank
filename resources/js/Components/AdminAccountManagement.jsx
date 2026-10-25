import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../i18n/admin';
import { Link, useForm } from '@inertiajs/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import AdminIcon from './AdminIcon';
import InstructorSubjects from './InstructorSubjects';
const number = (value) => new Intl.NumberFormat('en-US').format(value);
const date = (value) => (value ? value.split('-').reverse().join('/') : '—');
export function AccountMetrics({ stats, students = false }) {
    const metrics = [
        {
            label: students ? t('إجمالي الطلاب') : t('إجمالي المدرّسين'),
            value: stats.total,
            tone: 'blue',
            icon: 'users',
        },
        {
            label: t('حسابات نشطة'),
            value: stats.active,
            tone: 'green',
            icon: 'user',
        },
        {
            label: t('حسابات معطلة'),
            value: stats.inactive,
            tone: 'red',
            icon: 'user-off',
        },
    ];
    return (
        <section
            className="admin-metrics admin-account-metrics"
            aria-label={t('إحصاءات الحسابات')}
        >
            {metrics.map((metric) => (
                <article
                    key={metric.label}
                    className={`admin-metric admin-tone-${metric.tone}`}
                >
                    <div>
                        <h2>{metric.label}</h2>
                        <p>{number(metric.value)}</p>
                    </div>
                    <span className="admin-metric-icon">
                        <AdminIcon name={metric.icon} />
                    </span>
                </article>
            ))}
        </section>
    );
}
function AccountIdentity({ user }) {
    return (
        <div className="admin-account-identity">
            <span
                className={`admin-account-initial admin-initial-${user.id % 4}`}
                aria-hidden="true"
            >
                {Array.from(user.name)[0] || t('؟')}
            </span>
            <bdi>{user.name}</bdi>
        </div>
    );
}
function AccountStatus({ active }) {
    return (
        <span
            className={`admin-account-status ${active ? 'is-active' : 'is-inactive'}`}
        >
            <span aria-hidden="true" />
            {active ? t('نشط') : t('معطل')}
        </span>
    );
}
export default function AccountList({
    accounts,
    filters = {},
    students = false,
    disabled = false,
    onBusy,
    subjects = [],
}) {
    const prefix = students ? 'admin.students' : 'admin.instructors';
    const label = students ? t('طالب') : t('مدرّس');
    const title = students ? t('قائمة الطلاب') : t('المدرّسون المسجلون');
    const [panel, setPanel] = useState(null);
    const titleRef = useRef(null);
    const panelRef = useRef(null);
    const filter = useForm({
        search: filters.search || '',
        status: filters.status || '',
    });
    const edit = useForm({
        name: '',
        email: '',
    });
    const toggle = useForm({
        is_active: false,
    });
    const deletion = useForm({
        instructor_creation_code: '',
    });
    const assignment = useForm({ subject_ids: [] });
    const processing =
        filter.processing ||
        edit.processing ||
        toggle.processing ||
        deletion.processing || assignment.processing;
    const busy = disabled || processing;
    const selected = accounts.data.find((user) => user.id === panel?.id);
    const hasFilters = !!(filters.search || filters.status);
    useEffect(() => {
        onBusy?.(processing);
    }, [processing, onBusy]);
    useEffect(() => {
        filter.setData({
            search: filters.search || '',
            status: filters.status || '',
        });
    }, [filters.search, filters.status]);
    useEffect(() => {
        if (selected)
            panelRef.current
                ?.querySelector(
                    panel.kind === 'toggle' ? '[data-account-cancel]' : 'input',
                )
                ?.focus();
    }, [panel?.id, panel?.kind]);
    const close = () => {
        const id = panel?.id;
        const kind = panel?.kind;
        deletion.reset();
        deletion.clearErrors();
        setPanel(null);
        requestAnimationFrame(() =>
            (
                document.getElementById(`account-${id}-${kind}`) ||
                titleRef.current
            )?.focus(),
        );
    };
    const open = (user, kind) => {
        assignment.clearErrors();
        if (kind === 'subjects') {
            assignment.setData('subject_ids', subjects.filter((subject) => subject.instructor_id === user.id).map((subject) => subject.id));
        }
        edit.clearErrors();
        toggle.clearErrors();
        deletion.reset();
        deletion.clearErrors();
        if (kind === 'edit')
            edit.setData({
                name: user.name,
                email: user.email,
            });
        setPanel({
            id: user.id,
            kind,
        });
    };
    const search = (event) => {
        event.preventDefault();
        filter.get(route(`${prefix}.index`), {
            preserveScroll: true,
            preserveState: true,
            errorBag: 'accountFilters',
            onSuccess: () => setPanel(null),
        });
    };
    const save = (event) => {
        event.preventDefault();
        edit.put(route('admin.instructors.update', selected.id), {
            preserveScroll: true,
            errorBag: 'updateInstructor',
            onSuccess: close,
        });
    };
    const saveSubjects = (event) => {
        event.preventDefault();
        if (busy || !selected || students) return;
        assignment.put(route('admin.instructors.subjects', selected.id), {
            preserveScroll: true,
            errorBag: 'instructorSubjects',
            onSuccess: close,
        });
    };
    const confirm = () => {
        toggle.transform(() => ({
            is_active: !selected.is_active,
        }));
        toggle.post(route(`${prefix}.toggle`, selected.id), {
            preserveScroll: true,
            errorBag: 'toggleAccount',
            onSuccess: close,
        });
    };
    const deleteInstructor = (event) => {
        event.preventDefault();
        if (busy || students || !selected) return;
        deletion.delete(route('admin.instructors.destroy', selected.id), {
            preserveScroll: true,
            errorBag: 'deleteInstructor',
            onSuccess: close,
            onFinish: () => deletion.reset('instructor_creation_code'),
        });
    };
    const clearFilters = (event) => {
        event.preventDefault();
        filter.setData({
            search: '',
            status: '',
        });
        filter.transform(() => ({}));
        filter.get(route(`${prefix}.index`), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setPanel(null),
            onFinish: () => filter.transform((data) => data),
        });
    };
    return (
        <section
            className="admin-panel admin-account-list"
            aria-labelledby="account-list-title"
        >
            <div className="admin-account-list-heading">
                <h2 id="account-list-title" ref={titleRef} tabIndex={-1}>
                    {title}
                </h2>
                <form
                    className="admin-course-filters admin-account-filters"
                    onSubmit={search}
                >
                    <label className="admin-search">
                        <AdminIcon name="search" />
                        <input
                            aria-label={
                                students
                                    ? t('البحث عن طالب')
                                    : t('البحث عن مدرّس')
                            }
                            placeholder={
                                students
                                    ? t(
                                          'ابحث بالاسم أو الرقم الجامعي أو البريد الإلكتروني',
                                      )
                                    : t(
                                          'ابحث باسم المدرّس أو البريد الإلكتروني',
                                      )
                            }
                            maxLength={255}
                            value={filter.data.search}
                            disabled={busy}
                            onChange={(e) =>
                                filter.setData('search', e.target.value)
                            }
                        />
                    </label>
                    <select
                        aria-label={t('تصفية حسب حالة الحساب')}
                        value={filter.data.status}
                        disabled={busy}
                        onChange={(e) =>
                            filter.setData('status', e.target.value)
                        }
                    >
                        <option value="">{t('كل الحالات')}</option>
                        <option value="active">{t('نشط')}</option>
                        <option value="inactive">{t('معطل')}</option>
                    </select>
                    <button
                        className="admin-button admin-button-primary admin-account-search-button"
                        disabled={busy}
                        type="submit"
                    >
                        <AdminIcon name="search" />
                        {filter.processing ? t('جارٍ البحث…') : t('بحث')}
                    </button>
                    {hasFilters && (
                        <button
                            type="button"
                            className="admin-subject-reset"
                            onClick={clearFilters}
                            disabled={busy}
                        >
                            {t('مسح الفلاتر')}
                        </button>
                    )}
                </form>
            </div>
            {Object.values(filter.errors).map((error, index) => (
                <p className="admin-field-error" role="alert" key={index}>
                    {feedback(error)}
                </p>
            ))}
            <div className="admin-table-scroll">
                <table
                    className={`admin-table admin-account-table ${students ? 'admin-students-table' : 'admin-instructors-table'}`}
                >
                    <caption className="sr-only">
                        {title}
                        {t(' وحالة الحساب وإجراءات الإدارة')}
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">
                                {students ? t('الطالب') : t('المدرّس')}
                            </th>
                            {students && (
                                <th scope="col">{t('الرقم الجامعي')}</th>
                            )}
                            <th scope="col">{t('البريد الإلكتروني')}</th>
                            <th scope="col">
                                {students
                                    ? t('تاريخ التسجيل')
                                    : t('تاريخ الإضافة')}
                            </th>
                            <th scope="col">{t('الحالة')}</th>
                            <th scope="col">
                                {students ? t('الإجراء') : t('الإجراءات')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.data.map((user) => (
                            <Fragment key={user.id}>
                                <tr
                                    className={
                                        selected?.id === user.id
                                            ? 'admin-account-selected'
                                            : undefined
                                    }
                                >
                                    <th scope="row">
                                        <AccountIdentity user={user} />
                                    </th>
                                    {students && (
                                        <td>
                                            <bdi>
                                                {user.university_id || '—'}
                                            </bdi>
                                        </td>
                                    )}
                                    <td className="admin-account-email">
                                        <bdi>{user.email}</bdi>
                                    </td>
                                    <td className="admin-account-date">
                                        <bdi>{date(user.created_at)}</bdi>
                                    </td>
                                    <td>
                                        <AccountStatus
                                            active={user.is_active}
                                        />
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            {!students && (
                                                <button id={`account-${user.id}-subjects`} type="button"
                                                    className="admin-account-action admin-account-edit"
                                                    aria-label={t('مقررات {0}', { 0: user.name })}
                                                    aria-expanded={selected?.id === user.id && panel?.kind === 'subjects'}
                                                    aria-controls={selected?.id === user.id && panel?.kind === 'subjects' ? `account-panel-${user.id}` : undefined}
                                                    disabled={busy} onClick={() => open(user, 'subjects')}>
                                                    <AdminIcon name="book" />{t('المقررات')}
                                                </button>
                                            )}
                                            {!students && (
                                                <button
                                                    id={`account-${user.id}-edit`}
                                                    className="admin-account-action admin-account-edit"
                                                    type="button"
                                                    aria-label={t('تعديل {0}', {
                                                        0: user.name,
                                                    })}
                                                    aria-expanded={
                                                        selected?.id ===
                                                            user.id &&
                                                        panel?.kind === 'edit'
                                                    }
                                                    aria-controls={
                                                        selected?.id ===
                                                            user.id &&
                                                        panel?.kind === 'edit'
                                                            ? `account-panel-${user.id}`
                                                            : undefined
                                                    }
                                                    disabled={busy}
                                                    onClick={() =>
                                                        open(user, 'edit')
                                                    }
                                                >
                                                    <AdminIcon name="edit" />
                                                    {t('تعديل')}
                                                </button>
                                            )}
                                            <button
                                                id={`account-${user.id}-toggle`}
                                                type="button"
                                                className={`admin-account-action ${user.is_active ? 'admin-account-deactivate' : 'admin-account-activate'}`}
                                                aria-label={`${user.is_active ? t('تعطيل') : t('تفعيل')} ${user.name}`}
                                                disabled={busy}
                                                aria-expanded={
                                                    selected?.id === user.id &&
                                                    panel?.kind === 'toggle'
                                                }
                                                aria-controls={
                                                    selected?.id === user.id &&
                                                    panel?.kind === 'toggle'
                                                        ? `account-panel-${user.id}`
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    open(user, 'toggle')
                                                }
                                            >
                                                {!students && (
                                                    <AdminIcon
                                                        name={
                                                            user.is_active
                                                                ? 'ban'
                                                                : 'tick'
                                                        }
                                                    />
                                                )}
                                                {user.is_active
                                                    ? t('تعطيل')
                                                    : t('تفعيل')}
                                            </button>
                                            {!students && (
                                                <button
                                                    id={`account-${user.id}-delete`}
                                                    type="button"
                                                    className="admin-account-action admin-account-delete"
                                                    disabled={busy}
                                                    aria-label={t('حذف {0}', {
                                                        0: user.name,
                                                    })}
                                                    aria-expanded={
                                                        selected?.id ===
                                                            user.id &&
                                                        panel?.kind === 'delete'
                                                    }
                                                    aria-controls={
                                                        selected?.id ===
                                                            user.id &&
                                                        panel?.kind === 'delete'
                                                            ? `account-panel-${user.id}`
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        open(user, 'delete')
                                                    }
                                                >
                                                    <AdminIcon name="trash" />
                                                    {t('حذف')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {selected?.id === user.id && (
                                    <tr className="admin-account-panel-row">
                                        <td colSpan={students ? 6 : 5}>
                                            <div
                                                id={`account-panel-${user.id}`}
                                                ref={panelRef}
                                                className={`admin-account-inline ${['edit', 'subjects'].includes(panel.kind) ? 'is-editing' : panel.kind === 'delete' ? 'is-deleting' : 'is-confirming'}`}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                            'Escape' &&
                                                        !busy
                                                    ) {
                                                        event.stopPropagation();
                                                        close();
                                                    }
                                                }}
                                            >
                                                {panel.kind === 'subjects' ? (
                                                    <InstructorSubjects key={user.id} user={user} subjects={subjects}
                                                        form={assignment} busy={busy} onSave={saveSubjects} onClose={close} />
                                                ) : panel.kind === 'edit' ? (
                                                    <form
                                                        onSubmit={save}
                                                        className="admin-account-edit-form"
                                                        aria-label={t(
                                                            'تعديل بيانات {0}',
                                                            {
                                                                0: user.name,
                                                            },
                                                        )}
                                                    >
                                                        <div className="admin-subject-field">
                                                            <label
                                                                htmlFor={`edit-name-${user.id}`}
                                                            >
                                                                {t(
                                                                    'اسم المدرّس',
                                                                )}
                                                            </label>
                                                            <input
                                                                id={`edit-name-${user.id}`}
                                                                className="admin-subject-input"
                                                                required
                                                                maxLength={255}
                                                                value={
                                                                    edit.data
                                                                        .name
                                                                }
                                                                disabled={busy}
                                                                aria-invalid={
                                                                    !!edit
                                                                        .errors
                                                                        .name
                                                                }
                                                                aria-describedby={
                                                                    edit.errors
                                                                        .name
                                                                        ? 'edit-name-error'
                                                                        : undefined
                                                                }
                                                                onChange={(e) =>
                                                                    edit.setData(
                                                                        'name',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {edit.errors
                                                                .name && (
                                                                <p
                                                                    id="edit-name-error"
                                                                    className="admin-field-error"
                                                                    role="alert"
                                                                >
                                                                    {feedback(
                                                                        edit
                                                                            .errors
                                                                            .name,
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="admin-subject-field">
                                                            <label
                                                                htmlFor={`edit-email-${user.id}`}
                                                            >
                                                                {t(
                                                                    'البريد الإلكتروني',
                                                                )}
                                                            </label>
                                                            <input
                                                                id={`edit-email-${user.id}`}
                                                                className="admin-subject-input"
                                                                type="email"
                                                                dir="ltr"
                                                                required
                                                                maxLength={255}
                                                                value={
                                                                    edit.data
                                                                        .email
                                                                }
                                                                disabled={busy}
                                                                aria-invalid={
                                                                    !!edit
                                                                        .errors
                                                                        .email
                                                                }
                                                                aria-describedby={
                                                                    edit.errors
                                                                        .email
                                                                        ? 'edit-email-error'
                                                                        : undefined
                                                                }
                                                                onChange={(e) =>
                                                                    edit.setData(
                                                                        'email',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {edit.errors
                                                                .email && (
                                                                <p
                                                                    id="edit-email-error"
                                                                    className="admin-field-error"
                                                                    role="alert"
                                                                >
                                                                    {feedback(
                                                                        edit
                                                                            .errors
                                                                            .email,
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="admin-account-inline-actions admin-account-edit-buttons">
                                                            <button
                                                                type="submit"
                                                                className="admin-button admin-save-edit"
                                                                disabled={busy}
                                                            >
                                                                <AdminIcon name="tick" />
                                                                {edit.processing
                                                                    ? t(
                                                                          'جارٍ الحفظ…',
                                                                      )
                                                                    : t(
                                                                          'حفظ التعديل',
                                                                      )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                data-account-cancel
                                                                className="admin-button admin-account-cancel"
                                                                disabled={busy}
                                                                onClick={close}
                                                            >
                                                                {t('إلغاء')}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : panel.kind === 'delete' ? (
                                                    <form
                                                        onSubmit={
                                                            deleteInstructor
                                                        }
                                                        className="admin-account-delete-form"
                                                        aria-label={t(
                                                            'تأكيد حذف {0}',
                                                            {
                                                                0: user.name,
                                                            },
                                                        )}
                                                    >
                                                        <div className="admin-account-confirm-text">
                                                            <AdminIcon name="alert" />
                                                            <div>
                                                                <h3>
                                                                    {t(
                                                                        'حذف حساب ',
                                                                    )}
                                                                    <bdi>
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </bdi>
                                                                    {t(
                                                                        ' نهائيًا؟',
                                                                    )}
                                                                </h3>
                                                                <p>
                                                                    {t(
                                                                        'ستبقى المقررات والأسئلة ونتائج الطلاب محفوظة.',
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="admin-subject-field">
                                                            <label
                                                                htmlFor={`delete-code-${user.id}`}
                                                            >
                                                                {t(
                                                                    'رمز المؤسس',
                                                                )}
                                                            </label>
                                                            <input
                                                                id={`delete-code-${user.id}`}
                                                                className="admin-subject-input"
                                                                type="password"
                                                                dir="ltr"
                                                                autoComplete="off"
                                                                required
                                                                maxLength={255}
                                                                disabled={busy}
                                                                value={
                                                                    deletion
                                                                        .data
                                                                        .instructor_creation_code
                                                                }
                                                                aria-invalid={
                                                                    !!deletion
                                                                        .errors
                                                                        .instructor_creation_code
                                                                }
                                                                aria-describedby={`delete-code-help-${user.id}${deletion.errors.instructor_creation_code ? ` delete-code-error-${user.id}` : ''}`}
                                                                onChange={(e) =>
                                                                    deletion.setData(
                                                                        'instructor_creation_code',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <p
                                                                id={`delete-code-help-${user.id}`}
                                                                className="admin-account-field-help"
                                                            >
                                                                {t(
                                                                    'نفس رمز التفويض المستخدم لإنشاء المدرّس.',
                                                                )}
                                                            </p>
                                                            {Object.entries(
                                                                deletion.errors,
                                                            ).map(
                                                                ([
                                                                    field,
                                                                    message,
                                                                ]) => (
                                                                    <p
                                                                        key={
                                                                            field
                                                                        }
                                                                        id={
                                                                            field ===
                                                                            'instructor_creation_code'
                                                                                ? `delete-code-error-${user.id}`
                                                                                : undefined
                                                                        }
                                                                        className="admin-field-error"
                                                                        role="alert"
                                                                    >
                                                                        {feedback(
                                                                            message,
                                                                        )}
                                                                    </p>
                                                                ),
                                                            )}
                                                        </div>
                                                        <div className="admin-account-inline-actions admin-account-delete-buttons">
                                                            <button
                                                                type="submit"
                                                                className="admin-button admin-account-confirm-deactivate"
                                                                disabled={busy}
                                                            >
                                                                <AdminIcon name="trash" />
                                                                {deletion.processing
                                                                    ? t(
                                                                          'جارٍ الحذف…',
                                                                      )
                                                                    : t(
                                                                          'تأكيد الحذف',
                                                                      )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                data-account-cancel
                                                                className="admin-button admin-account-cancel"
                                                                disabled={busy}
                                                                onClick={close}
                                                            >
                                                                {t('إلغاء')}
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="admin-account-confirm-text">
                                                            <AdminIcon name="alert" />
                                                            <div>
                                                                <h3>
                                                                    {user.is_active
                                                                        ? t(
                                                                              'تعطيل',
                                                                          )
                                                                        : t(
                                                                              'تفعيل',
                                                                          )}
                                                                    {t(
                                                                        ' حساب ',
                                                                    )}
                                                                    <bdi>
                                                                        {
                                                                            user.name
                                                                        }
                                                                    </bdi>
                                                                    {t('؟')}
                                                                </h3>
                                                                <p>
                                                                    {user.is_active
                                                                        ? t(
                                                                              'لن يتمكن ال{0} من تسجيل الدخول حتى إعادة التفعيل.',
                                                                              {
                                                                                  0: label,
                                                                              },
                                                                          )
                                                                        : t(
                                                                              'سيتمكن ال{0} من تسجيل الدخول واستخدام حسابه مجددًا.',
                                                                              {
                                                                                  0: label,
                                                                              },
                                                                          )}
                                                                </p>
                                                                {Object.values(
                                                                    toggle.errors,
                                                                ).map(
                                                                    (
                                                                        error,
                                                                        index,
                                                                    ) => (
                                                                        <p
                                                                            className="admin-field-error"
                                                                            role="alert"
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {feedback(
                                                                                error,
                                                                            )}
                                                                        </p>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="admin-account-inline-actions">
                                                            <button
                                                                type="button"
                                                                className={`admin-button ${user.is_active ? 'admin-account-confirm-deactivate' : 'admin-save-edit'}`}
                                                                disabled={busy}
                                                                onClick={
                                                                    confirm
                                                                }
                                                            >
                                                                {toggle.processing
                                                                    ? t(
                                                                          'جارٍ التحديث…',
                                                                      )
                                                                    : user.is_active
                                                                      ? t(
                                                                            'تأكيد التعطيل',
                                                                        )
                                                                      : t(
                                                                            'تأكيد التفعيل',
                                                                        )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                data-account-cancel
                                                                className="admin-button admin-account-cancel"
                                                                disabled={busy}
                                                                onClick={close}
                                                            >
                                                                {t('إلغاء')}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {!accounts.data.length && (
                <div className="admin-empty">
                    <AdminIcon name="users" />
                    <h3>
                        {hasFilters
                            ? t('لا توجد حسابات مطابقة')
                            : students
                              ? t('لا توجد حسابات طلاب بعد')
                              : t('أضف أول مدرّس')}
                    </h3>
                    <p>
                        {hasFilters
                            ? t('جرّب اسمًا آخر أو اختر كل الحالات.')
                            : students
                              ? t(
                                    'ستظهر حسابات الطلاب هنا بعد تسجيلهم في المنصة.',
                                )
                              : t('أنشئ الحساب باستخدام النموذج أعلاه.')}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            className="admin-button admin-filter-button"
                            disabled={busy}
                            onClick={clearFilters}
                        >
                            {t('عرض كل الحسابات')}
                        </button>
                    )}
                </div>
            )}
            <div className="admin-table-footer admin-account-footer">
                <span>
                    {accounts.total
                        ? t('عرض {0}–{1} من {2} {3}', {
                              0: number(accounts.from),
                              1: number(accounts.to),
                              2: number(accounts.total),
                              3: students ? t('طالبًا') : t('مدرّسًا'),
                          })
                        : t('لا توجد حسابات للعرض')}
                </span>
                <nav
                    className="admin-pagination"
                    aria-label={
                        students ? t('صفحات الطلاب') : t('صفحات المدرّسين')
                    }
                >
                    {[
                        {
                            href: accounts.prev_page_url,
                            text: t('السابق'),
                        },
                        {
                            text: t('صفحة {0} من {1}', {
                                0: number(accounts.current_page),
                                1: number(accounts.last_page),
                            }),
                        },
                        {
                            href: accounts.next_page_url,
                            text: t('التالي'),
                        },
                    ].map((item, index) =>
                        index === 1 ? (
                            <span key={index}>{item.text}</span>
                        ) : item.href && !busy ? (
                            <Link
                                key={index}
                                className="admin-pagination-link"
                                href={item.href}
                                preserveScroll
                                preserveState
                                onSuccess={() => setPanel(null)}
                            >
                                {item.text}
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className="admin-pagination-link admin-pagination-disabled"
                                aria-disabled="true"
                            >
                                {item.text}
                            </span>
                        ),
                    )}
                </nav>
            </div>
        </section>
    );
}
