import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import StudentIcon from '../Components/StudentIcon';

export default function StudentLayout({ children }) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const name = auth?.user?.name || 'طالب';
    const nav = [
        { text: 'الرئيسية', icon: 'home', href: route('student.dashboard'), active: true },
        { text: 'المستويات', icon: 'book', href: route('student.levels') },
        { text: 'سجل النتائج', icon: 'chart', href: route('student.results.index') },
    ];
    return <div dir="rtl" className="student-dashboard min-h-screen bg-[#f5f7fb] text-[#112d49]">
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 flex-col bg-[#001f3f] px-5 py-8 text-white lg:flex">
            <Link href={route('student.dashboard')} className="mb-12 flex items-center gap-3 px-3 text-xl font-bold"><StudentIcon className="size-9" />بنك الأسئلة</Link>
            <p className="mb-3 px-3 text-xs font-medium tracking-wide text-slate-400">مساحتك التعليمية</p>
            <nav aria-label="تنقل الطالب" className="space-y-2">
                {nav.map(item => <Link key={item.text} href={item.href} aria-current={item.active ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${item.active ? 'bg-white/15 font-bold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><StudentIcon name={item.icon} />{item.text}</Link>)}
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
                            <h1 className="break-words text-xl font-bold leading-8 sm:text-2xl">مرحبًا، <bdi>{name}</bdi></h1>
                            <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">مستوياتك الدراسية، في مكان واحد</p>
                        </div>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600" aria-hidden="true">{name.trim().slice(0, 1)}</span>
                </div>
                {menuOpen && <nav id="student-mobile-nav" aria-label="تنقل الطالب على الجوال" className="space-y-1 border-t border-slate-100 px-5 py-3 lg:hidden">{nav.map(item => <Link key={item.text} href={item.href} onClick={() => setMenuOpen(false)} aria-current={item.active ? 'page' : undefined} className="block rounded-lg px-3 py-3 text-sm hover:bg-slate-100">{item.text}</Link>)}<Link href={route('logout')} as="button" method="post" className="w-full px-3 py-3 text-right text-sm text-red-700">تسجيل الخروج</Link></nav>}
            </header>
            <main className="mx-auto max-w-7xl space-y-8 px-5 py-6 sm:px-8">{children}</main>
            <footer className="mx-auto max-w-7xl px-5 pb-6 text-xs text-slate-500 sm:px-8">بنك الأسئلة · تعلّم، تدرّب، وتابع تقدّمك</footer>
        </div>
    </div>;
}
