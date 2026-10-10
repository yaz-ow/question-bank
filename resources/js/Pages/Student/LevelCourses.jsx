import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import QuizSetupModal from '../../Components/QuizSetupModal';
import FlashMessages from '../../Components/FlashMessages';
import StudentIcon from '../../Components/StudentIcon';
import StudentLayout from '../../Layouts/StudentLayout';

const number = value => new Intl.NumberFormat('ar-SA').format(value);

export default function LevelCourses({ level, courses, search, questionCounts = [], activeAttempt }) {
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const selectedCourse = courses.data.find(course => course.id === selectedCourseId);
    const { data, setData, get, processing } = useForm({ search: search || '' });
    useEffect(() => { setData('search', search || ''); }, [level, search]);

    return <StudentLayout title={`مقررات المستوى ${number(level)}`} description="اختر مقررك وابدأ رحلتك في التدريب">
        <Head title={`مقررات المستوى ${level}`} />
        <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href={route('student.dashboard')} className="hover:text-blue-700">الرئيسية</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-[#112d49]">المستوى {number(level)}</span>
        </nav>
        <FlashMessages />

        <section aria-labelledby="courses-heading" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="courses-heading" className="text-xl font-bold">المقررات الدراسية</h2>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{search ? 'نتائج البحث' : 'عدد المقررات'}: {number(courses.total)}</span>
            </div>
            <form role="search" className="student-course-search flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={e => { e.preventDefault(); get(route('student.level.courses', { level }), { preserveScroll: true }); }}>
                <div className="min-w-0 flex-1 basis-48">
                    <label htmlFor="course-search" className="mb-2 block text-xs font-medium text-slate-500">البحث باسم المقرر</label>
                    <input id="course-search" type="search" placeholder="ابحث عن مقرر في هذا المستوى..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm placeholder:text-slate-400" value={data.search} onChange={e => setData('search', e.target.value)} />
                </div>
                <button type="submit" disabled={processing} className="rounded-lg bg-[#001f3f] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#12385e] disabled:opacity-50">{processing ? 'جارٍ البحث...' : 'بحث'}</button>
                {search && <Link href={route('student.level.courses', { level })} className="rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-100">مسح البحث</Link>}
            </form>

            {courses.data.length ? <div className="student-card-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {courses.data.map(course => <button type="button" key={course.id} onClick={() => setSelectedCourseId(course.id)} aria-haspopup="dialog" aria-label={`بدء الاختبار في ${course.name}`} className="student-course-card group flex w-full text-right min-h-44 flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/20">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 pt-1">
                            <h3 className="break-words text-lg font-bold leading-7">{course.name}</h3>
                            <p className="mt-1 text-xs leading-6 text-slate-500">الأسئلة المتاحة: {number(course.questions_count)}</p>
                        </div>
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><StudentIcon className="size-6" /></span>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="text-xs font-medium text-slate-500 group-hover:text-blue-700">بدء الاختبار</span>
                        <span className="flex size-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-700"><StudentIcon name="arrow" className="size-4" /></span>
                    </div>
                </button>)}
            </div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-800"><StudentIcon className="size-7" /></span>
                <h3 className="font-bold">{search ? 'لا توجد مقررات تطابق بحثك' : 'لا توجد مقررات في هذا المستوى بعد'}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{search ? 'جرّب اسمًا آخر أو امسح البحث لعرض جميع المقررات.' : 'ستظهر المقررات هنا عند إضافتها.'}</p>
            </div>}

            {courses.last_page > 1 && <nav className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-200/70 pt-5 text-sm" aria-label="صفحات المقررات">
                {courses.prev_page_url && <Link href={courses.prev_page_url} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">السابق</Link>}
                <span className="text-slate-500">صفحة {number(courses.current_page)} من {number(courses.last_page)}</span>
                {courses.next_page_url && <Link href={courses.next_page_url} className="rounded-lg border border-slate-200 bg-white px-4 py-2 hover:bg-slate-50">التالي</Link>}
            </nav>}
        </section>
        {selectedCourse && <QuizSetupModal key={selectedCourse.id} course={selectedCourse} questionCounts={questionCounts} activeAttempt={activeAttempt} onClose={() => setSelectedCourseId(null)} />}
    </StudentLayout>;
}
