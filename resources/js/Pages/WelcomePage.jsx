import FlashMessages from '../Components/FlashMessages';
import { Link } from '@inertiajs/react'

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="text-center">
                <FlashMessages />
                <h1 className="mb-6 text-3xl font-bold text-gray-900">
                    مرحبًا بك في نظام سؤال وجواب
                </h1>
                <p className="mb-4 text-lg text-gray-600">
                    نظام إدارة الأسئلة والاختبارات
                </p>
                <Link
                    href="/login/student"
                    className="mb-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    دخول الطالب
                </Link>
                <Link
                    href="/login/admin"
                    className="ml-4 inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    دخول الإدارة
                </Link>
            </div>
        </div>
    )
}
