import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import AcademicBookIcon from '../../Components/AcademicBookIcon';
import StudentIcon from '../../Components/StudentIcon';
import FlashMessages from '../../Components/FlashMessages';
import { adminText as t, adminDirection, adminLanguage, translateAdminFeedback as feedback } from '../../i18n/admin';
import '../../../css/student.css';

export default function Courses({ courses = [] }) {
    return (
        <AdminLayout activeNav="subjects" breadcrumb={t('مقرراتي')}>
            <Head title={t('مقرراتي')} />
            <div className="admin-page-heading">
                <div>
                    <h1>{t('مقرراتي')}</h1>
                    <p>{t('إدارة أسئلة المقررات المسندة إليك')}</p>
                </div>
            </div>
            <FlashMessages translate={feedback} />
            <section className="student-dashboard" dir={adminDirection()} lang={adminLanguage()} aria-label={t('مقرراتي')}>
                <div className="student-card-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={route('instructor.questions.index', { subject: course.id })}
                            aria-label={t('إدارة أسئلة {0}، المستوى {1}', { 0: course.name, 1: course.level })}
                            className="student-level-card student-academic-card group flex min-h-40 flex-col rounded-xl border p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 pt-1">
                                    <h3 className="text-lg font-bold leading-7" dir="auto">{course.name}</h3>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">
                                        {t('عدد الأسئلة: {0}', { 0: course.questions_count })}
                                    </p>
                                </div>
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                                    <AcademicBookIcon index={course.id - 1} />
                                </span>
                            </div>
                            <div className="student-card-footer student-level-card-footer">
                                <span aria-hidden="true" className="student-card-level-number">{course.level}</span>
                                <span className="student-card-arrow flex size-8 items-center justify-center rounded-full">
                                    <StudentIcon name="arrow" className="student-direction-arrow size-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
                {!courses.length && (
                    <div className="admin-empty">
                        <AcademicBookIcon className="size-12" />
                        <h3>{t('لم تُسند إليك مقررات بعد')}</h3>
                        <p>{t('يرجى التواصل مع الإدارة لتحديد مقرراتك.')}</p>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}
