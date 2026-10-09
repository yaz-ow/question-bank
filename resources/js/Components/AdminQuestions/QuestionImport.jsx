import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminIcon from '../AdminIcon';
import { choices, number } from './QuestionPreview';

export default function QuestionImport({
    subject,
    preview,
    hidden,
    listContext,
    busy,
    onBusy,
    onClose,
}) {
    const upload = useForm({ file: null });
    const confirm = useForm({});
    const cancel = useForm({});
    const file = useRef(null);
    const scroll = useRef(null);
    const [now, setNow] = useState(Date.now());
    const [uploadName, setUploadName] = useState('');
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        if (scroll.current) scroll.current.scrollTop = 0;
        confirm.clearErrors();
        cancel.clearErrors();
    }, [preview?.token]);
    const expired = preview && new Date(preview.expiresAt).getTime() <= now;
    const canConfirm =
        preview &&
        preview.validCount > 0 &&
        preview.errorCount === 0 &&
        !expired;
    const choose = (event) => {
        const selected = event.target.files?.[0];
        if (!selected || busy) return;
        upload.clearErrors();
        confirm.clearErrors();
        cancel.clearErrors();
        setUploadName(selected.name);
        upload.transform(() => ({ file: selected, ...listContext }));
        upload.post(
            route('admin.questions.upload.preview', {
                subject: subject.id,
            }),
            {
                errorBag: 'questionUpload',
                forceFormData: true,
                preserveScroll: true,
                onStart: () => onBusy(true),
                onFinish: () => {
                    onBusy(false);
                    if (file.current) file.current.value = '';
                },
            },
        );
    };
    const accept = (event) => {
        event.preventDefault();
        if (!canConfirm || busy) return;
        confirm.transform(() => ({ import_token: preview.token }));
        confirm.post(
            route('admin.questions.import.confirm', {
                subject: subject.id,
            }),
            {
                errorBag: 'questionImport',
                preserveScroll: true,
                onStart: () => onBusy(true),
                onFinish: () => onBusy(false),
                onSuccess: (page) => {
                    if (!page.props.importPreview) {
                        setUploadName('');
                        onClose();
                    }
                },
            },
        );
    };
    const cancelPreview = () => {
        if (busy) return;
        if (!preview) {
            upload.clearErrors();
            setUploadName('');
            onClose();
            return;
        }
        cancel.transform(() => ({
            import_token: preview.token,
            ...listContext,
        }));
        cancel.delete(
            route('admin.questions.import.cancel', { subject: subject.id }),
            {
                errorBag: 'questionImportCancel',
                preserveScroll: true,
                onStart: () => onBusy(true),
                onFinish: () => onBusy(false),
                onSuccess: () => {
                    upload.clearErrors();
                    setUploadName('');
                    onClose();
                },
            },
        );
    };
    const messages = [
        ...Object.values(upload.errors),
        ...Object.values(confirm.errors),
        ...Object.values(cancel.errors),
    ];
    return (
        <section
            hidden={hidden}
            className="admin-panel admin-question-pane admin-import-pane"
            aria-labelledby="import-preview-title"
        >
            <div className="admin-question-pane-heading">
                <h2 id="import-preview-title">
                    <AdminIcon name="file" />
                    فحص ملف Excel
                </h2>
            </div>
            <input
                ref={file}
                type="file"
                id="questions-file"
                className="sr-only"
                tabIndex={-1}
                accept=".xlsx,.xls,.csv"
                onChange={choose}
                disabled={busy}
                aria-label="اختيار ملف الأسئلة"
            />
            {upload.processing ? (
                <div className="admin-import-loading" role="status">
                    <AdminIcon name="file" />
                    <h3>جارٍ رفع الملف وفحصه…</h3>
                    <p dir="auto">{uploadName}</p>
                    {upload.progress && (
                        <progress
                            value={upload.progress.percentage}
                            max="100"
                            aria-label="تقدم رفع الملف"
                        />
                    )}
                </div>
            ) : preview ? (
                <>
                    <div className="admin-import-file">
                        <AdminIcon name="file" />
                        <div>
                            <strong dir="auto">{preview.filename}</strong>
                            <span>
                                {number(preview.totalCount)} سؤالًا في الملف
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => file.current?.click()}
                            disabled={busy}
                            className="admin-replace-file"
                        >
                            استبدال الملف
                        </button>
                    </div>
                    <div
                        className="admin-import-summary"
                        aria-label="نتيجة فحص الملف"
                    >
                        <span className="admin-import-ready">
                            <strong>{number(preview.validCount)}</strong> جديد
                        </span>
                        <span className="admin-import-duplicate">
                            <strong>{number(preview.duplicateCount)}</strong>{' '}
                            مكرر
                        </span>
                        <span
                            className={
                                preview.errorCount
                                    ? 'admin-import-error-count'
                                    : ''
                            }
                        >
                            <strong>{number(preview.errorCount)}</strong> خطأ
                        </span>
                    </div>
                    {preview.errorCount > 0 && (
                        <p className="admin-import-warning" role="alert">
                            صحّح الصفوف الموضحة أدناه وأعد رفع الملف. لن تُضاف
                            الأسئلة قبل تصحيح جميع الأخطاء.
                        </p>
                    )}
                    {preview.duplicateCount > 0 && (
                        <p className="admin-pane-hint">
                            سيتم تخطي الأسئلة المكررة دون إضافتها مرة أخرى.
                        </p>
                    )}
                    {expired && (
                        <p className="admin-import-warning" role="alert">
                            انتهت صلاحية المعاينة. أعد رفع الملف لفحصه من جديد.
                        </p>
                    )}
                    <p className="admin-import-scroll-hint">
                        <AdminIcon name="chevron" />
                        مرّر داخل البطاقة لفحص جميع الأسئلة
                    </p>
                    <div
                        ref={scroll}
                        className="admin-import-scroll"
                        role="region"
                        aria-label="أسئلة ملف Excel"
                        tabIndex={0}
                    >
                        {preview.rows.map((row) => (
                            <article
                                className={`admin-import-row is-${row.status}`}
                                key={row.line}
                            >
                                <div className="admin-import-row-heading">
                                    <span>صف Excel {number(row.line)}</span>
                                    <span>
                                        {row.status === 'error'
                                            ? 'يحتاج تصحيحًا'
                                            : row.status === 'duplicate'
                                              ? 'مكرر · سيُتخطى'
                                              : 'جاهز للاستيراد'}
                                    </span>
                                </div>
                                <h3 dir="auto">
                                    {row.question_text || 'نص السؤال غير موجود'}
                                </h3>
                                <ol className="admin-import-options">
                                    {choices.map((choice) => (
                                        <li
                                            key={choice.key}
                                            className={
                                                row.correct_answer ===
                                                choice.key
                                                    ? 'is-correct'
                                                    : ''
                                            }
                                        >
                                            <span>{choice.label}</span>
                                            <span dir="auto">
                                                {row[choice.field] ||
                                                    'الخيار غير موجود'}
                                            </span>
                                            {row.correct_answer ===
                                                choice.key && (
                                                <AdminIcon name="tick" />
                                            )}
                                        </li>
                                    ))}
                                </ol>
                                {row.errors.length > 0 && (
                                    <ul className="admin-import-row-errors">
                                        {row.errors.map((error, i) => (
                                            <li key={i}>{error}</li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        ))}
                    </div>
                </>
            ) : (
                <div className="admin-import-empty">
                    <div className="admin-excel-symbol">
                        <AdminIcon name="file" />
                    </div>
                    <h3>اختر ملف الأسئلة لفحصه</h3>
                    <p>
                        ستظهر الأسئلة هنا مع الخيارات والإجابة الصحيحة قبل تأكيد
                        إضافتها.
                    </p>
                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => file.current?.click()}
                        disabled={busy}
                    >
                        <AdminIcon name="upload" />
                        اختيار ملف Excel
                    </button>
                    <small>Excel أو CSV · حتى 5 MB و1000 سؤال</small>
                    <a
                        href={route('admin.questions.download.template', {
                            subject: subject.id,
                        })}
                        download
                        className="admin-import-template-link"
                    >
                        <AdminIcon name="download" />
                        تحميل قالب Excel
                    </a>
                    <p className="admin-template-help">
                        القالب يحتوي مثالًا للتعبئة؛ استبدله بأسئلتك. حدّد
                        الإجابة الصحيحة بالحروف A أو B أو C أو D.
                    </p>
                </div>
            )}
            <div className="admin-import-footer">
                {messages.map((message, i) => (
                    <p key={i} className="admin-field-error" role="alert">
                        {message}
                    </p>
                ))}
                <form onSubmit={accept} className="admin-pane-actions">
                    <button
                        type="submit"
                        className="admin-button admin-button-primary"
                        disabled={busy || !canConfirm}
                    >
                        <AdminIcon name="tick" />
                        {confirm.processing
                            ? 'جارٍ الاستيراد…'
                            : `تأكيد استيراد${preview ? ` ${number(preview.validCount)} سؤالًا` : ''}`}
                    </button>
                    <button
                        type="button"
                        className="admin-button admin-secondary-button"
                        onClick={cancelPreview}
                        disabled={busy}
                    >
                        {cancel.processing ? 'جارٍ الإلغاء…' : 'إلغاء'}
                    </button>
                </form>
                {preview && !expired && (
                    <small>المعاينة متاحة لمدة 15 دقيقة من رفع الملف.</small>
                )}
            </div>
        </section>
    );
}
