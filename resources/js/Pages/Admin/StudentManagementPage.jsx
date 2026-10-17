import {
    adminText as t,
    translateAdminFeedback as feedback,
} from '../../i18n/admin';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import FlashMessages from '../../Components/FlashMessages';
import AccountList, {
    AccountMetrics,
} from '../../Components/AdminAccountManagement';
export default function StudentManagementPage({ students, stats, filters }) {
    return (
        <AdminLayout activeNav="students" breadcrumb={t('إدارة الطلاب')}>
            <Head title={t('إدارة الطلاب')} />
            <div className="admin-page-heading">
                <div>
                    <h1>{t('إدارة الطلاب')}</h1>
                    <p>{t('تابع حسابات الطلاب وحالة الوصول إلى المنصة.')}</p>
                </div>
            </div>
            <FlashMessages translate={feedback} />
            <AccountMetrics stats={stats} students />
            <AccountList accounts={students} filters={filters} students />
        </AdminLayout>
    );
}
