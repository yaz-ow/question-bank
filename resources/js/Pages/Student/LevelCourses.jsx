import {
    studentNumber as number,
    studentText as t,
    translateStudentFeedback as translateFeedback,
} from '../../i18n/student';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuizSetupModal from '../../Components/QuizSetupModal';
import FlashMessages from '../../Components/FlashMessages';
import StudentIcon from '../../Components/StudentIcon';
import StudentLayout from '../../Layouts/StudentLayout';

export default function LevelCourses({
    level,
    courses,
    search,
    questionCounts = [],
    activeAttempt,
}) {
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const selectedCourse = courses.data.find(
        (course) => course.id === selectedCourseId,
    );
    const { data, setData, get, processing } = useForm({
        search: search || '',
    });
    useEffect(() => {
        setData('search', search || '');
    }, [level, search]);
    return (
        <StudentLayout
            title={t('مقررات المستوى {0}', {
                0: number(level),
            })}
            description={t('اختر مقررك وابدأ رحلتك في التدريب')}
        >
            <Head
                title={t('مقررات المستوى {0}', {
                    0: level,
                })}
            />
            <nav
                aria-label={t('مسار الصفحة')}
                className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
            >
                <Link
                    href={route('student.dashboard')}
                    className="hover:text-blue-700"
                >
                    {t('الرئيسية')}
                </Link>
                <span aria-hidden="true">/</span>
                <span
                    aria-current="page"
                    className="font-medium text-[#112d49]"
                >
                    {t('المستوى ')}
                    {number(level)}
                </span>
            </nav>
            <FlashMessages translate={translateFeedback} />

            <section aria-labelledby="courses-heading" className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id="courses-heading" className="text-xl font-bold">
                        {t('المقررات الدراسية')}
                    </h2>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        {search ? t('نتائج البحث') : t('عدد المقررات')}:{' '}
                        {number(courses.total)}
                    </span>
                </div>
                <form
                    role="search"
                    className="student-course-search flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        get(
                            route('student.level.courses', {
                                level,
                            }),
                            {
                                preserveScroll: true,
                            },
                        );
                    }}
                >
                    <div className="min-w-0 flex-1 basis-48">
                        <label
                            htmlFor="course-search"
                            className="mb-2 block text-xs font-medium text-slate-500"
                        >
                            {t('البحث باسم المقرر')}
                        </label>
                        <input
                            id="course-search"
                            type="search"
                            placeholder={t('ابحث عن مقرر في هذا المستوى...')}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-[#001f3f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#12385e] disabled:opacity-50"
                    >
                        {processing ? t('جارٍ البحث...') : t('بحث')}
                    </button>
                    {search && (
                        <Link
                            href={route('student.level.courses', {
                                level,
                            })}
                            className="rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100"
                        >
                            {t('مسح البحث')}
                        </Link>
                    )}
                </form>

                {courses.data.length ? (
                    <div className="student-card-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {courses.data.map((course) => (
                            <button
                                type="button"
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                aria-haspopup="dialog"
                                aria-label={t('بدء الاختبار في {0}', {
                                    0: course.name,
                                })}
                                className="student-course-card student-academic-card group flex w-full text-start min-h-44 flex-col rounded-xl border p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 pt-1">
                                        <h3 className="break-words text-lg font-bold leading-7">
                                            {course.name}
                                        </h3>
                                        <p className="mt-1 text-xs leading-6 text-slate-500">
                                            {t('الأسئلة المتاحة: ')}
                                            {number(course.questions_count)}
                                        </p>
                                    </div>
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                                        <StudentIcon className="size-6" />
                                    </span>
                                </div>
                                <div className="student-card-footer flex items-end justify-between gap-3">
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-blue-700">
                                        {t('بدء الاختبار')}
                                    </span>
                                    <span className="student-card-arrow flex size-8 items-center justify-center rounded-full">
                                        <StudentIcon
                                            name="arrow"
                                            className="student-direction-arrow size-4"
                                        />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                            <StudentIcon className="size-7" />
                        </span>
                        <h3 className="font-bold">
                            {search
                                ? t('لا توجد مقررات تطابق بحثك')
                                : t('لا توجد مقررات في هذا المستوى بعد')}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                            {search
                                ? t(
                                      'جرّب اسمًا آخر أو امسح البحث لعرض جميع المقررات.',
                                  )
                                : t('ستظهر المقررات هنا عند إضافتها.')}
                        </p>
                    </div>
                )}

                {courses.last_page > 1 && (
                    <nav
                        className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/70 pt-5 text-sm"
                        aria-label={t('صفحات المقررات')}
                    >
                        {courses.prev_page_url && (
                            <Link
                                href={courses.prev_page_url}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50"
                            >
                                {t('السابق')}
                            </Link>
                        )}
                        <span className="text-slate-500">
                            {t('صفحة ')}
                            {number(courses.current_page)}
                            {t(' من ')}
                            {number(courses.last_page)}
                        </span>
                        {courses.next_page_url && (
                            <Link
                                href={courses.next_page_url}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50"
                            >
                                {t('التالي')}
                            </Link>
                        )}
                    </nav>
                )}
            </section>
            {selectedCourse && (
                <QuizSetupModal
                    key={selectedCourse.id}
                    course={selectedCourse}
                    questionCounts={questionCounts}
                    activeAttempt={activeAttempt}
                    onClose={() => setSelectedCourseId(null)}
                />
            )}
        </StudentLayout>
    );
}
