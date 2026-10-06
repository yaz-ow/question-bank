import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '../Components/FlashMessages';
import StudentIcon from '../Components/StudentIcon';
import StudentLayout from '../Layouts/StudentLayout';

const number = value => new Intl.NumberFormat('ar-SA').format(value);
const date = value => value ? new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', calendar: 'gregory' }).format(new Date(value)) : '—';

export default function StudentDashboardPage({ statistics = {}, courses = [], recentResults = [] }) {
    const { auth } = usePage().props;
    const cards = [
        { title: 'الاختبارات المكتملة', value: number(statistics.completed_count ?? 0), note: 'محاولات أكملتها بنجاح', icon: 'check', color: 'bg-violet-50 text-violet-600' },
        { title: 'متوسط النتائج', value: statistics.average_percentage == null ? '—' : `${number(statistics.average_percentage)}٪`, note: 'متوسط درجات الاختبارات المكتملة', icon: 'chart', color: 'bg-emerald-50 text-emerald-700' },
        { title: 'المقررات المتاحة', value: number(statistics.available_courses ?? 0), note: 'استكشف مقررات المستويات', icon: 'book', color: 'bg-blue-50 text-blue-600' },
    ];
    return <StudentLayout>
        <Head title="لوحة الطالب" />
        <FlashMessages />
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div><p className="mb-2 text-xs font-semibold text-slate-500">كل خطوة تقرّبك من هدفك</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">مرحبًا، {auth?.user?.name || 'طالب'} <span className="text-emerald-600">.</span></h1><p className="mt-3 text-sm leading-7 text-slate-500">جاهز لمراجعة مقرراتك؟ ابدأ تدريبًا جديدًا وتابع تقدّمك.</p></div>
            <Link href={route('student.levels')} className="inline-flex items-center justify-center gap-3 self-start rounded-xl bg-[#001f3f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#143b61] sm:self-auto"><StudentIcon />تصفح المقررات<StudentIcon name="arrow" className="size-4" /></Link>
        </section>
        <section aria-label="ملخص تقدّمك" className="grid gap-4 sm:grid-cols-3">
            {cards.map(card => <article key={card.title} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-600">{card.title}</h2><span className={`flex size-11 items-center justify-center rounded-xl ${card.color}`}><StudentIcon name={card.icon} className="size-6" /></span></div><p className="mt-4 text-3xl font-bold tabular-nums">{card.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{card.note}</p></article>)}
        </section>
        <section aria-labelledby="courses-heading">
            <div className="mb-4 flex items-center justify-between gap-3"><div><h2 id="courses-heading" className="text-xl font-bold">مقررات متاحة</h2><p className="mt-1 text-xs text-slate-500">اختر مقررًا وابدأ مراجعتك</p></div><Link href={route('student.levels')} className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 hover:underline">جميع المستويات<StudentIcon name="arrow" className="size-4" /></Link></div>
            {courses.length ? <div className="grid gap-4 md:grid-cols-3">{courses.map((course, index) => <article key={course.id} className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3"><span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${['bg-blue-50 text-blue-600', 'bg-emerald-50 text-emerald-700', 'bg-amber-50 text-amber-700'][index % 3]}`}><StudentIcon name={index === 0 ? 'code' : 'book'} className="size-6" /></span><div><h3 className="text-base font-bold leading-7">{course.name}</h3><span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">المستوى {number(course.level)}</span></div></div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="inline-flex items-center gap-2 text-xs text-slate-500"><StudentIcon name="file" className="size-4" />{number(course.questions_count)} سؤال</span><Link href={route('student.course.details', { level: course.level, id: course.id })} className="rounded-lg bg-[#001f3f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#143b61]">تفاصيل المقرر</Link></div>
            </article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">لم تُضف مقررات بعد. ستظهر هنا عندما تصبح متاحة.</div>}
        </section>
        <section aria-labelledby="results-heading" className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 px-5 py-5"><h2 id="results-heading" className="text-xl font-bold">آخر النتائج</h2><Link href={route('student.results.index')} className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 hover:underline">عرض السجل<StudentIcon name="arrow" className="size-4" /></Link></div>
            {recentResults.length ? <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th scope="col" className="px-5 py-3 font-medium">المقرر</th><th scope="col" className="px-5 py-3 font-medium">المستوى</th><th scope="col" className="px-5 py-3 font-medium">النتيجة</th><th scope="col" className="px-5 py-3 font-medium">التاريخ</th><th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">التفاصيل</span></th></tr></thead><tbody className="divide-y divide-slate-100">{recentResults.map(result => <tr key={result.id} className="hover:bg-slate-50/70"><td className="px-5 py-4 font-semibold">{result.course?.name || 'مقرر غير متاح'}</td><td className="px-5 py-4 text-slate-500">{result.course ? number(result.course.level) : '—'}</td><td className="px-5 py-4"><span dir="ltr" className="inline-block rounded-lg bg-slate-100 px-3 py-1 font-semibold tabular-nums text-[#001f3f]">{result.score} / {result.question_count}</span></td><td className="px-5 py-4 text-xs text-slate-500">{date(result.completed_at)}</td><td className="px-5 py-4"><Link href={route('student.results.show', { attempt: result.id })} aria-label={`عرض نتيجة ${result.course?.name || 'الاختبار'}`} className="text-xs font-semibold text-blue-800 hover:underline">عرض</Link></td></tr>)}</tbody></table></div> : <div className="px-5 pb-8 pt-3 text-center"><span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-50 text-slate-400"><StudentIcon name="chart" /></span><p className="text-sm font-semibold">رحلة تقدّمك تبدأ من أول اختبار</p><p className="mt-2 text-xs text-slate-500">أكمل اختبارًا تدريبيًا لتظهر نتيجته هنا.</p></div>}
        </section>
    </StudentLayout>;
}
