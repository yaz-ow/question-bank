import FlashMessages from '../Components/FlashMessages';
import { Link } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'

export default function StudentDashboardPage() {
    const { auth } = usePage().props

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                <FlashMessages />
                <div className="space-y-3">
                    <h2 className="text-center text-2xl font-bold text-gray-900">
                        لوحة تحكم الطالب
                    </h2>
                    <p className="text-center text-gray-600">
                        مرحبًا، {auth.user?.name || 'طالب'}!
                    </p>
                </div>
                <div className="space-y-4">
                    <Link
                        href="/student/levels"
                        className="w-full flex justify-center py-2 px-4 border rounded-md bg-blue-600 text-white"
                    >
                             تصفح المستويات والمقررات
                    </Link>
                    
                    <Link
                        href="/"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        العودة إلى الصفحة الرئيسية
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        تسجيل الخروج
                    </Link>
                </div>
            </div>
        </div>
    )
}
