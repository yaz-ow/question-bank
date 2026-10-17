import {
    adminText as t,
    translateAdminFeedback as feedback,
    adminDirection,
} from '../../../i18n/admin';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminIcon from '../../../Components/AdminIcon';
import FlashMessages from '../../../Components/FlashMessages';
const number = (value) => new Intl.NumberFormat('en-US').format(value);
function LevelOptions() {
    return Array.from(
        {
            length: 9,
        },
        (_, i) => (
            <option key={i + 1} value={i + 1}>
                {t('المستوى ')}
                {i + 1}
            </option>
        ),
    );
}
function EditSubjectRow({ subject, onClose, onBusy, busy }) {
    const form = useForm({
        name: subject.name,
        level: subject.level,
    });
    const input = useRef(null);
    const formId = `edit-subject-${subject.id}`;
    useEffect(() => {
        input.current?.focus();
        input.current?.select();
    }, []);
    const submit = (event) => {
        event.preventDefault();
        if (busy) return;
        form.put(route('admin.subjects.update', subject.id), {
            errorBag: 'editSubject',
            preserveScroll: true,
            onStart: () => onBusy(true),
            onFinish: () => onBusy(false),
            onSuccess: onClose,
        });
    };
    return (
        <tr className="admin-subject-editing">
            <th scope="row">
                <form id={formId} onSubmit={submit}>
                    <label
                        className="admin-edit-label"
                        htmlFor={`${formId}-name`}
                    >
                        {t('تعديل المقرر')}
                    </label>
                    <input
                        ref={input}
                        id={`${formId}-name`}
                        className="admin-subject-input"
                        required
                        maxLength={255}
                        aria-label={t('اسم المقرر الجديد')}
                        aria-invalid={!!form.errors.name}
                        aria-describedby={
                            form.errors.name
                                ? `${formId}-name-error`
                                : undefined
                        }
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        disabled={form.processing}
                    />
                    {form.errors.name && (
                        <p
                            className="admin-field-error"
                            id={`${formId}-name-error`}
                            role="alert"
                        >
                            {feedback(form.errors.name)}
                        </p>
                    )}
                </form>
            </th>
            <td>
                <select
                    form={formId}
                    className="admin-subject-input"
                    aria-label={t('المستوى الجديد')}
                    required
                    aria-invalid={!!form.errors.level}
                    aria-describedby={
                        form.errors.level ? `${formId}-level-error` : undefined
                    }
                    value={form.data.level}
                    onChange={(e) => form.setData('level', e.target.value)}
                    disabled={form.processing}
                >
                    <LevelOptions />
                </select>
                {form.errors.level && (
                    <p
                        className="admin-field-error"
                        id={`${formId}-level-error`}
                        role="alert"
                    >
                        {feedback(form.errors.level)}
                    </p>
                )}
            </td>
            <td className="admin-question-count">
                {number(subject.questions_count)}
            </td>
            <td>
                <div className="admin-row-actions">
                    <Link
                        className="admin-question-link"
                        href={route('admin.questions.index', subject.id)}
                    >
                        {t('إدارة الأسئلة')}
                    </Link>
                    <button
                        type="submit"
                        form={formId}
                        className="admin-edit-link admin-save-edit"
                        aria-label={t('حفظ تعديل مقرر {0}', {
                            0: subject.name,
                        })}
                        title={t('حفظ التعديل')}
                        disabled={busy}
                    >
                        <AdminIcon name="tick" />
                    </button>
                    <button
                        type="button"
                        className="admin-edit-link"
                        aria-label={t('إلغاء التعديل')}
                        title={t('إلغاء التعديل')}
                        disabled={busy}
                        onClick={onClose}
                    >
                        <AdminIcon name="close" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
function DeleteSubjectDialog({ subject, onClose, onBusy }) {
    const dialog = useRef(null);
    const cancel = useRef(null);
    const form = useForm({});
    useEffect(() => {
        const element = dialog.current;
        element.showModal();
        cancel.current?.focus();
        return () => element.close();
    }, []);
    const remove = (event) => {
        event.preventDefault();
        if (form.processing) return;
        form.delete(route('admin.subjects.destroy', subject.id), {
            errorBag: 'deleteSubject',
            preserveScroll: true,
            onStart: () => onBusy(true),
            onFinish: () => onBusy(false),
            onSuccess: onClose,
        });
    };
    return (
        <dialog
            ref={dialog}
            className="admin-delete-dialog"
            dir={adminDirection()}
            aria-labelledby="delete-subject-title"
            aria-describedby="delete-subject-warning"
            onCancel={(event) => {
                event.preventDefault();
                if (!form.processing) onClose();
            }}
        >
            <form onSubmit={remove}>
                <div className="admin-delete-symbol">
                    <AdminIcon name="trash" />
                </div>
                <h2 id="delete-subject-title">{t('حذف المقرر؟')}</h2>
                <p>
                    {t('أنت على وشك حذف المقرر ')}
                    <strong>«{subject.name}»</strong>.
                </p>
                <p id="delete-subject-warning">
                    {t('سيتم حذف أسئلته (')}
                    {number(subject.questions_count)}
                    {t(
                        ') ومحاولات الطلاب ونتائجها المرتبطة به نهائيًا. لا يمكن التراجع عن هذا الإجراء.',
                    )}
                </p>
                {Object.values(form.errors).map((error, i) => (
                    <p key={i} className="admin-field-error" role="alert">
                        {feedback(error)}
                    </p>
                ))}
                <div className="admin-dialog-actions">
                    <button
                        ref={cancel}
                        type="button"
                        className="admin-button admin-cancel-delete"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        {t('إلغاء')}
                    </button>
                    <button
                        type="submit"
                        className="admin-button admin-confirm-delete"
                        disabled={form.processing}
                    >
                        {form.processing
                            ? t('جارٍ الحذف…')
                            : t('حذف المقرر نهائيًا')}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
export default function SubjectIndex({ subjects, filters = {} }) {
    const { url } = usePage();
    const create = useForm({
        name: '',
        level: '',
    });
    const filter = useForm({
        search: filters.search || '',
        level: filters.level || '',
    });
    const [editingId, setEditingId] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [rowBusy, setRowBusy] = useState(false);
    const nameInput = useRef(null);
    const heading = useRef(null);
    const busy = rowBusy || create.processing;
    const hasFilters = !!(filters.search || filters.level);
    useEffect(() => {
        filter.setData({
            search: filters.search || '',
            level: filters.level || '',
        });
    }, [filters.search, filters.level]);
    useEffect(() => {
        const id = Number(
            new URL(url, 'http://localhost').searchParams.get('edit'),
        );
        if (id) setEditingId(id);
    }, [url]);
    useEffect(() => {
        if (window.location.hash === '#add-subject') nameInput.current?.focus();
    }, []);
    const closeEdit = () => {
        const id = editingId;
        setEditingId(null);
        requestAnimationFrame(() =>
            document.getElementById(`edit-button-${id}`)?.focus(),
        );
    };
    const closeDelete = () => {
        const id = deleting.id;
        setDeleting(null);
        requestAnimationFrame(() => {
            const button = document.getElementById(`delete-button-${id}`);
            (button || heading.current)?.focus();
        });
    };
    const add = (event) => {
        event.preventDefault();
        if (busy) return;
        create.post(route('admin.subjects.store'), {
            errorBag: 'createSubject',
            preserveScroll: true,
            onSuccess: () => {
                create.reset();
                setEditingId(null);
                nameInput.current?.focus();
            },
        });
    };
    const search = (event) => {
        event.preventDefault();
        filter.get(route('admin.subjects.index'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };
    return (
        <AdminLayout activeNav="subjects" breadcrumb={t('إدارة المقررات')}>
            <Head title={t('إدارة المقررات')} />
            <div className="admin-page-heading">
                <div>
                    <h1 ref={heading} tabIndex={-1}>
                        {t('إدارة المقررات')}
                    </h1>
                    <p>
                        {t(
                            'إضافة المقررات وتعديلها وإدارة أسئلتها من مكان واحد.',
                        )}
                    </p>
                </div>
            </div>
            <FlashMessages translate={feedback} />
            <section
                className="admin-panel admin-subject-create"
                id="add-subject"
                aria-labelledby="add-subject-title"
            >
                <div className="admin-subject-panel-title">
                    <h2 id="add-subject-title">{t('إضافة مقرر جديد')}</h2>
                </div>
                <form className="admin-subject-add-form" onSubmit={add}>
                    <div className="admin-subject-field">
                        <label htmlFor="new-subject-name">
                            {t('اسم المقرر')}
                        </label>
                        <input
                            ref={nameInput}
                            id="new-subject-name"
                            className="admin-subject-input"
                            placeholder={t('أدخل اسم المقرر')}
                            required
                            maxLength={255}
                            aria-invalid={!!create.errors.name}
                            aria-describedby={
                                create.errors.name
                                    ? 'new-subject-name-error'
                                    : undefined
                            }
                            value={create.data.name}
                            onChange={(e) =>
                                create.setData('name', e.target.value)
                            }
                            disabled={busy}
                        />
                        {create.errors.name && (
                            <p
                                className="admin-field-error"
                                id="new-subject-name-error"
                                role="alert"
                            >
                                {feedback(create.errors.name)}
                            </p>
                        )}
                    </div>
                    <div className="admin-subject-field">
                        <label htmlFor="new-subject-level">
                            {t('المستوى')}
                        </label>
                        <select
                            id="new-subject-level"
                            className="admin-subject-input"
                            required
                            aria-invalid={!!create.errors.level}
                            aria-describedby={
                                create.errors.level
                                    ? 'new-subject-level-error'
                                    : undefined
                            }
                            value={create.data.level}
                            onChange={(e) =>
                                create.setData('level', e.target.value)
                            }
                            disabled={busy}
                        >
                            <option value="" disabled>
                                {t('اختر المستوى')}
                            </option>
                            <LevelOptions />
                        </select>
                        {create.errors.level && (
                            <p
                                className="admin-field-error"
                                id="new-subject-level-error"
                                role="alert"
                            >
                                {feedback(create.errors.level)}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="admin-button admin-button-primary admin-add-subject-button"
                        disabled={busy}
                    >
                        <AdminIcon name="plus" />
                        {create.processing
                            ? t('جارٍ الإضافة…')
                            : t('إضافة المقرر')}
                    </button>
                </form>
            </section>
            <section
                className="admin-panel admin-subject-list"
                aria-labelledby="subject-list-title"
            >
                <div className="admin-subject-panel-title">
                    <h2 id="subject-list-title">{t('قائمة المقررات')}</h2>
                    <span>
                        {number(subjects.total)}
                        {t(' مقرر')}
                        {hasFilters ? t(' مطابق') : ''}
                    </span>
                </div>
                <form
                    className="admin-course-filters admin-subject-filters"
                    onSubmit={search}
                >
                    <label className="admin-search">
                        <AdminIcon name="search" />
                        <input
                            aria-label={t('البحث باسم المقرر')}
                            placeholder={t('البحث باسم المقرر')}
                            maxLength={255}
                            value={filter.data.search}
                            onChange={(e) =>
                                filter.setData('search', e.target.value)
                            }
                            disabled={busy || filter.processing}
                        />
                    </label>
                    <select
                        aria-label={t('تصفية حسب المستوى')}
                        value={filter.data.level}
                        onChange={(e) =>
                            filter.setData('level', e.target.value)
                        }
                        disabled={busy || filter.processing}
                    >
                        <option value="">{t('جميع المستويات')}</option>
                        <LevelOptions />
                    </select>
                    <button
                        type="submit"
                        className="admin-button admin-subject-search-button"
                        disabled={busy || filter.processing}
                    >
                        {filter.processing ? t('جارٍ البحث…') : t('بحث')}
                    </button>
                    {hasFilters && (
                        <Link
                            className="admin-subject-reset"
                            href={route('admin.subjects.index')}
                            preserveScroll
                        >
                            {t('مسح الفلاتر')}
                        </Link>
                    )}
                </form>
                {Object.values(filter.errors).map((error, i) => (
                    <p key={i} className="admin-field-error" role="alert">
                        {feedback(error)}
                    </p>
                ))}
                <div className="admin-table-scroll">
                    <table className="admin-table admin-subject-table">
                        <caption className="sr-only">
                            {t(
                                'المقررات ومستوياتها وعدد الأسئلة وإجراءات الإدارة',
                            )}
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">{t('المقرر')}</th>
                                <th scope="col">{t('المستوى')}</th>
                                <th scope="col">{t('عدد الأسئلة')}</th>
                                <th scope="col">{t('الإجراءات')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.data.map((subject) =>
                                editingId === subject.id ? (
                                    <EditSubjectRow
                                        key={subject.id}
                                        subject={subject}
                                        onClose={closeEdit}
                                        onBusy={setRowBusy}
                                        busy={busy}
                                    />
                                ) : (
                                    <tr key={subject.id}>
                                        <th scope="row">
                                            <Link
                                                href={route(
                                                    'admin.questions.index',
                                                    subject.id,
                                                )}
                                            >
                                                {subject.name}
                                            </Link>
                                        </th>
                                        <td>
                                            {t('المستوى ')}
                                            {subject.level}
                                        </td>
                                        <td className="admin-question-count">
                                            {number(subject.questions_count)}
                                        </td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <Link
                                                    className="admin-question-link"
                                                    href={route(
                                                        'admin.questions.index',
                                                        subject.id,
                                                    )}
                                                >
                                                    {t('إدارة الأسئلة')}
                                                </Link>
                                                <button
                                                    id={`edit-button-${subject.id}`}
                                                    type="button"
                                                    className="admin-edit-link"
                                                    title={t(
                                                        'تعديل الاسم والمستوى',
                                                    )}
                                                    aria-label={t(
                                                        'تعديل مقرر {0}',
                                                        {
                                                            0: subject.name,
                                                        },
                                                    )}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        setEditingId(subject.id)
                                                    }
                                                >
                                                    <AdminIcon name="edit" />
                                                </button>
                                                <button
                                                    id={`delete-button-${subject.id}`}
                                                    type="button"
                                                    className="admin-edit-link admin-delete-subject"
                                                    title={t('حذف المقرر')}
                                                    aria-label={t(
                                                        'حذف مقرر {0}',
                                                        {
                                                            0: subject.name,
                                                        },
                                                    )}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        setDeleting(subject)
                                                    }
                                                >
                                                    <AdminIcon name="trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
                {!subjects.data.length && (
                    <div className="admin-empty">
                        <AdminIcon name="book" />
                        <h3>
                            {hasFilters
                                ? t('لا توجد مقررات مطابقة')
                                : t('ابدأ بإضافة أول مقرر')}
                        </h3>
                        <p>
                            {hasFilters
                                ? t('جرّب اسمًا آخر أو اختر جميع المستويات.')
                                : t(
                                      'أدخل اسم المقرر ومستواه في النموذج أعلاه.',
                                  )}
                        </p>
                        {hasFilters ? (
                            <Link
                                className="admin-button admin-filter-button"
                                href={route('admin.subjects.index')}
                                preserveScroll
                            >
                                {t('عرض جميع المقررات')}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="admin-button admin-filter-button"
                                onClick={() => nameInput.current?.focus()}
                            >
                                {t('إضافة أول مقرر')}
                            </button>
                        )}
                    </div>
                )}
                <div className="admin-table-footer admin-subject-footer">
                    <span>
                        {subjects.total
                            ? t('عرض {0} – {1} من {2} مقرر', {
                                  0: number(subjects.from),
                                  1: number(subjects.to),
                                  2: number(subjects.total),
                              })
                            : t('لا توجد مقررات للعرض')}
                    </span>
                    <span className="admin-delete-note">
                        <AdminIcon name="question" />
                        {t(' حذف المقرر يتطلب تأكيدًا')}
                    </span>
                    <nav
                        className="admin-pagination"
                        aria-label={t('صفحات المقررات')}
                    >
                        {subjects.prev_page_url ? (
                            <Link
                                className="admin-pagination-link"
                                href={subjects.prev_page_url}
                                preserveScroll
                            >
                                {t('السابق')}
                            </Link>
                        ) : (
                            <span
                                className="admin-pagination-link admin-pagination-disabled"
                                aria-disabled="true"
                            >
                                {t('السابق')}
                            </span>
                        )}
                        <span>
                            {t('صفحة ')}
                            {number(subjects.current_page)}
                            {t(' من')} {number(subjects.last_page)}
                        </span>
                        {subjects.next_page_url ? (
                            <Link
                                className="admin-pagination-link"
                                href={subjects.next_page_url}
                                preserveScroll
                            >
                                {t('التالي')}
                            </Link>
                        ) : (
                            <span
                                className="admin-pagination-link admin-pagination-disabled"
                                aria-disabled="true"
                            >
                                {t('التالي')}
                            </span>
                        )}
                    </nav>
                </div>
            </section>
            {deleting && (
                <DeleteSubjectDialog
                    subject={deleting}
                    onClose={closeDelete}
                    onBusy={setRowBusy}
                />
            )}
        </AdminLayout>
    );
}
