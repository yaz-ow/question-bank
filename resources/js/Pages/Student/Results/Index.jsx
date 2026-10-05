import { Head, Link, useForm } from '@inertiajs/react';

const statuses = { completed: 'مكتمل', abandoned: 'منتهٍ دون درجة', in_progress: 'قيد الحل' };
export default function Index({ attempts, courses, filters, statistics }) {
    const { data, setData, get, processing, errors } = useForm({ subject_id: filters.subject_id || '', status: filters.status || '' });
    return <main dir="rtl" className="mx-auto max-w-5xl space-y-6 p-6">
        <Head title="سجل النتائج" />
        <h1 className="text-2xl font-bold text-[#001F3F]">سجل النتائج</h1>
        <Link href={route('student.dashboard')} className="text-blue-700 underline">لوحة الطالب</Link>
        <form onSubmit={e => { e.preventDefault(); get(route('student.results.index')); }} className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-4">
            <label>المقرر<select className="mt-2 block rounded border p-2" value={data.subject_id} onChange={e => setData('subject_id', e.target.value)}><option value="">كل المقررات</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label>الحالة<select className="mt-2 block rounded border p-2" value={data.status} onChange={e => setData('status', e.target.value)}><option value="">كل الحالات</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <button disabled={processing} className="rounded bg-[#001F3F] px-5 py-2 text-white disabled:opacity-50">تطبيق</button>
            <Link href={route('student.results.index')} className="text-blue-700 underline">مسح التصفية</Link>
            {Object.values(errors).map((error, i) => <p key={i} role="alert" className="text-red-700">{error}</p>)}
        </form>
        <section className="rounded-xl bg-gray-50 p-4" aria-label="إحصاءات النتائج">
            <p>الاختبارات المكتملة: {statistics.completed_count}</p>
            <p>متوسط نسب الاختبارات المكتملة: {statistics.average_percentage === null ? 'لا توجد نتائج' : `${Number(statistics.average_percentage).toFixed(1)}٪`}</p>
            <p className="text-sm text-gray-600">للمقرر المحدد أو جميع المقررات؛ لا تشمل المحاولات غير المكتملة، ولا تتأثر بتصفية الحالة.</p>
        </section>
        {attempts.data.length === 0 && <p className="rounded border p-6">لا توجد محاولات تطابق الاختيار.</p>}
        <div className="space-y-4">{attempts.data.map(a => <article key={a.id} className="space-y-3 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-bold">{a.course.name}</h2>
            <p>{statuses[a.status]} · {a.question_count} سؤالًا</p>
            <p>تاريخ البدء: <time dateTime={a.created_at}>{new Date(a.created_at).toLocaleString('ar-SA')}</time></p>
            <p>{a.status === 'completed' ? `الدرجة: ${a.score} / ${a.question_count} (${Math.round(a.score / a.question_count * 100)}٪)` : 'لم تُحتسب درجة'}</p>
            <div className="flex flex-wrap gap-4">
                <Link href={route('student.quizzes.show', a.id)} className="text-blue-700 underline">{a.status === 'in_progress' ? 'متابعة الاختبار' : a.status === 'completed' ? 'النتيجة وإعادة المحاولة' : 'تفاصيل المحاولة'}</Link>
                {a.status === 'completed' && <Link href={route('student.results.show', a.id)} className="text-blue-700 underline">مراجعة الإجابات</Link>}
            </div>
        </article>)}</div>
        <nav aria-label="صفحات النتائج" className="flex items-center justify-center gap-5">
            {attempts.prev_page_url && <Link href={attempts.prev_page_url} className="text-blue-700 underline">السابق</Link>}
            <span>صفحة {attempts.current_page} من {attempts.last_page}</span>
            {attempts.next_page_url && <Link href={attempts.next_page_url} className="text-blue-700 underline">التالي</Link>}
        </nav>
    </main>;
}
