import { Link, useForm } from '@inertiajs/react';

export default function SubjectForm({ subject = null }) {
    const { data, setData, post, put, errors, processing } = useForm({ name: subject?.name || '', level: subject?.level || 1 });
    const submit = e => {
        e.preventDefault();
        subject ? put(route('admin.subjects.update', subject.id)) : post(route('admin.subjects.store'));
    };
    return <main className="mx-auto max-w-xl space-y-6 p-6" dir="rtl">
        <h1 className="text-2xl font-bold">{subject ? 'تعديل المقرر' : 'إضافة مقرر'}</h1>
        <form onSubmit={submit} className="space-y-4">
            <div><label htmlFor="name">اسم المقرر</label>
                <input id="name" required maxLength={255} className="mt-2 block w-full rounded border p-2" value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p role="alert" className="text-red-700">{errors.name}</p>}
            </div>
            <div><label htmlFor="level">المستوى</label>
                <select id="level" className="mt-2 block w-full rounded border p-2" value={data.level} onChange={e => setData('level', Number(e.target.value))}>
                    {Array.from({ length: 9 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
                {errors.level && <p role="alert" className="text-red-700">{errors.level}</p>}
            </div>
            <button disabled={processing} className="rounded bg-blue-700 px-6 py-2 text-white">{processing ? 'جارٍ الحفظ...' : 'حفظ'}</button>
        </form>
        <Link className="inline-block text-blue-700" href={route('admin.subjects.index')}>العودة إلى المقررات</Link>
    </main>;
}
