import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import StudentIcon from '../../../Components/StudentIcon';
import FlashMessages from '../../../Components/FlashMessages';

const statuses = {
    completed: { label: 'مكتمل', icon: 'tick', className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
    abandoned: { label: 'منتهٍ دون درجة', icon: 'exit', className: 'border-amber-100 bg-amber-50 text-amber-800' },
    in_progress: { label: 'قيد الحل', icon: 'file', className: 'border-blue-100 bg-blue-50 text-blue-700' },
};
const dateFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { dateStyle: 'medium', timeStyle: 'short' });

export default function Index({ attempts, courses, filters, statistics }) {
    const { data, setData, get, processing, errors } = useForm({ subject_id: filters.subject_id || '', status: filters.status || '' });
    useEffect(() => {
        setData({ subject_id: filters.subject_id || '', status: filters.status || '' });
    }, [filters.subject_id, filters.status]);
    const filtered = Boolean(filters.subject_id || filters.status);
    const selectedCourse = courses.find(course => Number(course.id) === Number(filters.subject_id));

    return <StudentLayout title="سجل النتائج" description="راجع محاولاتك وتابع تقدّمك الدراسي" activeNav="results" selectedResultCourseId={filters.subject_id}>
        <Head title="سجل النتائج" />
        <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href={route('student.dashboard')} className="hover:text-blue-700">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">سجل النتائج</span>
        </nav>
        <FlashMessages />
        <section aria-label="إحصاءات النتائج" className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><StudentIcon name="check" className="size-6" /></span>
                    <div className="min-w-0 flex-1"><h2 className="text-sm text-slate-500">الاختبارات المكتملة</h2><p className="mt-2 text-3xl font-bold tabular-nums">{statistics.completed_count}</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><StudentIcon name="chart" className="size-6" /></span>
                    <div className="min-w-0 flex-1"><h2 className="text-sm text-slate-500">متوسط النتائج</h2><p className="mt-2 text-3xl font-bold tabular-nums">{statistics.average_percentage == null ? '—' : `${Number(statistics.average_percentage).toFixed(1)}٪`}</p></div>
                </div>
            </div>
            <p className="text-xs leading-6 text-slate-500">الإحصاءات تخص الاختبارات المكتملة {selectedCourse ? `في ${selectedCourse.name}` : 'في جميع المقررات'}، ولا تتأثر بتصفية الحالة.</p>
        </section>
        <form aria-label="تصفية النتائج" onSubmit={event => { event.preventDefault(); get(route('student.results.index'), { preserveScroll: true }); }} className="student-results-filter flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="min-w-0 flex-1 basis-52 text-sm font-medium"><label htmlFor="history-subject">المقرر</label>
                <select id="history-subject" className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={data.subject_id} onChange={event => setData('subject_id', event.target.value)}><option value="">كل المقررات</option>{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}</select>
            </div>
            <div className="min-w-0 flex-1 basis-40 text-sm font-medium"><label htmlFor="history-status">الحالة</label>
                <select id="history-status" className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" value={data.status} onChange={event => setData('status', event.target.value)}><option value="">كل الحالات</option>{Object.entries(statuses).map(([key, status]) => <option key={key} value={key}>{status.label}</option>)}</select>
            </div>
            <button type="submit" disabled={processing} className="rounded-lg bg-[#001f3f] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#12385e] disabled:opacity-50">{processing ? 'جارٍ التصفية...' : 'تطبيق'}</button>
            {filtered && <Link href={route('student.results.index')} className="rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100">مسح التصفية</Link>}
            {Object.values(errors).map((error, index) => <p key={index} role="alert" className="w-full text-sm text-red-700">{error}</p>)}
        </form>
        <section aria-labelledby="attempts-heading" className="space-y-4">
            <div className="flex items-center justify-between gap-3"><h2 id="attempts-heading" className="text-xl font-bold">{selectedCourse ? `محاولاتك في ${selectedCourse.name}` : 'محاولاتك'}</h2><span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{attempts.total} محاولة</span></div>
            {attempts.data.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><StudentIcon name="file" className="size-7" /></span>
                <h3 className="text-lg font-bold">{filtered ? 'لا توجد محاولات تطابق اختيارك' : 'لم تبدأ أي اختبار بعد'}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{filtered ? 'غيّر خيارات التصفية لعرض محاولات أخرى.' : 'اختر مقررًا وابدأ التدريب؛ ستظهر محاولاتك هنا.'}</p>
                {!filtered && <Link href={route('student.dashboard')} className="mt-5 inline-block rounded-lg bg-[#001f3f] px-5 py-3 text-sm text-white">تصفح المقررات</Link>}
            </div>}
            {attempts.data.map(attempt => {
                const completed = attempt.status === 'completed';
                const status = statuses[attempt.status];
                return <article key={attempt.id} className="student-attempt-card overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="min-w-0 space-y-3">
                            <div className="flex flex-wrap items-center gap-3"><h3 className="break-words text-lg font-bold">{attempt.course.name}</h3><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${status.className}`}><StudentIcon name={status.icon} className="size-3.5" />{status.label}</span></div>
                            <p className="text-xs leading-6 text-slate-500">المستوى {attempt.course.level} · {attempt.question_count} سؤالًا · المحاولة #{attempt.id}</p>
                            <p className="flex items-start gap-2 text-xs leading-6 text-slate-500"><StudentIcon name="calendar" className="mt-0.5 size-4 shrink-0" />تاريخ البدء: <time dateTime={attempt.created_at}>{dateFormatter.format(new Date(attempt.created_at))}</time></p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-slate-50 px-6 py-4 text-center sm:min-w-36">
                            {completed ? <><p className="text-3xl font-bold tabular-nums">{Math.round(attempt.score / attempt.question_count * 100)}٪</p><p className="mt-1 text-xs text-slate-500">الدرجة: <bdi>{attempt.score}</bdi> من <bdi>{attempt.question_count}</bdi></p></> : <p className="text-sm text-slate-500">{attempt.status === 'in_progress' ? 'لم يكتمل الاختبار بعد' : 'لم تُحتسب درجة'}</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-3 sm:px-6">
                        <Link href={route('student.quizzes.show', attempt.id)} className="flex items-center gap-2 rounded-lg bg-[#001f3f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12385e]">{attempt.status === 'in_progress' ? 'متابعة الاختبار' : completed ? 'عرض النتيجة' : 'تفاصيل المحاولة'}<StudentIcon name="arrow" className="size-4" /></Link>
                        {completed && <Link href={route('student.results.show', attempt.id)} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-slate-100"><StudentIcon name="file" className="size-4" />مراجعة الإجابات</Link>}
                    </div>
                </article>;
            })}
        </section>
        {attempts.last_page > 1 && <nav aria-label="صفحات النتائج" className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/70 pt-5 text-sm">
            {attempts.prev_page_url && <Link href={attempts.prev_page_url} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">السابق</Link>}
            <span className="text-slate-500">صفحة {attempts.current_page} من {attempts.last_page}</span>
            {attempts.next_page_url && <Link href={attempts.next_page_url} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">التالي</Link>}
        </nav>}
    </StudentLayout>;
}
