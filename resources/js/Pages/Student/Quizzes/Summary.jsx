import {
    studentLevel,
    studentDate,
    studentText as t,
    translateStudentFeedback as translateFeedback,
} from '../../../i18n/student';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import StudentIcon from '../../../Components/StudentIcon';
import StudentLayout from '../../../Layouts/StudentLayout';
import FlashMessages from '../../../Components/FlashMessages';
export default function Summary({ attempt, course, canRetry }) {
    const { post, processing, errors } = useForm({});
    const submitting = useRef(false);
    const completed = attempt.status === 'completed';
    const percentage = completed
        ? Math.round((attempt.score / attempt.question_count) * 100)
        : null;
    const circumference = 2 * Math.PI * 82;
    const title = completed ? t('نتيجة الاختبار') : t('انتهى الاختبار');
    const dateValue = completed
        ? attempt.completed_at || attempt.created_at
        : attempt.abandoned_at || attempt.created_at;
    const dateLabel = completed ? t('تاريخ المحاولة') : t('تاريخ الإنهاء');
    const formattedDate = studentDate(dateValue, 'long');
    const metrics = completed
        ? [
              {
                  label: t('الإجابات الصحيحة'),
                  value: attempt.score,
                  icon: 'tick',
                  tone: 'text-emerald-600',
                  background: 'bg-emerald-50 ring-emerald-100',
              },
              {
                  label: t('الإجابات الخاطئة'),
                  value: attempt.question_count - attempt.score,
                  icon: 'close',
                  tone: 'text-red-600',
                  background: 'bg-red-50 ring-red-100',
              },
              {
                  label: t('إجمالي الأسئلة'),
                  value: attempt.question_count,
                  icon: 'file',
                  tone: 'text-[#001f3f]',
                  background: 'bg-slate-100 ring-slate-200',
              },
          ]
        : [];
    function retry() {
        if (!completed || !canRetry || processing || submitting.current) return;
        submitting.current = true;
        post(
            route('student.quizzes.retry', {
                attempt: attempt.id,
            }),
            {
                onFinish: () => {
                    submitting.current = false;
                },
            },
        );
    }
    return (
        <StudentLayout
            title={title}
            description={null}
            activeNav="results"
            selectedResultCourseId={course.id}
        >
            <Head title={title} />
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
                <Link
                    href={route('student.level.courses', {
                        level: course.level,
                    })}
                    className="hover:text-blue-700"
                >
                    {t('المقررات')}
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{title}</span>
            </nav>
            <FlashMessages translate={translateFeedback} />

            <section
                aria-labelledby="result-heading"
                className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
            >
                <div
                    className={`grid items-center gap-8 ${completed ? 'md:grid-cols-2' : ''}`}
                >
                    <div className="min-w-0 text-center">
                        <span
                            className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-full border-2 ${completed ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-300 bg-slate-50 text-slate-500'}`}
                        >
                            <StudentIcon
                                name={completed ? 'tick' : 'exit'}
                                className="size-10"
                            />
                        </span>
                        <h2
                            id="result-heading"
                            className="text-3xl font-bold leading-normal sm:text-4xl"
                        >
                            {completed
                                ? t('أكملت الاختبار')
                                : t('تم إنهاء الاختبار')}
                        </h2>
                        <p className="mt-4 break-words text-xl font-semibold sm:text-2xl">
                            {course.name}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {t('المستوى ')}
                            {studentLevel(course.level)}
                        </p>
                        {!completed && (
                            <p className="mx-auto mt-6 max-w-md text-base leading-8 text-slate-600">
                                {t(
                                    'انتهى الاختبار قبل إكماله، لذلك لم تُحتسب لك درجة. يمكنك العودة إلى المقررات وبدء اختبار جديد.',
                                )}
                            </p>
                        )}
                    </div>
                    {completed && (
                        <div className="flex justify-center border-t border-slate-100 pt-8 md:border-s md:border-t-0 md:pt-0">
                            <div
                                role="img"
                                aria-label={t(
                                    'نتيجتك {0} من {1}، بنسبة {2} بالمئة',
                                    {
                                        0: attempt.score,
                                        1: attempt.question_count,
                                        2: percentage,
                                    },
                                )}
                                className="student-score-ring relative size-56 shrink-0 sm:size-64"
                            >
                                <svg
                                    viewBox="0 0 200 200"
                                    aria-hidden="true"
                                    className="size-full -rotate-90"
                                >
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="82"
                                        fill="none"
                                        stroke="#e2e8f0"
                                        strokeWidth="15"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="82"
                                        fill="none"
                                        stroke="#001f3f"
                                        strokeWidth="15"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={
                                            circumference *
                                            (1 - percentage / 100)
                                        }
                                    />
                                </svg>
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                                >
                                    <p
                                        dir="ltr"
                                        className="text-5xl font-bold tracking-tight sm:text-6xl"
                                    >
                                        {percentage}%
                                    </p>
                                    <p className="text-lg text-slate-500">
                                        <bdi>{attempt.score}</bdi>
                                        {t(' من ')}
                                        <bdi>{attempt.question_count}</bdi>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {completed && (
                <section
                    aria-label={t('ملخص الإجابات')}
                    className="grid gap-4 sm:grid-cols-3"
                >
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:p-6"
                        >
                            <span
                                className={`flex size-12 shrink-0 items-center justify-center rounded-full ring-1 xl:size-14 ${metric.background} ${metric.tone}`}
                            >
                                <StudentIcon
                                    name={metric.icon}
                                    className="size-6 xl:size-7"
                                />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold leading-6">
                                    {metric.label}
                                </h3>
                                <p
                                    className={`mt-2 text-4xl font-bold tabular-nums ${metric.tone}`}
                                >
                                    {metric.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {formattedDate && (
                <div className="flex items-center gap-4 text-slate-500">
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-slate-200"
                    />
                    <p className="flex flex-wrap items-center justify-center gap-2 text-center text-xs leading-6 sm:text-sm">
                        <StudentIcon
                            name="calendar"
                            className="size-5 shrink-0"
                        />
                        <span>
                            {dateLabel}:{' '}
                            <time dateTime={dateValue}>{formattedDate}</time>
                        </span>
                    </p>
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-slate-200"
                    />
                </div>
            )}

            {completed ? (
                <section
                    aria-label={t('الخطوات التالية')}
                    className="space-y-4"
                >
                    <div className="grid items-start gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <button
                                type="button"
                                disabled={!canRetry || processing}
                                onClick={retry}
                                aria-describedby="retry-description"
                                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#001f3f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#12385e] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <StudentIcon name="retry" />
                                {processing
                                    ? t('جارٍ إعداد الاختبار...')
                                    : t('إعادة الاختبار')}
                            </button>
                            <p
                                id="retry-description"
                                className="text-center text-xs leading-6 text-slate-500"
                            >
                                {t('بنفس عدد الأسئلة (')}
                                {attempt.question_count}
                                {t(')، مع اختيار عشوائي')}
                            </p>
                        </div>
                        <Link
                            href={route('student.results.show', attempt.id)}
                            className="flex min-h-14 items-center justify-center gap-3 rounded-lg border border-[#001f3f] bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-blue-50"
                        >
                            <StudentIcon name="file" />
                            {t('مراجعة الإجابات')}
                        </Link>
                        <Link
                            href={route('student.level.courses', {
                                level: course.level,
                            })}
                            className="flex min-h-14 items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-100"
                        >
                            {t('العودة إلى المقررات')}
                            <StudentIcon
                                name="arrow"
                                className="student-direction-arrow size-5"
                            />
                        </Link>
                    </div>
                    {!canRetry && (
                        <p
                            role="status"
                            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800"
                        >
                            {t(
                                'عدد الأسئلة المتاح حاليًا لا يكفي لإعادة الاختبار بنفس العدد. يمكنك العودة إلى المقررات لاختيار عدد أقل.',
                            )}
                        </p>
                    )}
                    {Object.values(errors).map((error, index) => (
                        <p
                            key={index}
                            role="alert"
                            className="text-sm text-red-700"
                        >
                            {translateFeedback(error)}
                        </p>
                    ))}
                </section>
            ) : (
                <div className="flex justify-center">
                    <Link
                        href={route('student.level.courses', {
                            level: course.level,
                        })}
                        className="flex items-center gap-3 rounded-lg bg-[#001f3f] px-6 py-3 text-sm font-medium text-white hover:bg-[#12385e]"
                    >
                        {t('العودة إلى المقررات')}
                        <StudentIcon
                            name="arrow"
                            className="student-direction-arrow size-5"
                        />
                    </Link>
                </div>
            )}
        </StudentLayout>
    );
}
