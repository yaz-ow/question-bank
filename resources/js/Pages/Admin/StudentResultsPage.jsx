import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../../i18n/admin';
import { Head, router, useForm } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import AdminIcon from '../../Components/AdminIcon';
import AttemptReview from '../../Components/AdminResults/AttemptReview';
import '../../../css/admin-results.css';
const number = (value) => new Intl.NumberFormat('en-US').format(value);
const percentage = (score, count) =>
    `${Math.round((score / count) * 1000) / 10}%`;
const date = (value) =>
    value
        ? new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: 'Asia/Riyadh',
          }).format(new Date(value))
        : '—';
const statuses = {
    completed: 'مكتمل',
    abandoned: 'منسحب',
    in_progress: 'جارٍ',
};
function Pagination({ data, label, busy, onPage }) {
    return (
        <div className="admin-table-footer admin-results-pagination">
            <span>
                {data.total
                    ? t('عرض {0}–{1} من {2} {3}', {
                          0: number(data.from),
                          1: number(data.to),
                          2: number(data.total),
                          3: label,
                      })
                    : t('لا توجد بيانات للعرض')}
            </span>
            <nav
                className="admin-pagination"
                aria-label={t('صفحات {0}', {
                    0: label,
                })}
            >
                <button
                    type="button"
                    className="admin-pagination-link"
                    disabled={busy || !data.prev_page_url}
                    onClick={() => onPage(data.current_page - 1)}
                >
                    {t('السابق')}
                </button>
                <span>
                    {t('صفحة ')}
                    {number(data.current_page)}
                    {t(' من ')}
                    {number(data.last_page)}
                </span>
                <button
                    type="button"
                    className="admin-pagination-link"
                    disabled={busy || !data.next_page_url}
                    onClick={() => onPage(data.current_page + 1)}
                >
                    {t('التالي')}
                </button>
            </nav>
        </div>
    );
}
export default function StudentResultsPage({
    courses,
    course,
    stats,
    students,
    selectedStudent,
    review,
    filters = {},
}) {
    const form = useForm({
        search: filters.search || '',
        level: filters.level || '',
        subject_id: filters.subject_id || '',
    });
    const [loading, setLoading] = useState(false);
    const [loadErrors, setLoadErrors] = useState([]);
    const busy = form.processing || loading;
    const matchingCourses = useMemo(
        () =>
            courses.filter(
                (item) =>
                    (!form.data.level ||
                        item.level === Number(form.data.level)) &&
                    item.name
                        .toLocaleLowerCase('ar')
                        .includes(
                            form.data.search.trim().toLocaleLowerCase('ar'),
                        ),
            ),
        [courses, form.data.level, form.data.search],
    );
    useEffect(() => {
        form.setData({
            search: filters.search || '',
            level: filters.level || '',
            subject_id: filters.subject_id || '',
        });
    }, [filters.search, filters.level, filters.subject_id]);
    const updateCourseSearch = (key, value) => {
        const next = {
            ...form.data,
            [key]: value,
        };
        const selected = courses.find(
            (item) => item.id === Number(next.subject_id),
        );
        if (
            selected &&
            ((next.level && selected.level !== Number(next.level)) ||
                !selected.name
                    .toLocaleLowerCase('ar')
                    .includes(next.search.trim().toLocaleLowerCase('ar')))
        )
            next.subject_id = '';
        form.setData(next);
    };
    const search = (event) => {
        event.preventDefault();
        setLoadErrors([]);
        form.get(route('admin.student-results.index'), {
            preserveScroll: true,
            preserveState: true,
            errorBag: 'courseResults',
        });
    };
    const visit = (changes = {}, { focus, partial = false } = {}) => {
        if (busy) return;
        const query = {
            search: filters.search || '',
            level: filters.level || '',
            subject_id: course.id,
            page: students.current_page,
            student_id: selectedStudent?.id,
            attempts_page: selectedStudent?.attempts.current_page,
            ...changes,
        };
        Object.keys(query).forEach((key) => {
            if (
                query[key] === undefined ||
                query[key] === null ||
                query[key] === ''
            )
                delete query[key];
        });
        router.get(route('admin.student-results.index'), query, {
            preserveState: true,
            preserveScroll: true,
            ...(partial
                ? {
                      only: ['selectedStudent', 'review', 'filters'],
                  }
                : {}),
            onStart: () => {
                setLoading(true);
                setLoadErrors([]);
            },
            onError: (errors) => setLoadErrors(Object.values(errors)),
            onSuccess: () => {
                if (focus)
                    requestAnimationFrame(() =>
                        document.getElementById(focus)?.focus(),
                    );
            },
            onFinish: () => setLoading(false),
        });
    };
    const closeHistory = () =>
        visit(
            {
                student_id: null,
                attempt_id: null,
                attempts_page: null,
            },
            {
                partial: true,
                focus: `student-history-button-${selectedStudent.id}`,
            },
        );
    const openHistory = (student) => {
        if (selectedStudent?.id === student.id) closeHistory();
        else
            visit(
                {
                    student_id: student.id,
                    attempt_id: null,
                    attempts_page: 1,
                },
                {
                    partial: true,
                    focus: 'student-history-title',
                },
            );
    };
    return (
        <AdminLayout activeNav="student-results" breadcrumb={t('نتائج الطلاب')}>
            <Head title={t('نتائج الطلاب')} />
            <div className="admin-page-heading">
                <div>
                    <h1>{t('نتائج الطلاب')}</h1>
                    <p>
                        {t(
                            'اختر المقرر وتابع نتائج طلابه ومحاولاتهم من مكان واحد.',
                        )}
                    </p>
                </div>
            </div>
            <section
                className="admin-metrics admin-results-metrics"
                aria-label={t('إحصاءات المقرر')}
            >
                {[
                    {
                        label: t('الطلاب الذين اختبروا'),
                        value: stats?.students,
                        tone: 'blue',
                        icon: 'users',
                    },
                    {
                        label: t('الاختبارات المكتملة'),
                        value: stats?.completed,
                        tone: 'green',
                        icon: 'tick',
                    },
                ].map((item) => (
                    <article
                        key={item.label}
                        className={`admin-metric admin-tone-${item.tone}`}
                    >
                        <div>
                            <h2>{item.label}</h2>
                            <p>
                                {item.value === undefined
                                    ? '—'
                                    : number(item.value)}
                            </p>
                        </div>
                        <span className="admin-metric-icon">
                            <AdminIcon name={item.icon} />
                        </span>
                    </article>
                ))}
            </section>
            <section
                className="admin-panel admin-results-course-picker"
                aria-labelledby="results-course-title"
            >
                <div className="admin-account-create-heading">
                    <h2 id="results-course-title">
                        {t('البحث عن نتائج مقرر')}
                    </h2>
                </div>
                <form className="admin-results-course-form" onSubmit={search}>
                    <div className="admin-subject-field">
                        <label htmlFor="results-course-search">
                            {t('اسم المقرر')}
                        </label>
                        <div className="admin-search">
                            <AdminIcon name="search" />
                            <input
                                id="results-course-search"
                                placeholder={t('ابحث باسم المقرر')}
                                maxLength={255}
                                value={form.data.search}
                                disabled={busy}
                                onChange={(e) =>
                                    updateCourseSearch('search', e.target.value)
                                }
                                aria-invalid={!!form.errors.search}
                            />
                        </div>
                        {form.errors.search && (
                            <p className="admin-field-error" role="alert">
                                {feedback(form.errors.search)}
                            </p>
                        )}
                    </div>
                    <div className="admin-subject-field">
                        <label htmlFor="results-course-level">
                            {t('المستوى')}
                        </label>
                        <select
                            id="results-course-level"
                            className="admin-subject-input"
                            disabled={busy}
                            value={form.data.level}
                            onChange={(e) =>
                                updateCourseSearch('level', e.target.value)
                            }
                        >
                            <option value="">{t('جميع المستويات')}</option>
                            {Array.from(
                                {
                                    length: 9,
                                },
                                (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {t('المستوى ')}
                                        {i + 1}
                                    </option>
                                ),
                            )}
                        </select>
                        {form.errors.level && (
                            <p className="admin-field-error" role="alert">
                                {feedback(form.errors.level)}
                            </p>
                        )}
                    </div>
                    <div className="admin-subject-field">
                        <label htmlFor="results-course-select">
                            {t('اختيار المقرر')}
                        </label>
                        <select
                            id="results-course-select"
                            className="admin-subject-input"
                            required
                            disabled={busy}
                            value={form.data.subject_id}
                            onChange={(e) =>
                                form.setData('subject_id', e.target.value)
                            }
                            aria-invalid={!!form.errors.subject_id}
                            aria-describedby="results-course-help"
                        >
                            <option value="">{t('اختر المقرر')}</option>
                            {matchingCourses.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                    {t(' — المستوى ')}
                                    {item.level}
                                </option>
                            ))}
                        </select>
                        {form.errors.subject_id && (
                            <p className="admin-field-error" role="alert">
                                {feedback(form.errors.subject_id)}
                            </p>
                        )}
                    </div>
                    <button
                        className="admin-button admin-button-primary admin-results-search-button"
                        type="submit"
                        disabled={busy || !courses.length}
                    >
                        <AdminIcon name="search" />
                        {form.processing ? t('جارٍ البحث…') : t('عرض النتائج')}
                    </button>
                </form>
                <p id="results-course-help" className="admin-results-note">
                    {!courses.length
                        ? t('لا توجد مقررات بعد. أضف مقررًا من إدارة المقررات.')
                        : !matchingCourses.length
                          ? t(
                                'لا توجد مقررات مطابقة. جرّب اسمًا آخر أو اختر جميع المستويات.',
                            )
                          : t(
                                'اكتب اسم المقرر لتصفية القائمة، ثم اختره لعرض جميع طلابه ومحاولاتهم.',
                            )}
                </p>
            </section>
            {loadErrors.length > 0 && (
                <div className="admin-panel" role="alert">
                    {loadErrors.map((error, index) => (
                        <p className="admin-field-error" key={index}>
                            {feedback(error)}
                        </p>
                    ))}
                </div>
            )}
            <section
                className="admin-panel admin-results-list"
                aria-labelledby="course-results-title"
                aria-busy={busy}
            >
                {!course ? (
                    <div className="admin-empty">
                        <AdminIcon name="chart" />
                        <h2 id="course-results-title">
                            {t('اختر المقرر لعرض نتائج طلابه')}
                        </h2>
                        <p>
                            {t(
                                'تظهر النتائج بعد اختيار مقرر محدد من النموذج أعلاه.',
                            )}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="admin-results-list-heading">
                            <div>
                                <h2 id="course-results-title">
                                    {t('نتائج ')}
                                    {course.name}
                                </h2>
                                <p>
                                    {t('المستوى ')}
                                    {course.level}
                                    {t(
                                        ' · جميع الطلاب الذين لديهم محاولات في هذا المقرر',
                                    )}
                                </p>
                            </div>
                            <span>
                                {number(students.total)}
                                {t(' طالبًا')}
                            </span>
                        </div>
                        <div className="admin-table-scroll">
                            <table className="admin-table admin-results-students-table">
                                <caption className="sr-only">
                                    {t('طلاب مقرر ')}
                                    {course.name}
                                    {t(' ونتائج محاولاتهم')}
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">{t('الطالب')}</th>
                                        <th scope="col">
                                            {t('الرقم الجامعي')}
                                        </th>
                                        <th scope="col">
                                            {t('الاختبارات المكتملة')}
                                        </th>
                                        <th scope="col">{t('متوسط النسبة')}</th>
                                        <th scope="col">{t('آخر محاولة')}</th>
                                        <th scope="col">{t('السجل')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.data.map((student) => (
                                        <Fragment key={student.id}>
                                            <tr
                                                className={
                                                    selectedStudent?.id ===
                                                    student.id
                                                        ? 'admin-results-selected'
                                                        : undefined
                                                }
                                            >
                                                <th scope="row">
                                                    <div className="admin-account-identity">
                                                        <span
                                                            className={`admin-account-initial admin-initial-${student.id % 4}`}
                                                            aria-hidden="true"
                                                        >
                                                            {
                                                                Array.from(
                                                                    student.name,
                                                                )[0]
                                                            }
                                                        </span>
                                                        <bdi>
                                                            {student.name}
                                                        </bdi>
                                                    </div>
                                                </th>
                                                <td>
                                                    <bdi>
                                                        {student.university_id ||
                                                            '—'}
                                                    </bdi>
                                                </td>
                                                <td>
                                                    {number(
                                                        student.completed_count,
                                                    )}
                                                </td>
                                                <td>
                                                    {student.average_percentage ===
                                                    null ? (
                                                        '—'
                                                    ) : (
                                                        <span className="admin-results-percentage">
                                                            <bdi>
                                                                {
                                                                    student.average_percentage
                                                                }
                                                                %
                                                            </bdi>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="admin-results-date">
                                                    <bdi>
                                                        {date(
                                                            student.last_attempt_at,
                                                        )}
                                                    </bdi>
                                                </td>
                                                <td>
                                                    <button
                                                        id={`student-history-button-${student.id}`}
                                                        type="button"
                                                        className="admin-results-history-button"
                                                        disabled={busy}
                                                        aria-label={t(
                                                            '{0} محاولات {1}',
                                                            {
                                                                0:
                                                                    selectedStudent?.id ===
                                                                    student.id
                                                                        ? t(
                                                                              'إخفاء',
                                                                          )
                                                                        : t(
                                                                              'عرض',
                                                                          ),
                                                                1: student.name,
                                                            },
                                                        )}
                                                        aria-expanded={
                                                            selectedStudent?.id ===
                                                            student.id
                                                        }
                                                        aria-controls={
                                                            selectedStudent?.id ===
                                                            student.id
                                                                ? 'student-history-panel'
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            openHistory(student)
                                                        }
                                                    >
                                                        <AdminIcon name="chevron" />
                                                        {selectedStudent?.id ===
                                                        student.id
                                                            ? t('إخفاء')
                                                            : t('عرض')}
                                                    </button>
                                                </td>
                                            </tr>
                                            {selectedStudent?.id ===
                                                student.id && (
                                                <tr className="admin-results-expanded-row">
                                                    <td colSpan={6}>
                                                        <section
                                                            id="student-history-panel"
                                                            className="admin-results-history"
                                                            aria-labelledby="student-history-title"
                                                        >
                                                            <div className="admin-results-history-heading">
                                                                <h3
                                                                    id="student-history-title"
                                                                    tabIndex={
                                                                        -1
                                                                    }
                                                                >
                                                                    {t(
                                                                        'محاولات ',
                                                                    )}
                                                                    <bdi>
                                                                        {
                                                                            student.name
                                                                        }
                                                                    </bdi>
                                                                    {t(' في ')}
                                                                    {
                                                                        course.name
                                                                    }
                                                                </h3>
                                                                <button
                                                                    type="button"
                                                                    className="admin-account-action admin-account-edit"
                                                                    disabled={
                                                                        busy
                                                                    }
                                                                    onClick={
                                                                        closeHistory
                                                                    }
                                                                >
                                                                    {t(
                                                                        'إخفاء السجل',
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="admin-table-scroll">
                                                                <table className="admin-table admin-results-attempts-table">
                                                                    <caption className="sr-only">
                                                                        {t(
                                                                            'جميع محاولات الطالب في المقرر، الأحدث أولًا',
                                                                        )}
                                                                    </caption>
                                                                    <thead>
                                                                        <tr>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'تاريخ الاختبار',
                                                                                )}
                                                                            </th>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'عدد الأسئلة',
                                                                                )}
                                                                            </th>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'الإجابات الصحيحة',
                                                                                )}
                                                                            </th>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'النتيجة',
                                                                                )}
                                                                            </th>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'الحالة',
                                                                                )}
                                                                            </th>
                                                                            <th scope="col">
                                                                                {t(
                                                                                    'مراجعة',
                                                                                )}
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {selectedStudent.attempts.data.map(
                                                                            (
                                                                                attempt,
                                                                            ) => (
                                                                                <tr
                                                                                    key={
                                                                                        attempt.id
                                                                                    }
                                                                                    className={
                                                                                        review
                                                                                            ?.attempt
                                                                                            .id ===
                                                                                        attempt.id
                                                                                            ? 'admin-results-selected'
                                                                                            : undefined
                                                                                    }
                                                                                >
                                                                                    <td>
                                                                                        <bdi>
                                                                                            {date(
                                                                                                attempt.created_at,
                                                                                            )}
                                                                                        </bdi>
                                                                                        <small>
                                                                                            {t(
                                                                                                'المحاولة #',
                                                                                            )}
                                                                                            {
                                                                                                attempt.id
                                                                                            }
                                                                                        </small>
                                                                                    </td>
                                                                                    <td>
                                                                                        {number(
                                                                                            attempt.question_count,
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {attempt.score ===
                                                                                        null
                                                                                            ? '—'
                                                                                            : number(
                                                                                                  attempt.score,
                                                                                              )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {attempt.score ===
                                                                                        null ? (
                                                                                            '—'
                                                                                        ) : (
                                                                                            <bdi>
                                                                                                {percentage(
                                                                                                    attempt.score,
                                                                                                    attempt.question_count,
                                                                                                )}
                                                                                            </bdi>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        <span
                                                                                            className={`admin-results-status is-${attempt.status}`}
                                                                                        >
                                                                                            {t(
                                                                                                statuses[
                                                                                                    attempt
                                                                                                        .status
                                                                                                ],
                                                                                            )}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        {attempt.status ===
                                                                                        'completed' ? (
                                                                                            <button
                                                                                                type="button"
                                                                                                className="admin-account-action admin-account-edit"
                                                                                                disabled={
                                                                                                    busy
                                                                                                }
                                                                                                aria-label={t(
                                                                                                    'مراجعة إجابات المحاولة {0}',
                                                                                                    {
                                                                                                        0: attempt.id,
                                                                                                    },
                                                                                                )}
                                                                                                aria-expanded={
                                                                                                    review
                                                                                                        ?.attempt
                                                                                                        .id ===
                                                                                                    attempt.id
                                                                                                }
                                                                                                onClick={() =>
                                                                                                    visit(
                                                                                                        {
                                                                                                            attempt_id:
                                                                                                                attempt.id,
                                                                                                        },
                                                                                                        {
                                                                                                            partial: true,
                                                                                                            focus: 'attempt-review-title',
                                                                                                        },
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                {t(
                                                                                                    'مراجعة الإجابات',
                                                                                                )}
                                                                                            </button>
                                                                                        ) : (
                                                                                            '—'
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            ),
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <Pagination
                                                                data={
                                                                    selectedStudent.attempts
                                                                }
                                                                label={t(
                                                                    'محاولة',
                                                                )}
                                                                busy={busy}
                                                                onPage={(
                                                                    page,
                                                                ) =>
                                                                    visit(
                                                                        {
                                                                            attempts_page:
                                                                                page,
                                                                            attempt_id:
                                                                                null,
                                                                        },
                                                                        {
                                                                            partial: true,
                                                                            focus: 'student-history-title',
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <p className="admin-results-note">
                                                                <AdminIcon name="question" />
                                                                {t(
                                                                    'المحاولات المنسحبة والجارية لا تحمل درجة ولا تدخل في المتوسط.',
                                                                )}
                                                            </p>
                                                            {review && (
                                                                <AttemptReview
                                                                    review={
                                                                        review
                                                                    }
                                                                    course={
                                                                        course
                                                                    }
                                                                    student={
                                                                        selectedStudent
                                                                    }
                                                                    busy={busy}
                                                                    onClose={() =>
                                                                        visit(
                                                                            {
                                                                                attempt_id:
                                                                                    null,
                                                                            },
                                                                            {
                                                                                partial: true,
                                                                                focus: 'student-history-title',
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </section>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!students.data.length && (
                            <div className="admin-empty">
                                <AdminIcon name="users" />
                                <h3>{t('لا توجد محاولات لهذا المقرر بعد')}</h3>
                                <p>
                                    {t(
                                        'ستظهر نتائج الطلاب هنا عند بدء الاختبارات في هذا المقرر.',
                                    )}
                                </p>
                            </div>
                        )}
                        <Pagination
                            data={students}
                            label={t('طالبًا')}
                            busy={busy}
                            onPage={(page) =>
                                visit(
                                    {
                                        page,
                                        student_id: null,
                                        attempt_id: null,
                                        attempts_page: null,
                                    },
                                    {
                                        focus: 'course-results-title',
                                    },
                                )
                            }
                        />
                    </>
                )}
            </section>
        </AdminLayout>
    );
}
