import { Head, Link, useForm } from '@inertiajs/react';
import '../../../../css/admin-questions.css';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import AdminIcon from '../../../Components/AdminIcon';
import FlashMessages from '../../../Components/FlashMessages';
import QuestionEditor from '../../../Components/AdminQuestions/QuestionEditor';
import QuestionImport from '../../../Components/AdminQuestions/QuestionImport';
import QuestionPreview, {
    choices,
    number,
} from '../../../Components/AdminQuestions/QuestionPreview';
import QuestionDelete from '../../../Components/AdminQuestions/QuestionDelete';

export default function QuestionsIndex({
    subject,
    questions,
    filters = {},
    importPreview = null,
}) {
    const search = useForm({ search: filters.search || '' });
    const [mode, setMode] = useState(importPreview ? 'import' : 'editor');
    const [editing, setEditing] = useState(null);
    const [previewing, setPreviewing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [returnMode, setReturnMode] = useState('editor');
    const [busy, setBusy] = useState(false);
    const [editorVersion, setEditorVersion] = useState(0);
    const pane = useRef(null);
    const listContext = {
        list_search: filters.search || '',
        list_page: questions.current_page,
    };
    const selectedId =
        mode === 'editor'
            ? editing?.id
            : mode === 'preview'
              ? previewing?.id
              : mode === 'delete'
                ? deleting?.id
                : null;
    useEffect(() => {
        search.setData('search', filters.search || '');
    }, [filters.search]);
    const openPane = (nextMode) => {
        setMode(nextMode);
        requestAnimationFrame(() => {
            if (window.innerWidth < 1200)
                pane.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            pane.current?.focus({ preventScroll: true });
        });
    };
    const edit = (question) => {
        setEditing(question);
        openPane('editor');
    };
    const add = () => {
        setEditing(null);
        setEditorVersion((version) => version + 1);
        openPane('editor');
    };
    const remove = (question) => {
        setDeleting(question);
        setReturnMode(mode);
        openPane('delete');
    };
    const submitSearch = (event) => {
        event.preventDefault();
        search.get(route('admin.questions.index', { subject: subject.id }), {
            preserveState: true,
            preserveScroll: true,
        });
    };
    return (
        <AdminLayout activeNav="subjects" breadcrumb="إدارة الأسئلة">
            <Head title={`أسئلة ${subject.name}`} />
            <div className="admin-page-heading admin-question-page-heading">
                <div>
                    <div className="admin-question-title">
                        <h1>إدارة الأسئلة</h1>
                        <span className="admin-total-questions">
                            {number(subject.questions_count)} سؤالًا
                        </span>
                    </div>
                    <p>
                        {subject.name} · المستوى {subject.level}
                    </p>
                </div>
                <div className="admin-question-toolbar">
                    <button
                        type="button"
                        className="admin-button admin-excel-button"
                        onClick={() => openPane('import')}
                        disabled={busy}
                    >
                        <AdminIcon name="upload" />
                        استيراد من Excel
                        {importPreview && (
                            <span
                                className="admin-pending-dot"
                                aria-label="يوجد ملف قيد المعاينة"
                            />
                        )}
                    </button>
                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={add}
                        disabled={busy}
                    >
                        <AdminIcon name="plus" />
                        إضافة سؤال
                    </button>
                </div>
            </div>
            <FlashMessages />
            <div className="admin-question-workspace">
                <section
                    className="admin-panel admin-question-list"
                    aria-labelledby="question-list-title"
                >
                    <div className="admin-question-list-heading">
                        <h2 id="question-list-title">قائمة الأسئلة</h2>
                        <Link
                            href={route('admin.subjects.index')}
                            className="admin-back-subjects"
                        >
                            المقررات
                            <AdminIcon name="arrow" />
                        </Link>
                    </div>
                    <form
                        onSubmit={submitSearch}
                        className="admin-question-search"
                    >
                        <label className="admin-search">
                            <AdminIcon name="search" />
                            <input
                                aria-label="البحث بنص السؤال"
                                placeholder="البحث في أسئلة المقرر"
                                maxLength={1000}
                                value={search.data.search}
                                onChange={(e) =>
                                    search.setData('search', e.target.value)
                                }
                                disabled={busy || search.processing}
                            />
                        </label>
                        <button
                            type="submit"
                            className="admin-button admin-subject-search-button"
                            disabled={busy || search.processing}
                        >
                            {search.processing ? 'جارٍ البحث…' : 'بحث'}
                        </button>
                        {filters.search && (
                            <Link
                                href={route('admin.questions.index', {
                                    subject: subject.id,
                                })}
                                preserveState
                                preserveScroll
                                className="admin-subject-reset"
                            >
                                مسح البحث
                            </Link>
                        )}
                    </form>
                    {search.errors.search && (
                        <p className="admin-field-error" role="alert">
                            {search.errors.search}
                        </p>
                    )}
                    <div className="admin-question-table-scroll">
                        <table className="admin-question-table">
                            <caption className="sr-only">
                                أسئلة المقرر والإجابات الصحيحة وإجراءات الإدارة
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">السؤال</th>
                                    <th scope="col">الإجابة الصحيحة</th>
                                    <th scope="col">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.data.map((question, index) => {
                                    const correct = choices.find(
                                        (choice) =>
                                            choice.key ===
                                            question.correct_answer,
                                    );
                                    return (
                                        <tr
                                            key={question.id}
                                            className={
                                                selectedId === question.id
                                                    ? 'is-selected'
                                                    : ''
                                            }
                                        >
                                            <th scope="row">
                                                <div className="admin-question-cell">
                                                    <span className="admin-row-number">
                                                        {number(
                                                            questions.from +
                                                                index,
                                                        ).padStart(2, '0')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="admin-question-text-button"
                                                        title={
                                                            question.question_text
                                                        }
                                                        onClick={() => {
                                                            setPreviewing(
                                                                question,
                                                            );
                                                            openPane('preview');
                                                        }}
                                                        disabled={busy}
                                                    >
                                                        <span dir="auto">
                                                            {
                                                                question.question_text
                                                            }
                                                        </span>
                                                    </button>
                                                </div>
                                            </th>
                                            <td>
                                                <span
                                                    className="admin-correct-answer-badge"
                                                    title={
                                                        question[correct?.field]
                                                    }
                                                >
                                                    <span>
                                                        {correct?.label}
                                                    </span>
                                                    <span dir="auto">
                                                        {
                                                            question[
                                                                correct?.field
                                                            ]
                                                        }
                                                    </span>
                                                </span>
                                            </td>
                                            <td>
                                                <div className="admin-row-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-edit-link"
                                                        title="معاينة السؤال"
                                                        aria-label={`معاينة السؤال ${question.id}`}
                                                        disabled={busy}
                                                        onClick={() => {
                                                            setPreviewing(
                                                                question,
                                                            );
                                                            openPane('preview');
                                                        }}
                                                    >
                                                        <AdminIcon name="eye" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`admin-edit-link${mode === 'editor' && editing?.id === question.id ? ' is-active' : ''}`}
                                                        title="تعديل السؤال"
                                                        aria-label={`تعديل السؤال ${question.id}`}
                                                        disabled={busy}
                                                        onClick={() =>
                                                            edit(question)
                                                        }
                                                    >
                                                        <AdminIcon name="edit" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-edit-link admin-delete-subject"
                                                        title="حذف السؤال"
                                                        aria-label={`حذف السؤال ${question.id}`}
                                                        disabled={busy}
                                                        onClick={() =>
                                                            remove(question)
                                                        }
                                                    >
                                                        <AdminIcon name="trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!questions.data.length && (
                        <div className="admin-empty">
                            <AdminIcon name="question" />
                            <h3>
                                {filters.search
                                    ? 'لا توجد أسئلة مطابقة'
                                    : 'ابدأ بإضافة أول سؤال'}
                            </h3>
                            <p>
                                {filters.search
                                    ? 'جرّب كلمات أخرى أو امسح البحث.'
                                    : 'استخدم المحرر أو استورد أسئلة المقرر من Excel.'}
                            </p>
                            <button
                                type="button"
                                className="admin-button admin-filter-button"
                                onClick={add}
                                disabled={busy}
                            >
                                إضافة سؤال
                            </button>
                        </div>
                    )}
                    <div className="admin-table-footer admin-question-list-footer">
                        <span>
                            {questions.total
                                ? `عرض ${number(questions.from)} – ${number(questions.to)} من ${number(questions.total)} سؤالًا`
                                : 'لا توجد أسئلة للعرض'}
                        </span>
                        <nav
                            className="admin-pagination"
                            aria-label="صفحات الأسئلة"
                        >
                            {questions.prev_page_url ? (
                                <Link
                                    className="admin-pagination-link"
                                    href={questions.prev_page_url}
                                    preserveState
                                    preserveScroll
                                >
                                    السابق
                                </Link>
                            ) : (
                                <span className="admin-pagination-link admin-pagination-disabled">
                                    السابق
                                </span>
                            )}
                            <span>
                                صفحة {number(questions.current_page)} من{' '}
                                {number(questions.last_page)}
                            </span>
                            {questions.next_page_url ? (
                                <Link
                                    className="admin-pagination-link"
                                    href={questions.next_page_url}
                                    preserveState
                                    preserveScroll
                                >
                                    التالي
                                </Link>
                            ) : (
                                <span className="admin-pagination-link admin-pagination-disabled">
                                    التالي
                                </span>
                            )}
                        </nav>
                    </div>
                    <div className="admin-question-list-note">
                        <AdminIcon name="question" />
                        حذف السؤال يتطلب تأكيدًا داخل مساحة المحرر.
                    </div>
                </section>
                <div
                    ref={pane}
                    tabIndex={-1}
                    className="admin-question-pane-slot"
                >
                    <QuestionEditor
                        key={`${subject.id}-${editorVersion}`}
                        subject={subject}
                        question={editing}
                        hidden={mode !== 'editor'}
                        busy={busy}
                        listContext={listContext}
                        onBusy={setBusy}
                        onSaved={() => setEditing(null)}
                        onCancel={() => setEditing(null)}
                    />
                    <QuestionImport
                        subject={subject}
                        preview={importPreview}
                        hidden={mode !== 'import'}
                        listContext={listContext}
                        busy={busy}
                        onBusy={setBusy}
                        onClose={() => setMode('editor')}
                    />
                    {mode === 'preview' && (
                        <QuestionPreview
                            key={previewing.id}
                            question={previewing}
                            busy={busy}
                            onClose={() => setMode('editor')}
                            onEdit={edit}
                        />
                    )}
                    {mode === 'delete' && (
                        <QuestionDelete
                            subject={subject}
                            question={deleting}
                            listContext={listContext}
                            busy={busy}
                            onBusy={setBusy}
                            onClose={() => setMode(returnMode)}
                            onDeleted={() => {
                                if (editing?.id === deleting.id)
                                    setEditing(null);
                                if (previewing?.id === deleting.id)
                                    setPreviewing(null);
                                setDeleting(null);
                                setMode('editor');
                            }}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
