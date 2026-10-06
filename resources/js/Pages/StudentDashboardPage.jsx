import { Head, Link, usePage } from '@inertiajs/react';
import FlashMessages from '../Components/FlashMessages';
import StudentIcon from '../Components/StudentIcon';
import StudentLayout from '../Layouts/StudentLayout';

const number = value => new Intl.NumberFormat('ar-SA').format(value);
const levelNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع'];
const courseLabel = count => {
    if (count === 0) return 'لا توجد مقررات حاليًا';
    if (count === 1) return 'مقرر واحد';
    if (count === 2) return 'مقرران دراسيان';
    return `${number(count)} ${count <= 10 ? 'مقررات دراسية' : 'مقررًا دراسيًا'}`;
};

export default function StudentDashboardPage({ statistics = {}, levels = [] }) {
    const { auth } = usePage().props;

    return <StudentLayout>
        <Head title="لوحة الطالب" />
        <FlashMessages />

        <section className="border-b border-slate-200/70 pb-6">
            <h1 className="text-3xl font-bold leading-relaxed tracking-tight sm:text-4xl">
                مرحبًا، {auth?.user?.name || 'طالب'}<span className="text-emerald-600">.</span>
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">مستوياتك الدراسية، في مكان واحد</p>
        </section>

        <section aria-labelledby="levels-heading">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 id="levels-heading" className="text-xl font-bold">المستويات الدراسية</h2>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">٩ مستويات</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {levels.map(level => <Link
                    key={level.level}
                    href={route('student.level.courses', { level: level.level })}
                    aria-label={`المستوى ${levelNames[level.level - 1]}، ${courseLabel(level.course_count)}`}
                    className="group relative isolate overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40 sm:p-6"
                >
                    <span aria-hidden="true" dir="ltr" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-6xl font-bold leading-none text-gray-600">{level.level}</span>
                    <div className="mb-5 flex items-center justify-end">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><StudentIcon className="size-6" /></span>
                    </div>
                    <h3 className="relative max-w-[calc(50%-1.5rem)] text-base font-bold leading-7">المستوى {levelNames[level.level - 1]}</h3>
                    <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-xs leading-6 text-slate-500">{courseLabel(level.course_count)}</p>
                        <span className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-700"><StudentIcon name="arrow" className="size-4" /></span>
                    </div>
                </Link>)}
            </div>
        </section>

        <section aria-label="ملخص نتائجك" className="grid gap-3 border-t border-slate-200/70 pt-5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><StudentIcon name="check" /></span>
                <div className="flex flex-1 items-center justify-between gap-3"><h2 className="text-xs font-medium text-slate-500">الاختبارات المكتملة</h2><p className="text-xl font-bold tabular-nums">{number(statistics.completed_count ?? 0)}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><StudentIcon name="chart" /></span>
                <div className="flex flex-1 items-center justify-between gap-3"><h2 className="text-xs font-medium text-slate-500">متوسط النتائج</h2><p className="text-xl font-bold tabular-nums" aria-label={statistics.average_percentage == null ? 'لا توجد نتائج بعد' : undefined}>{statistics.average_percentage == null ? '—' : `${number(statistics.average_percentage)}٪`}</p></div>
            </div>
        </section>
    </StudentLayout>;
}
