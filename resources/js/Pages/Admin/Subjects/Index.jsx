import { Link, router, useForm } from '@inertiajs/react';
import FlashMessages from '../../../Components/FlashMessages';

export default function SubjectIndex({ subjects, filters = {} }) {
    const { data, setData, get, processing } = useForm({ search: filters.search || '', level: filters.level || '' });
    const remove = (subject) => {
        if (window.confirm(`هل تريد حذف المقرر «${subject.name}»؟ سيتم حذف أسئلته ومحاولات الطلاب ونتائجها المرتبطة به نهائيًا.`)) {
            router.delete(route('admin.subjects.destroy', subject.id));
        }
    };
    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <h1 className="text-2xl font-bold">إدارة المقررات</h1>
        <FlashMessages />
        <div className="flex gap-4">
            <Link href={route('admin.subjects.create')} className="rounded bg-blue-700 p-3 text-white">إضافة مقرر</Link>
            <Link href={route('admin.dashboard')} className="p-3">لوحة التحكم</Link>
        </div>
        <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); get(route('admin.subjects.index')); }}>
            <input aria-label="البحث باسم المقرر" placeholder="اسم المقرر" className="rounded border p-2" value={data.search} onChange={e => setData('search', e.target.value)} />
            <select aria-label="المستوى" className="rounded border p-2" value={data.level} onChange={e => setData('level', e.target.value)}>
                <option value="">جميع المستويات</option>
                {Array.from({ length: 9 }, (_, i) => <option key={i + 1} value={i + 1}>المستوى {i + 1}</option>)}
            </select>
            <button disabled={processing} className="rounded border px-4">بحث</button>
        </form>
        <div className="overflow-x-auto"><table className="w-full text-right">
            <thead><tr className="border-b"><th className="p-3">المقرر</th><th>المستوى</th><th>الإجراءات</th></tr></thead>
            <tbody>{subjects.data.map(subject => <tr key={subject.id} className="border-b">
                <td className="p-3"><Link href={route('admin.subjects.show', subject.id)}>{subject.name}</Link></td>
                <td>{subject.level}</td><td className="space-x-3">
                    <Link className="text-blue-700" href={route('admin.subjects.edit', subject.id)}>تعديل</Link>
                    <button className="text-red-700" onClick={() => remove(subject)}>حذف</button>
                </td>
            </tr>)}</tbody>
        </table></div>
        {!subjects.data.length && <p>لا توجد مقررات مطابقة.</p>}
        <nav className="flex gap-4" aria-label="صفحات المقررات">
            {subjects.prev_page_url && <Link href={subjects.prev_page_url}>السابق</Link>}
            <span>صفحة {subjects.current_page} من {subjects.last_page}</span>
            {subjects.next_page_url && <Link href={subjects.next_page_url}>التالي</Link>}
        </nav>
    </main>;
}
