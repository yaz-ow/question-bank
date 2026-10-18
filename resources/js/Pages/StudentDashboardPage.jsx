import {
    studentNumber as number,
    studentLevel,
    studentText as t,
    translateStudentFeedback as translateFeedback,
} from '../i18n/student';
import { Head, Link } from '@inertiajs/react';
import FlashMessages from '../Components/FlashMessages';
import StudentIcon from '../Components/StudentIcon';
import StudentLayout from '../Layouts/StudentLayout';

const courseLabel = (count) => {
    if (count === 0) return t('لا توجد مقررات حاليًا');
    if (count === 1) return t('مقرر واحد');
    if (count === 2) return t('مقرران دراسيان');
    return `${number(count)} ${count <= 10 ? t('مقررات دراسية') : t('مقررًا دراسيًا')}`;
};
export default function StudentDashboardPage({ statistics = {}, levels = [] }) {
    return (
        <StudentLayout>
            <Head title={t('لوحة الطالب')} />

            <section aria-labelledby="levels-heading">
                <FlashMessages translate={translateFeedback} />
                <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 id="levels-heading" className="text-xl font-bold">
                        {t('المستويات الدراسية')}
                    </h2>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        {t('٩ مستويات')}
                    </span>
                </div>
                <div className="student-card-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {levels.map((level) => (
                        <Link
                            key={level.level}
                            href={route('student.level.courses', {
                                level: level.level,
                            })}
                            aria-label={t('المستوى {0}، {1}', {
                                0: studentLevel(level.level),
                                1: courseLabel(level.course_count),
                            })}
                            className="student-level-card student-academic-card group flex min-h-40 flex-col rounded-xl border p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 pt-1">
                                    <h3 className="text-lg font-bold leading-7">
                                        {t('المستوى ')}
                                        {studentLevel(level.level)}
                                    </h3>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">
                                        {courseLabel(level.course_count)}
                                    </p>
                                </div>
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                                    <StudentIcon className="size-6" />
                                </span>
                            </div>
                            <div className="student-card-footer student-level-card-footer">
                                <span
                                    aria-hidden="true"
                                    className="student-card-level-number"
                                >
                                    {level.level}
                                </span>
                                <span className="student-card-arrow flex size-8 items-center justify-center rounded-full">
                                    <StudentIcon
                                        name="arrow"
                                        className="student-direction-arrow size-4"
                                    />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section
                aria-label={t('ملخص نتائجك')}
                className="grid gap-3 border-t border-slate-200/70 pt-5 sm:grid-cols-2"
            >
                <div className="student-dashboard-stat flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <StudentIcon name="check" />
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-3">
                        <h2 className="text-xs font-medium text-slate-500">
                            {t('الاختبارات المكتملة')}
                        </h2>
                        <p className="text-xl font-bold tabular-nums">
                            {number(statistics.completed_count ?? 0)}
                        </p>
                    </div>
                </div>
                <div className="student-dashboard-stat flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <StudentIcon name="chart" />
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-3">
                        <h2 className="text-xs font-medium text-slate-500">
                            {t('متوسط النتائج')}
                        </h2>
                        <p
                            className="text-xl font-bold tabular-nums"
                            aria-label={
                                statistics.average_percentage == null
                                    ? t('لا توجد نتائج بعد')
                                    : undefined
                            }
                        >
                            {statistics.average_percentage == null
                                ? '—'
                                : t('{0}٪', {
                                      0: number(statistics.average_percentage),
                                  })}
                        </p>
                    </div>
                </div>
            </section>
        </StudentLayout>
    );
}
