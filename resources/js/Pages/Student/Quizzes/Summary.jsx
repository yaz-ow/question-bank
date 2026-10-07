import { Head, Link, useForm } from '@inertiajs/react';

export default function Summary({ attempt, course, canRetry }) {
    const { post, processing, errors } = useForm({});
    const completed = attempt.status === 'completed';

    return <main dir="rtl" className="mx-auto max-w-2xl space-y-6 p-6 sm:p-10">
        <Head title={completed ? 'نتيجة الاختبار' : 'انتهى الاختبار'} />
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#001F3F]">{completed ? 'أكملت الاختبار' : 'تم إنهاء الاختبار'}</h1>
            <p className="text-lg">{course.name}</p>
            {completed ? <div className="space-y-2">
                <p className="text-4xl font-bold text-[#001F3F]" dir="ltr">{attempt.score} / {attempt.question_count}</p>
                <p>النسبة: {Math.round(attempt.score / attempt.question_count * 100)}٪</p>
                <p>الإجابات غير الصحيحة: {attempt.question_count - attempt.score}</p>
            </div> : <p>خرجت قبل إكمال الاختبار، لذلك لم تُحتسب لك درجة.</p>}
            {completed && <div className="space-y-3">
                <button type="button" disabled={!canRetry || processing}
                    onClick={() => post(route('student.quizzes.retry', { attempt: attempt.id }))}
                    className="rounded bg-[#001F3F] px-5 py-3 text-white disabled:opacity-50">
                    {processing ? 'جارٍ إعداد الاختبار...' : `إعادة المحاولة (${attempt.question_count} سؤالًا)`}
                </button>
                <p className="text-sm text-gray-600">تُختار أسئلة عشوائية جديدة قدر المتاح. قد تتكرر بعض الأسئلة إذا كان عدد أسئلة المقرر محدودًا.</p>
                {!canRetry && <p className="text-red-700">عدد الأسئلة المتاح حاليًا لا يكفي لإعادة الاختبار بنفس العدد.</p>}
                {errors.question_count && <p role="alert" className="text-red-700">{errors.question_count}</p>}
            </div>}
            <div className="flex flex-wrap justify-center gap-5 pt-4">
                <Link href={route('student.results.index')} className="text-blue-700 underline">سجل النتائج</Link>
                {completed && <Link href={route('student.results.show', attempt.id)} className="text-blue-700 underline">مراجعة الإجابات</Link>}
                <Link href={route('student.level.courses', { level: course.level })} className="text-blue-700 underline">العودة إلى المقررات</Link>
                <Link href={route('student.levels')} className="text-blue-700 underline">تصفح المستويات</Link>
            </div>
        </section>
    </main>;
}
