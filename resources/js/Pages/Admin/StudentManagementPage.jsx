import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import FlashMessages from '../../Components/FlashMessages';
import AccountList, { AccountMetrics } from '../../Components/AdminAccountManagement';

export default function StudentManagementPage({ students, stats, filters }) {
    return <AdminLayout activeNav="students" breadcrumb="إدارة الطلاب">
        <Head title="إدارة الطلاب" />
        <div className="admin-page-heading"><div>
            <h1>إدارة الطلاب</h1><p>تابع حسابات الطلاب وحالة الوصول إلى المنصة.</p>
        </div></div>
        <FlashMessages />
        <AccountMetrics stats={stats} students />
        <AccountList accounts={students} filters={filters} students />
    </AdminLayout>;
}
