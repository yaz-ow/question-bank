import useStaffRoutes from '../../Support/useStaffRoutes';
import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../../i18n/admin';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import AdminIcon from '../AdminIcon';
import { choices, emptyQuestion } from './QuestionPreview';
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
    const staffRoute = useStaffRoutes();
    const form = useForm({
        ...emptyQuestion,
    });
    const text = useRef(null);
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
                form.setDefaults({
                    ...emptyQuestion,
                });
                form.setData({
                    ...emptyQuestion,
                });
                form.clearErrors();
                onSaved();
                text.current?.focus();
            },
        };
        form.transform((data) => ({
            ...data,
            ...listContext,
        }));
        if (question)
            form.put(
                staffRoute('questions.update', {
                    subject: subject.id,
                    question: question.id,
                }),
                options,
            );
        else
            form.post(
                staffRoute('questions.store', {
                    subject: subject.id,
                }),
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
                {feedback(form.errors[field])}
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
                    {question ? t('تعديل السؤال') : t('إضافة سؤال جديد')}
                </h2>
                {question && (
                    <span className="admin-question-id">#{question.id}</span>
                )}
            </div>
            <p className="admin-pane-hint">
                {question
                    ? t('عدّل السؤال وخياراته ثم احفظ التغييرات.')
                    : t('أدخل السؤال وخياراته وحدّد الإجابة الصحيحة.')}
            </p>
            <form onSubmit={submit}>
                <div className="admin-question-field">
                    <label htmlFor="question-text">{t('نص السؤال')}</label>
                    <textarea
                        ref={text}
                        id="question-text"
                        className="admin-subject-input"
                        rows={3}
                        maxLength={10000}
                        required
                        dir="auto"
                        placeholder={t('اكتب نص السؤال هنا…')}
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
                    <legend>{t('خيارات الإجابة')}</legend>
                    <p className="admin-pane-hint">
                        {t('حدّد الإجابة الصحيحة بجانب الخيار.')}
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
                                    aria-label={t('الخيار {0}', {
                                        0: choice.label,
                                    })}
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
                                    aria-label={t(
                                        'تحديد الخيار {0} إجابة صحيحة',
                                        {
                                            0: choice.label,
                                        },
                                    )}
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
                                    {t('الإجابة الصحيحة')}
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
                            ? t('جارٍ الحفظ…')
                            : question
                              ? t('حفظ التعديلات')
                              : t('إضافة السؤال')}
                    </button>
                    <button
                        type="button"
                        className="admin-button admin-secondary-button"
                        disabled={busy}
                        onClick={() => {
                            form.reset();
                            form.clearErrors();
                            onCancel();
                        }}
                    >
                        {question ? t('إلغاء التعديل') : t('مسح الحقول')}
                    </button>
                </div>
            </form>
        </section>
    );
}
