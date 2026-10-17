import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../i18n/admin';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import AdminIcon from '../Components/AdminIcon';
import FlashMessages from '../Components/FlashMessages';
const number = (value) => new Intl.NumberFormat('en-US').format(value);
export default function AdminDashboardPage({ stats, subjects, filters = {} }) {
    const { auth } = usePage().props;
    const isFounder = auth.user.role === 'admin';
    const { data, setData, get, processing, errors } = useForm({
        search: filters.search || '',
        level: filters.level || '',
    });
    const metrics = [
        {
            label: t('المقررات'),
            value: stats.subjects,
            icon: 'book',
            tone: 'blue',
        },
        {
            label: t('الأسئلة'),
            value: stats.questions,
            icon: 'question',
            tone: 'gold',
        },
        ...(isFounder
            ? [
                  {
                      label: t('الطلاب'),
                      value: stats.students,
                      icon: 'users',
                      tone: 'teal',
                  },
              ]
            : []),
        {
            label: t('المستويات المتاحة'),
            value: stats.levels,
            icon: 'layers',
            tone: 'violet',
        },
    ];
    const actions = [
        {
            label: t('إضافة مقرر'),
            description: t('إنشاء مقرر جديد وإدارته'),
            icon: 'book',
            tone: 'blue',
            href: `${route('admin.subjects.index')}#add-subject`,
        },
        ...(isFounder
            ? [
                  {
                      label: t('إدارة الطلاب'),
                      description: t('عرض وإدارة حسابات الطلاب'),
                      icon: 'users',
                      tone: 'teal',
                      href: route('admin.students.index'),
                  },
                  {
                      label: t('إدارة المدرّسين'),
                      description: t('إضافة المدرّسين وإدارة حساباتهم'),
                      icon: 'user-plus',
                      tone: 'gold',
                      href: route('admin.instructors.index'),
                  },
              ]
            : []),
    ];
    const submitFilters = (event) => {
        event.preventDefault();
        get(route('admin.dashboard'), {
            preserveState: true,
            preserveScroll: true,
        });
    };
    return (
        <AdminLayout>
            <Head title={t('لوحة الإدارة')} />
            <div className="admin-page-heading">
                <div>
                    <h1>{t('لوحة الإدارة')}</h1>
                    <p>
                        {isFounder
                            ? t(
                                  'نظرة عامة على المقررات والأسئلة وحسابات الطلاب',
                              )
                            : t('نظرة عامة على المقررات والأسئلة')}
                    </p>
                </div>
            </div>
            <FlashMessages translate={feedback} />
            <section
                className="admin-metrics"
                aria-label={t('إحصاءات بنك الأسئلة')}
            >
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className={`admin-metric admin-tone-${metric.tone}`}
                    >
                        <div>
                            <h2>{metric.label}</h2>
                            <p>{number(metric.value)}</p>
                        </div>
                        <span className="admin-metric-icon">
                            <AdminIcon name={metric.icon} />
                        </span>
                    </div>
                ))}
            </section>
            <section
                className="admin-panel admin-courses"
                aria-labelledby="admin-courses-title"
                aria-busy={processing}
            >
                <div className="admin-panel-heading">
                    <h2 id="admin-courses-title">{t('المقررات')}</h2>
                    <form
                        className="admin-course-filters"
                        onSubmit={submitFilters}
                    >
                        <div className="admin-search">
                            <AdminIcon name="search" />
                            <input
                                aria-label={t('البحث باسم المقرر')}
                                placeholder={t('البحث باسم المقرر')}
                                value={data.search}
                                maxLength={255}
                                onChange={(event) =>
                                    setData('search', event.target.value)
                                }
                            />
                        </div>
                        <select
                            aria-label={t('المستوى')}
                            value={data.level}
                            onChange={(event) =>
                                setData('level', event.target.value)
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
                        <button
                            className="admin-button admin-filter-button"
                            disabled={processing}
                        >
                            {processing ? t('جارٍ البحث…') : t('بحث')}
                        </button>
                    </form>
                    <Link
                        className="admin-view-all"
                        href={route('admin.subjects.index')}
                    >
                        {t('عرض جميع المقررات')}
                        <AdminIcon name="arrow" />
                    </Link>
                </div>
                {Object.entries(errors).map(([key, error]) => (
                    <p key={key} className="admin-error" role="alert">
                        {feedback(error)}
                    </p>
                ))}
                <div className="admin-table-scroll">
                    <table className="admin-table">
                        <caption className="sr-only">
                            {t(
                                'المقررات ومستوياتها وعدد الأسئلة وإجراءات إدارتها',
                            )}
                        </caption>
                        <thead>
                            <tr>
                                <th scope="col">{t('المقرر')}</th>
                                <th scope="col">{t('المستوى')}</th>
                                <th scope="col">{t('عدد الأسئلة')}</th>
                                <th scope="col">{t('الإجراءات')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.data.map((subject) => (
                                <tr key={subject.id}>
                                    <th scope="row">
                                        <Link
                                            href={route(
                                                'admin.questions.index',
                                                subject.id,
                                            )}
                                        >
                                            {subject.name}
                                        </Link>
                                    </th>
                                    <td>
                                        {t('المستوى ')}
                                        {subject.level}
                                    </td>
                                    <td className="admin-question-count">
                                        {number(subject.questions_count)}
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <Link
                                                className="admin-question-link"
                                                href={route(
                                                    'admin.questions.index',
                                                    {
                                                        subject: subject.id,
                                                    },
                                                )}
                                            >
                                                {t('إدارة الأسئلة')}
                                            </Link>
                                            <Link
                                                className="admin-edit-link"
                                                href={route(
                                                    'admin.subjects.index',
                                                    {
                                                        search: subject.name,
                                                        level: subject.level,
                                                        edit: subject.id,
                                                    },
                                                )}
                                                aria-label={t(
                                                    'تعديل مقرر {0}',
                                                    {
                                                        0: subject.name,
                                                    },
                                                )}
                                            >
                                                <AdminIcon name="edit" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!subjects.data.length && (
                    <div className="admin-empty">
                        <AdminIcon name="book" />
                        <h3>
                            {stats.subjects
                                ? t('لا توجد مقررات مطابقة')
                                : t('ابدأ بإضافة أول مقرر')}
                        </h3>
                        <p>
                            {stats.subjects
                                ? t('جرّب اسمًا آخر أو غيّر المستوى المحدد.')
                                : t(
                                      'أضف مقررًا، ثم أنشئ أسئلته أو استوردها من Excel.',
                                  )}
                        </p>
                        <Link
                            className="admin-button admin-button-primary"
                            href={
                                stats.subjects
                                    ? route('admin.dashboard')
                                    : `${route('admin.subjects.index')}#add-subject`
                            }
                        >
                            {stats.subjects
                                ? t('عرض المقررات')
                                : t('إضافة مقرر')}
                        </Link>
                    </div>
                )}
                {subjects.data.length > 0 && (
                    <div className="admin-table-footer">
                        <span>
                            {t('عرض ')}
                            {number(subjects.from)}–{number(subjects.to)}
                            {t(' من')} {number(subjects.total)}
                            {t(' مقرر')}
                        </span>
                        {subjects.last_page > 1 && (
                            <nav
                                className="admin-pagination"
                                aria-label={t('صفحات المقررات')}
                            >
                                <span>
                                    {t('صفحة ')}
                                    {number(subjects.current_page)}
                                    {t(' من')} {number(subjects.last_page)}
                                </span>
                                {subjects.prev_page_url && (
                                    <Link
                                        href={subjects.prev_page_url}
                                        preserveScroll
                                        className="admin-pagination-link"
                                    >
                                        {t('السابق')}
                                    </Link>
                                )}
                                {subjects.next_page_url && (
                                    <Link
                                        href={subjects.next_page_url}
                                        preserveScroll
                                        className="admin-pagination-link"
                                    >
                                        {t('التالي')}
                                    </Link>
                                )}
                            </nav>
                        )}
                    </div>
                )}
            </section>
            <section
                className="admin-panel admin-quick"
                aria-labelledby="admin-quick-title"
            >
                <h2 id="admin-quick-title">{t('الوصول السريع')}</h2>
                <div className="admin-quick-grid">
                    {actions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`admin-quick-link admin-tone-${action.tone}`}
                        >
                            <span className="admin-quick-icon">
                                <AdminIcon name={action.icon} />
                                {action.label === t('إضافة مقرر') && (
                                    <span className="admin-plus-mark">
                                        <AdminIcon name="plus" />
                                    </span>
                                )}
                            </span>
                            <div>
                                <h3>{action.label}</h3>
                                <p>{action.description}</p>
                            </div>
                            <AdminIcon
                                name="arrow"
                                className="admin-quick-arrow"
                            />
                        </Link>
                    ))}
                </div>
            </section>
        </AdminLayout>
    );
}
