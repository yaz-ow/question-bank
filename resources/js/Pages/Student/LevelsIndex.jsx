import { Link } from '@inertiajs/react';
import FlashMessages from '../../Components/FlashMessages';

export default function LevelsIndex({ levels }) {
    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <h1 className="text-2xl font-bold">المستويات الأكاديمية</h1>
        <FlashMessages />
        <Link href={route('student.dashboard')} className="p-3">لوحة تحكم الطالب</Link>

        {!levels.length && <p>لا توجد مستويات متاحة.</p>}

        <div className="space-y-4">
            {levels.map(level => (
                <div key={level.level} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold">المستوى {level.level}</h2>
                            <p className="text-gray-600">
                                {level.course_count} {level.course_count === 1 ? 'مقرر' : 'مقرر'}
                            </p>
                        </div>
                        <Link
                            href={route('student.level.courses', { level: level.level })}
                            className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
                        >
                            عرض المقررات
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    </main>;
}