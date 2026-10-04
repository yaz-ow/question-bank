import { Link } from '@inertiajs/react';
import FlashMessages from '../../Components/FlashMessages';

export default function CourseDetails({ course }) {
    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">تفاصيل المقرر</h1>
            <div className="flex space-x-3">
                <Link
                    href={route('student.level.courses', { level: course.level })}
                    className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
                >
                    العودة إلى مستوى {course.level}
                </Link>
                <Link
                    href={route('student.levels')}
                    className="text-sm text-blue-700 hover:underline"
                >
                    جميع المستويات
                </Link>
                <Link
                    href={route('student.dashboard')}
                    className="p-3"
                >
                    لوحة تحكم الطالب
                </Link>
            </div>
        </div>

        <FlashMessages />

        <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
                <div className="border-b pb-4">
                    <h2 className="text-xl font-bold">{course.name}</h2>
                    <p className="text-gray-600">المستوى: {course.level}</p>
                </div>

                <div className="text-sm text-gray-500">
                    <p>تم الإنشاء: {new Date(course.created_at).toLocaleDateString('ar-SA')}</p>
                    {course.updated_at && (
                        <p>تم التحديث: {new Date(course.updated_at).toLocaleDateString('ar-SA')}</p>
                    )}
                </div>
            </div>
        </div>
    </main>;
}