import { useForm } from '@inertiajs/react';
import AdminIcon from '../AdminIcon';

export default function QuestionDelete({
    subject,
    question,
    listContext,
    onClose,
    onDeleted,
    onBusy,
    busy,
}) {
    const form = useForm({ ...listContext });
    const remove = (event) => {
        event.preventDefault();
        if (busy) return;
        form.delete(
            route('admin.questions.destroy', {
                subject: subject.id,
                question: question.id,
            }),
            {
                errorBag: 'questionDelete',
                preserveScroll: true,
                onStart: () => onBusy(true),
                onFinish: () => onBusy(false),
                onSuccess: onDeleted,
            },
        );
    };
    return (
        <section
            className="admin-panel admin-question-pane admin-inline-delete"
            aria-labelledby="delete-question-title"
        >
            <div className="admin-delete-symbol">
                <AdminIcon name="trash" />
            </div>
            <h2 id="delete-question-title">حذف السؤال؟</h2>
            <p className="admin-pane-hint">
                راجع السؤال قبل تأكيد حذفه من بنك أسئلة هذا المقرر.
            </p>
            <p className="admin-full-question" dir="auto">
                {question.question_text}
            </p>
            <p className="admin-delete-warning">
                سيُحذف السؤال نهائيًا. لا يمكن التراجع عن الحذف.
            </p>
            {Object.values(form.errors).map((message, i) => (
                <p key={i} className="admin-field-error" role="alert">
                    {message}
                </p>
            ))}
            <form onSubmit={remove} className="admin-pane-actions">
                <button
                    type="submit"
                    className="admin-button admin-confirm-delete"
                    disabled={busy}
                >
                    {form.processing ? 'جارٍ الحذف…' : 'تأكيد حذف السؤال'}
                </button>
                <button
                    type="button"
                    className="admin-button admin-secondary-button"
                    onClick={onClose}
                    disabled={busy}
                >
                    إلغاء الحذف
                </button>
            </form>
        </section>
    );
}
