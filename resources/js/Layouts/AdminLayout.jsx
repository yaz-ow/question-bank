import { adminText as t } from '../i18n/admin';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminIcon from '../Components/AdminIcon';
import BrandMark from '../Components/BrandMark';
import usePortalLanguage from '../Components/Auth/usePortalLanguage';
import '../../css/admin.css';
export default function AdminLayout({
    children,
    activeNav = 'dashboard',
    breadcrumb = t('لوحة التحكم'),
}) {
    const { language } = usePortalLanguage();
    const { auth } = usePage().props;
    const isFounder = auth.user.role === 'admin';
    const isInstructor = auth.user.role === 'instructor';
    const home = route(isInstructor ? 'instructor.courses.index' : 'admin.dashboard');
    const roleLabel = isFounder ? t('المؤسس') : t('المدرّس');
    const [menuOpen, setMenuOpen] = useState(false);
    const navigation = isInstructor ? [
        { key: 'subjects', label: t('مقرراتي'), icon: 'book', href: home },
        { key: 'student-results', label: t('نتائج الطلاب'), icon: 'chart', href: route('instructor.student-results.index') },
    ] : [
        {
            key: 'dashboard',
            label: t('لوحة التحكم'),
            icon: 'grid',
            href: route('admin.dashboard'),
        },
        {
            key: 'subjects',
            label: t('إدارة المقررات'),
            icon: 'book',
            href: route('admin.subjects.index'),
        },
        {
            key: 'student-results',
            label: t('نتائج الطلاب'),
            icon: 'chart',
            href: route('admin.student-results.index'),
        },
        ...(isFounder
            ? [
                  {
                      key: 'students',
                      label: t('إدارة الطلاب'),
                      icon: 'users',
                      href: route('admin.students.index'),
                  },
                  {
                      key: 'instructors',
                      label: t('إدارة المدرّسين'),
                      icon: 'user-plus',
                      href: route('admin.instructors.index'),
                  },
              ]
            : []),
    ];
    const links = () =>
        navigation.map((item) => (
            <Link
                key={item.key}
                href={item.href}
                className={`admin-nav-link${activeNav === item.key ? ' is-active' : ''}`}
                aria-current={activeNav === item.key ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
            >
                <AdminIcon name={item.icon} />
                <span>{item.label}</span>
            </Link>
        ));
    return (
        <div
            className="admin-app qb-surface"
            lang={language}
            dir={language === 'en' ? 'ltr' : 'rtl'}
        >
            <aside
                className="admin-sidebar"
                aria-label={t(isInstructor ? 'القائمة الجانبية للمدرس' : 'القائمة الجانبية للإدارة')}
            >
                <Link className="admin-logo" href={home}>
                    <BrandMark inverse className="admin-logo-mark" />
                    <strong>{t('بنك الأسئلة')}</strong>
                    <small>{t(isInstructor ? 'بوابة المدرس' : 'بوابة الإدارة')}</small>
                </Link>
                <nav
                    className="admin-navigation"
                    aria-label={t(isInstructor ? 'تنقل المدرس' : 'تنقل الإدارة')}
                >
                    {links()}
                </nav>
                <div className="admin-sidebar-account">
                    <div className="admin-account">
                        <span className="admin-avatar">
                            <AdminIcon name="user" />
                        </span>
                        <div>
                            <strong>{roleLabel}</strong>
                            <span>
                                {isFounder
                                    ? t('حساب الإدارة')
                                    : t('إدارة أسئلة مقرراتك')}
                            </span>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="admin-logout"
                    >
                        <AdminIcon name="exit" />
                        {t('تسجيل الخروج')}
                    </Link>
                </div>
            </aside>
            <div className="admin-workspace">
                <header className="admin-topbar">
                    <div className="admin-breadcrumb">
                        <button
                            type="button"
                            className="admin-menu-button"
                            aria-controls="admin-mobile-nav"
                            aria-expanded={menuOpen}
                            aria-label={
                                menuOpen ? t('إغلاق القائمة') : t('فتح القائمة')
                            }
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <AdminIcon name={menuOpen ? 'close' : 'menu'} />
                        </button>
                        <Link href={home}>
                            {t('الرئيسية')}
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span>{breadcrumb}</span>
                    </div>
                    <div className="admin-header-account">
                        <span className="admin-avatar">
                            <AdminIcon name="user" />
                        </span>
                        <div>
                            <strong>
                                <bdi>{auth.user.name || roleLabel}</bdi>
                            </strong>
                            <span>
                                {isFounder
                                    ? t('حساب المؤسس')
                                    : t('حساب المدرّس')}
                            </span>
                        </div>
                    </div>
                </header>
                {menuOpen && (
                    <nav
                        id="admin-mobile-nav"
                        className="admin-mobile-nav"
                        aria-label={t(isInstructor ? 'تنقل المدرس على الجوال' : 'تنقل الإدارة على الجوال')}
                    >
                        {links()}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="admin-nav-link"
                        >
                            <AdminIcon name="exit" />
                            {t('تسجيل الخروج')}
                        </Link>
                    </nav>
                )}
                <main className="admin-content">{children}</main>
                <footer className="admin-footer">
                    <strong>{t('بنك الأسئلة')}</strong> ©{' '}
                    {new Date().getFullYear()}
                    {t(' · جميع الحقوق محفوظة')}
                </footer>
            </div>
        </div>
    );
}
