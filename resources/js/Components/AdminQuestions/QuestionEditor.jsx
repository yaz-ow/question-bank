import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminIcon from '../AdminIcon';
import { choices, emptyQuestion, QuestionContent } from './QuestionPreview';

export default function QuestionEditor({
    subject,
    question,
    hidden,
    busy,
    listContext,
    onBusy,
    onSaved,
    onCancel,
}) {
    const form = useForm({ ...emptyQuestion });
    const text = useRef(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    useEffect(() => {
        const values = Object.fromEntries(
            Object.keys(emptyQuestion).map((key) => [
                key,
                question?.[key] || '',
            ]),
        );
        form.setDefaults(values);
        form.setData(values);
        form.clearErrors();
        setPreviewOpen(false);
        if (question) requestAnimationFrame(() => text.current?.focus());
    }, [question?.id]);
    const submit = (event) => {
        event.preventDefault();
        if (busy) return;
        const options = {
            errorBag: 'questionEditor',
            preserveScroll: true,
            onStart: () => onBusy(true),
            onFinish: () => onBusy(false),
            onSuccess: () => {
                form.setDefaults({ ...emptyQuestion });
                form.setData({ ...emptyQuestion });
                form.clearErrors();
                onSaved();
                text.current?.focus();
            },
        };
        form.transform((data) => ({ ...data, ...listContext }));
        if (question)
            form.put(
                route('admin.questions.update', {
                    subject: subject.id,
                    question: question.id,
                }),
                options,
            );
        else
            form.post(
                route('admin.questions.store', { subject: subject.id }),
                options,
            );
    };
    const error = (field) =>
        form.errors[field] && (
            <p
                className="admin-field-error"
                role="alert"
                id={`question-${field}-error`}
            >
                {form.errors[field]}
            </p>
        );
    return (
        <section
            hidden={hidden}
            className="admin-panel admin-question-pane admin-question-editor"
            aria-labelledby="question-editor-title"
            id="question-editor"
        >
            <div className="admin-question-pane-heading">
                <h2 id="question-editor-title">
                    <AdminIcon name={question ? 'edit' : 'plus'} />
                    {question ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
                </h2>
                {question && (
                    <span className="admin-question-id">#{question.id}</span>
                )}
            </div>
            <p className="admin-pane-hint">
                {question
                    ? 'عدّل السؤال وخياراته ثم احفظ التغييرات.'
                    : 'أدخل السؤال وخياراته وحدّد الإجابة الصحيحة.'}
            </p>
            <form onSubmit={submit}>
                <div className="admin-question-field">
                    <label htmlFor="question-text">نص السؤال</label>
                    <textarea
                        ref={text}
                        id="question-text"
                        className="admin-subject-input"
                        rows={3}
                        required
                        dir="auto"
                        placeholder="اكتب نص السؤال هنا…"
                        value={form.data.question_text}
                        onChange={(e) =>
                            form.setData('question_text', e.target.value)
                        }
                        disabled={busy}
                        aria-invalid={!!form.errors.question_text}
                        aria-describedby={
                            form.errors.question_text
                                ? 'question-question_text-error'
                                : undefined
                        }
                    />
                    {error('question_text')}
                </div>
                <fieldset className="admin-answer-fields" disabled={busy}>
                    <legend>خيارات الإجابة</legend>
                    <p className="admin-pane-hint">
                        حدّد الإجابة الصحيحة بجانب الخيار.
                    </p>
                    {choices.map((choice) => (
                        <div key={choice.key} className="admin-option-field">
                            <div
                                className={`admin-option-input${form.data.correct_answer === choice.key ? ' is-correct' : ''}`}
                            >
                                <label
                                    htmlFor={`question-${choice.field}`}
                                    className="admin-choice-letter"
                                >
                                    {choice.label}
                                </label>
                                <textarea
                                    id={`question-${choice.field}`}
                                    rows={1}
                                    className="admin-subject-input"
                                    required
                                    maxLength={255}
                                    dir="auto"
                                    aria-label={`الخيار ${choice.label}`}
                                    aria-invalid={!!form.errors[choice.field]}
                                    aria-describedby={
                                        form.errors[choice.field]
                                            ? `question-${choice.field}-error`
                                            : undefined
                                    }
                                    value={form.data[choice.field]}
                                    onChange={(e) =>
                                        form.setData(
                                            choice.field,
                                            e.target.value,
                                        )
                                    }
                                />
                                <input
                                    type="radio"
                                    name="correct_answer"
                                    value={choice.key}
                                    required
                                    aria-label={`تحديد الخيار ${choice.label} إجابة صحيحة`}
                                    checked={
                                        form.data.correct_answer === choice.key
                                    }
                                    onChange={() =>
                                        form.setData(
                                            'correct_answer',
                                            choice.key,
                                        )
                                    }
                                />
                            </div>
                            {form.data.correct_answer === choice.key && (
                                <span className="admin-correct-hint">
                                    الإجابة الصحيحة
                                </span>
                            )}
                            {error(choice.field)}
                        </div>
                    ))}
                    {error('correct_answer')}
                </fieldset>
                <div className="admin-pane-actions">
                    <button
                        type="submit"
                        className="admin-button admin-button-primary"
                        disabled={busy}
                    >
                        <AdminIcon name="tick" />
                        {form.processing
                            ? 'جارٍ الحفظ…'
                            : question
                              ? 'حفظ التعديلات'
                              : 'إضافة السؤال'}
                    </button>
                    <button
                        type="button"
                        className="admin-button admin-secondary-button"
                        disabled={busy}
                        onClick={() => {
                            form.reset();
                            form.clearErrors();
                            setPreviewOpen(false);
                            onCancel();
                        }}
                    >
                        {question ? 'إلغاء التعديل' : 'مسح الحقول'}
                    </button>
                </div>
            </form>
            <button
                type="button"
                className="admin-draft-preview-toggle"
                aria-expanded={previewOpen}
                aria-controls="draft-question-preview"
                onClick={() => setPreviewOpen(!previewOpen)}
            >
                <AdminIcon name="eye" />
                <span>
                    معاينة السؤال<small>كما يظهر للطالب</small>
                </span>
                <AdminIcon name="chevron" />
            </button>
            {previewOpen && (
                <div id="draft-question-preview">
                    <QuestionContent question={form.data} showAnswer={false} />
                </div>
            )}
        </section>
    );
}
