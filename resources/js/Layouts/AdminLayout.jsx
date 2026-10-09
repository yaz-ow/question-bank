import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AdminIcon from '../Components/AdminIcon';
import '../../css/admin.css';

export default function AdminLayout({
    children,
    activeNav = 'dashboard',
    breadcrumb = 'لوحة التحكم',
}) {
    const { auth } = usePage().props;
    const isFounder = auth.user.role === 'admin';
    const roleLabel = isFounder ? 'المؤسس' : 'المدرّس';
    const [menuOpen, setMenuOpen] = useState(false);
    const navigation = [
        {
            key: 'dashboard',
            label: 'لوحة التحكم',
            icon: 'grid',
            href: route('admin.dashboard'),
        },
        {
            key: 'subjects',
            label: 'إدارة المقررات',
            icon: 'book',
            href: route('admin.subjects.index'),
        },
        ...(isFounder
            ? [
                  {
                      key: 'students',
                      label: 'إدارة الطلاب',
                      icon: 'users',
                      href: route('admin.students.index'),
                  },
                  {
                      key: 'instructors',
                      label: 'إضافة مدرّس',
                      icon: 'user-plus',
                      href: route('admin.instructors.create'),
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
        <div className="admin-app" dir="rtl">
            <aside
                className="admin-sidebar"
                aria-label="القائمة الجانبية للإدارة"
            >
                <Link className="admin-logo" href={route('admin.dashboard')}>
                    <span className="admin-logo-mark" aria-hidden="true">
                        <span>✦</span>
                        <AdminIcon name="book" />
                    </span>
                    <strong>بنك الأسئلة</strong>
                    <small>بوابة الإدارة</small>
                </Link>
                <nav className="admin-navigation" aria-label="تنقل الإدارة">
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
                                    ? 'حساب الإدارة'
                                    : 'إدارة المقررات والأسئلة'}
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
                        تسجيل الخروج
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
                                menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'
                            }
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <AdminIcon name={menuOpen ? 'close' : 'menu'} />
                        </button>
                        <Link href={route('admin.dashboard')}>الرئيسية</Link>
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
                                {isFounder ? 'حساب المؤسس' : 'حساب المدرّس'}
                            </span>
                        </div>
                    </div>
                </header>
                {menuOpen && (
                    <nav
                        id="admin-mobile-nav"
                        className="admin-mobile-nav"
                        aria-label="تنقل الإدارة على الجوال"
                    >
                        {links()}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="admin-nav-link"
                        >
                            <AdminIcon name="exit" />
                            تسجيل الخروج
                        </Link>
                    </nav>
                )}
                <main className="admin-content">{children}</main>
                <footer className="admin-footer">
                    <strong>بنك الأسئلة</strong> © {new Date().getFullYear()} ·
                    جميع الحقوق محفوظة
                </footer>
            </div>
        </div>
    );
}
