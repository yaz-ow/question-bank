import { Link, useForm } from '@inertiajs/react';
import FlashMessages from '../../Components/FlashMessages';

export default function CourseDetails({ course, questionCounts = [], activeAttempt }) {
    const { data, setData, post, processing, errors } = useForm({
        question_count: questionCounts.find(count => count <= course.questions_count) ?? 10,
    });
    function start(event) {
        event.preventDefault();
        post(route('student.quizzes.store', { subject: course.id }));
    }
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
                <section className="space-y-4 rounded-lg border border-gray-200 p-4" aria-labelledby="quiz-title">
                    <h3 id="quiz-title" className="text-lg font-bold">اختبر معلوماتك</h3>
                    <p>الأسئلة المتاحة: {course.questions_count}</p>
                    <p className="text-sm text-gray-600">أسئلة عشوائية من هذا المقرر، وتصحيح فوري بعد كل إجابة. الاختبار دون مؤقت.</p>
                    {activeAttempt ? <div className="space-y-3">
                        <p>لديك اختبار لم يكتمل. أكمله أو اخرج منه قبل بدء اختبار جديد.</p>
                        <Link className="inline-block rounded bg-[#001F3F] px-5 py-3 text-white"
                            href={route('student.quizzes.show', { attempt: activeAttempt.id })}>متابعة الاختبار</Link>
                    </div> : <form onSubmit={start} className="space-y-4">
                        <fieldset>
                            <legend className="mb-2 font-medium">عدد الأسئلة</legend>
                            <div className="flex flex-wrap gap-3">
                                {questionCounts.map(count => <label key={count} className={`rounded border p-3 ${count > course.questions_count ? 'bg-gray-100 text-gray-500' : ''}`}>
                                    <input type="radio" name="question_count" value={count}
                                        checked={Number(data.question_count) === count}
                                        disabled={count > course.questions_count || processing}
                                        onChange={() => setData('question_count', count)} className="ml-2" />
                                    {count} سؤالًا {count > course.questions_count && '(غير متاح)'}
                                </label>)}
                            </div>
                        </fieldset>
                        {errors.question_count && <p role="alert" className="text-red-700">{errors.question_count}</p>}
                        {course.questions_count < 10 && <p className="text-sm text-gray-600">يتطلب بدء الاختبار توفر 10 أسئلة على الأقل.</p>}
                        <button disabled={processing || course.questions_count < 10} type="submit"
                            className="rounded bg-[#001F3F] px-5 py-3 text-white disabled:opacity-50">
                            {processing ? 'جارٍ إعداد الاختبار...' : 'بدء الاختبار'}
                        </button>
                    </form>}
                </section>
            </div>
        </div>
    </main>;
}
