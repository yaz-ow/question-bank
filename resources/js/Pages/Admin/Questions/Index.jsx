import { Link, router, useForm } from '@inertiajs/react';
import FlashMessages from '../../../Components/FlashMessages';

export default function QuestionsIndex({ subject, questions, filters = {} }) {
    const { data, setData, get, processing } = useForm({ search: filters.search || '' });

    const handleDelete = (question) => {
        if (window.confirm(`هل تريد حذف السؤال «${question.question_text.substring(0, 30)}...»؟`)) {
            router.delete(route('admin.questions.destroy', { subject: subject.id, id: question.id }));
        }
    };

    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">إدارة الأسئلة - {subject.name} (المستوى {subject.level})</h1>
            <div className="flex space-x-3">
                <Link
                    href={route('admin.questions.create', { subject: subject.id })}
                    className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
                >
                    إنشاء سؤال جديد
                </Link>
                <a
                    href={route('admin.questions.download.template', { subject: subject.id })}
                    className="rounded bg-green-700 px-4 py-2 text-sm text-white"
                    download
                >
                    تحميل القالب
                </a>
                <Link
                    href={route('admin.subjects.index')}
                    className="px-3"
                >
                    العودة إلى المقررات
                </Link>
            </div>
        </div>

        <FlashMessages />

        <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); get(route('admin.questions.index', { subject: subject.id })); }}>
            <input
                aria-label="البحث بنص السؤال"
                placeholder="ابحث عن سؤال..."
                className="rounded border p-2 flex-1 min-w-[200px]"
                value={data.search}
                onChange={e => setData('search', e.target.value)}
            />
            <button disabled={processing} className="rounded border px-4">
                بحث
            </button>
        </form>

        <div className="overflow-x-auto"><table className="w-full text-right">
            <thead><tr className="border-b"><th className="p-3">نص السؤال</th><th>الإجابة الصحيحة</th><th>الإجراءات</th></tr></thead>
            <tbody>
                {questions.data.map(question => <tr key={question.id} className="border-b">
                    <td className="p-3">{question.question_text}</td>
                    <td>{question.correct_answer}</td>
                    <td className="space-x-3">
                        <Link className="text-blue-700" href={route('admin.questions.show', { subject: subject.id, id: question.id })}>عرض</Link>
                        <Link className="text-blue-700" href={route('admin.questions.edit', { subject: subject.id, id: question.id })}>تعديل</Link>
                        <button className="text-red-700" onClick={() => handleDelete(question)}>حذف</button>
                    </td>
                </tr>)}
                {!questions.data.length && (
                    <tr><td className="p-6 text-center text-gray-500" colSpan={3}>
                        لا توجد أسئلة لهذا المقرر بعد.
                    </td></tr>
                )}
            </tbody>
        </table></div>

        <nav className="flex gap-4" aria-label="صفحات الأسئلة">
            {questions.prev_page_url && <Link href={questions.prev_page_url}>السابق</Link>}
            <span>صفحة {questions.current_page} من {questions.last_page}</span>
            {questions.next_page_url && <Link href={questions.next_page_url}>التالي</Link>}
        </nav>
    </main>;
}