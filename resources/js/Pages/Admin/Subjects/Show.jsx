import { Link } from '@inertiajs/react';

export default function SubjectShow({ subject }) {
    return <main className="mx-auto max-w-xl space-y-6 p-6" dir="rtl">
        <h1 className="text-2xl font-bold">{subject.name}</h1>
        <p>المستوى: {subject.level}</p>
        <div className="flex gap-4">
            <Link href={route('admin.subjects.edit', subject.id)}>تعديل المقرر</Link>
            <Link href={route('admin.questions.index', { subject: subject.id })}>إدارة الأسئلة ({subject.questions_count || 0} سؤال)</Link>
            <Link href={route('admin.subjects.index')}>العودة إلى المقررات</Link>
        </div>
    </main>;
}
