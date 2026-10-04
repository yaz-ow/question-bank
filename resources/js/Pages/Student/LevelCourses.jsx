import { Link, router, useForm } from '@inertiajs/react';
import FlashMessages from '../../Components/FlashMessages';

export default function LevelCourses({ level, courses, search }) {
    const { data, setData, get, processing } = useForm({ search: search || '' });

    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">مقررات المستوى {level}</h1>
            <div className="flex space-x-3">
                <Link
                    href={route('student.levels')}
                    className="rounded bg-blue-700 px-4 py-2 text-sm text-white"
                >
                    العودة إلى المستويات
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

        <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); get(route('student.level.courses', { level })); }}>
            <input
                aria-label="البحث باسم المقرر"
                placeholder="ابحث عن مقرر..."
                className="rounded border p-2 flex-1 min-w-[200px]"
                value={data.search}
                onChange={e => setData('search', e.target.value)}
            />
            <button disabled={processing} className="rounded border px-4">
                بحث
            </button>
        </form>

        <div className="overflow-x-auto"><table className="w-full text-right">
            <thead><tr className="border-b"><th className="p-3">اسم المقرر</th></tr></thead>
            <tbody>
                {courses.data.map(course => <tr key={course.id} className="border-b">
                    <td className="p-3">
                        <Link href={route('student.course.details', { level, id: course.id })}>
                            {course.name}
                        </Link>
                    </td>
                </tr>)}
                {!courses.data.length && (
                    <tr><td className="p-6 text-center text-gray-500" colSpan={1}>
                        لا توجد مقررات في هذا المستوى.
                    </td></tr>
                )}
            </tbody>
        </table></div>

        {!courses.data.length && !search && <p className="text-center py-6">لا توجد مقررات في هذا المستوى بعد.</p>}

        <nav className="flex gap-4" aria-label="صفحات المقررات">
            {courses.prev_page_url && <Link href={courses.prev_page_url}>السابق</Link>}
            <span>صفحة {courses.current_page} من {courses.last_page}</span>
            {courses.next_page_url && <Link href={courses.next_page_url}>التالي</Link>}
        </nav>
    </main>;
}