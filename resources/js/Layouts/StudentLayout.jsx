import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StudentIcon from '../Components/StudentIcon';

export default function StudentLayout({ children, title, description = 'مستوياتك الدراسية، في مكان واحد', activeNav, selectedResultCourseId }) {
    const { auth, levels = [], resultCourses = [], level } = usePage().props;
    const isDashboard = route().current('student.dashboard');
    const isAcademic = route().current('student.level*') || route().current('student.course.details');
    const [menuOpen, setMenuOpen] = useState(false);
    const [levelsOpen, setLevelsOpen] = useState(false);
    const [resultsOpen, setResultsOpen] = useState(activeNav === 'results');
    const name = auth?.user?.name || 'طالب';
    const [allLevels, setAllLevels] = useState(false);
    const [allResults, setAllResults] = useState(activeNav === 'results');
    const renderNavigation = (mobile = false) => {
        const prefix = mobile ? 'student-mobile' : 'student-sidebar';
        const buttonClass = `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm transition-colors ${mobile ? 'hover:bg-slate-100' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;
        const groupClass = `overflow-hidden rounded-xl ${mobile ? 'text-slate-600' : 'text-slate-300'}`;
        const headingClass = `flex w-full items-center gap-3 px-4 py-3 text-right text-sm font-normal transition-colors ${mobile ? 'hover:bg-slate-100' : 'hover:bg-white/10 hover:text-white'}`;
        const linkClass = `block w-full px-7 py-3 text-right text-sm transition-colors ${mobile ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`;
        const chevron = open => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className={`size-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>;
        const closeMobile = () => { if (mobile) setMenuOpen(false); };
        return <>
            <Link href={route('student.dashboard')} onClick={closeMobile} aria-current={isDashboard ? 'page' : undefined} className={`${buttonClass} ${isDashboard ? (mobile ? 'bg-slate-100' : 'bg-white/15 font-bold text-white') : ''}`}><StudentIcon name="home" />الرئيسية</Link>
            <section className={groupClass}>
                <button type="button" className={headingClass} onClick={() => setLevelsOpen(open => !open)} aria-expanded={levelsOpen} aria-controls={`${prefix}-levels`}>
                    {chevron(levelsOpen)}<span className="flex-1">المستويات الدراسية</span><StudentIcon name="layers" />
                </button>
                <div id={`${prefix}-levels`} hidden={!levelsOpen}>
                    {(allLevels ? levels : levels.slice(0, 2)).map(item => <Link key={item.level} href={route('student.level.courses', { level: item.level })} onClick={closeMobile} aria-current={isAcademic && Number(level) === item.level ? 'page' : undefined} className={`${linkClass} ${isAcademic && Number(level) === item.level ? (mobile ? 'bg-slate-100 font-bold' : 'bg-white/15 font-bold text-white') : ''}`}>المستوى {item.level}</Link>)}
                    {levels.length > 2 && <button type="button" className={linkClass} aria-expanded={allLevels} onClick={() => setAllLevels(all => !all)}>{allLevels ? 'عرض أقل' : 'المزيد ...'}</button>}
                </div>
            </section>
            <section className={groupClass}>
                <button type="button" className={`${headingClass} ${activeNav === 'results' ? (mobile ? 'bg-slate-100 font-bold' : 'bg-white/15 font-bold text-white') : ''}`} onClick={() => setResultsOpen(open => !open)} aria-expanded={resultsOpen} aria-controls={`${prefix}-results`}>
                    {chevron(resultsOpen)}<span className="flex-1">سجل النتائج</span><StudentIcon name="chart" />
                </button>
                <div id={`${prefix}-results`} hidden={!resultsOpen}>
                    <Link href={route('student.results.index')} onClick={closeMobile} aria-current={activeNav === 'results' && !selectedResultCourseId ? 'page' : undefined} className={`${linkClass} ${activeNav === 'results' && !selectedResultCourseId ? 'font-bold' : ''}`}>عرض جميع المحاولات</Link>
                    {resultCourses.length ? (allResults ? resultCourses : resultCourses.slice(0, 2)).map(course => <Link key={course.id} href={route('student.results.index', { subject_id: course.id, status: 'completed' })} onClick={closeMobile} className={`${linkClass} ${Number(selectedResultCourseId) === course.id ? (mobile ? 'font-bold text-blue-800' : 'font-bold text-white') : ''}`}>{course.name}</Link>) : <p className="px-7 py-3 text-xs leading-6 opacity-75">لا توجد اختبارات مكتملة بعد.</p>}
                    {resultCourses.length > 2 && <button type="button" className={linkClass} aria-expanded={allResults} onClick={() => setAllResults(all => !all)}>{allResults ? 'عرض أقل' : 'المزيد ...'}</button>}
                </div>
            </section>
        </>;
    };
    return <div dir="rtl" className="student-dashboard min-h-screen bg-[#f5f7fb] text-[#112d49]">
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col overflow-y-auto bg-[#001f3f] px-5 py-8 text-white lg:flex">
            <Link href={route('student.dashboard')} className="mb-12 flex items-center gap-3 px-3 text-xl font-bold"><StudentIcon className="size-9" />بنك الأسئلة</Link>
            <p className="mb-3 px-3 text-xs font-medium tracking-wide text-slate-400">مساحتك التعليمية</p>
            <nav aria-label="تنقل الطالب" className="space-y-2">
                {renderNavigation()}
            </nav>
            <div className="mt-auto border-t border-white/10 pt-5">
                <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"><StudentIcon name="exit" />تسجيل الخروج</Link>
            </div>
        </aside>
        <div className="lg:mr-64">
            <header className="border-b border-slate-200/70 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="student-mobile-nav" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} className="shrink-0 rounded-lg border border-slate-200 p-2 lg:hidden"><StudentIcon name={menuOpen ? 'close' : 'menu'} /></button>
                        <div className="min-w-0">
                            <h1 className="break-words text-xl font-bold leading-8 sm:text-2xl">{title || <>مرحبًا، <bdi>{name}</bdi></>}</h1>
                            {description && <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">{description}</p>}
                        </div>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600" aria-hidden="true">{name.trim().slice(0, 1)}</span>
                </div>
                {menuOpen && <nav id="student-mobile-nav" aria-label="تنقل الطالب على الجوال" className="space-y-1 border-t border-slate-100 px-5 py-3 lg:hidden">{renderNavigation(true)}<Link href={route('logout')} as="button" method="post" className="w-full px-3 py-3 text-right text-sm text-red-700">تسجيل الخروج</Link></nav>}
            </header>
            <main className="mx-auto max-w-7xl space-y-8 px-5 py-6 sm:px-8">{children}</main>
            <footer className="mx-auto max-w-7xl px-5 pb-6 text-xs text-slate-500 sm:px-8">بنك الأسئلة · تعلّم، تدرّب، وتابع تقدّمك</footer>
        </div>
    </div>;
}
