import { Head, Link } from '@inertiajs/react';

export default function Show({ attempt, course, items }) {
    return <main dir="rtl" className="mx-auto max-w-3xl space-y-6 p-6">
        <Head title="مراجعة الإجابات" />
        <h1 className="text-2xl font-bold text-[#001F3F]">مراجعة الإجابات — {course.name}</h1>
        <p>الدرجة: {attempt.score} / {attempt.question_count}</p>
        <p className="text-sm text-gray-600">تعرض المراجعة نصوص الأسئلة والإجابات المحفوظة وقت بدء هذه المحاولة.</p>
        <div className="flex gap-5"><Link href={route('student.results.index')} className="text-blue-700 underline">سجل النتائج</Link><Link href={route('student.quizzes.show', attempt.id)} className="text-blue-700 underline">النتيجة وإعادة المحاولة</Link></div>
        {items.map(item => <article key={item.position} className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="font-bold">السؤال {item.position} — {item.is_correct ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</h2>
            <p dir="auto" className="whitespace-pre-wrap break-words">{item.question_text}</p>
            <ul className="space-y-2">{['A', 'B', 'C', 'D'].map(letter => <li key={letter} className={`whitespace-pre-wrap break-words rounded border p-3 ${letter === item.correct_answer ? 'border-green-600 bg-green-50' : letter === item.selected_answer ? 'border-red-600 bg-red-50' : ''}`}>
                <span dir="ltr" className="font-bold">{letter} — </span><span dir="auto">{item[`option_${letter.toLowerCase()}`]}</span>
                {letter === item.selected_answer && <strong> (إجابتك)</strong>}{letter === item.correct_answer && <strong> (الإجابة الصحيحة)</strong>}
            </li>)}</ul>
        </article>)}
    </main>;
}
