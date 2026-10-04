import { Link, router, useForm } from '@inertiajs/react';
import FlashMessages from '../../../Components/FlashMessages';

export default function QuestionsForm({ subject, question }) {
    const isEdit = question !== null;

    const defaultData = {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
    };

    const initialData = isEdit ? {
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_answer: question.correct_answer,
    } : defaultData;

    const { data, setData, post, processing, reset, recentSuccessful, errors } = useForm(initialData);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            post(route('admin.questions.update', { subject: subject.id, id: question.id }), {
                onSuccess: () => reset(),
                onError: () => {},
            });
        } else {
            post(route('admin.questions.store', { subject: subject.id }), {
                onSuccess: () => reset(),
                onError: () => {},
            });
        }
    };

    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">
                {isEdit ? 'تعديل السؤال' : 'إنشاء سؤال جديد'}
            </h1>
            <div className="flex space-x-3">
                <p className="text-sm text-gray-600">
                    المقرر: {subject.name} (المستوى {subject.level})
                </p>
                <Link
                    href={route('admin.questions.index', { subject: subject.id })}
                    className="px-3"
                >
                    العودة إلى قائمة الأسئلة
                </Link>
            </div>
        </div>

        <FlashMessages />

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص السؤال
                </label>
                <textarea
                    className={`block w-full rounded border p-3 h-24 ${errors.question_text ? 'border-red-500' : ''}`}
                    placeholder="أدخل نص السؤال هنا..."
                    value={data.question_text}
                    onChange={e => setData('question_text', e.target.value)}
                />
                {errors.question_text && <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الخيار أ
                    </label>
                    <input
                        className={`block w-full rounded border p-3 ${errors.option_a ? 'border-red-500' : ''}`}
                        placeholder="خيار أ"
                        value={data.option_a}
                        onChange={e => setData('option_a', e.target.value)}
                    />
                    {errors.option_a && <p className="mt-1 text-sm text-red-600">{errors.option_a}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الخيار ب
                    </label>
                    <input
                        className={`block w-full rounded border p-3 ${errors.option_b ? 'border-red-500' : ''}`}
                        placeholder="خيار ب"
                        value={data.option_b}
                        onChange={e => setData('option_b', e.target.value)}
                    />
                    {errors.option_b && <p className="mt-1 text-sm text-red-600">{errors.option_b}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الخيار ج
                    </label>
                    <input
                        className={`block w-full rounded border p-3 ${errors.option_c ? 'border-red-500' : ''}`}
                        placeholder="خيار ج"
                        value={data.option_c}
                        onChange={e => setData('option_c', e.target.value)}
                    />
                    {errors.option_c && <p className="mt-1 text-sm text-red-600">{errors.option_c}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        الخيار د
                    </label>
                    <input
                        className={`block w-full rounded border p-3 ${errors.option_d ? 'border-red-500' : ''}`}
                        placeholder="خيار د"
                        value={data.option_d}
                        onChange={e => setData('option_d', e.target.value)}
                    />
                    {errors.option_d && <p className="mt-1 text-sm text-red-600">{errors.option_d}</p>}
                </div>
            </div>

            <div className="border-t pt-4">
                <fieldset className="border-b pb-4">
                    <legend className="px-2 text-sm font-medium text-gray-600">
                        الإجابة الصحيحة
                    </legend>
                    <div className="flex space-x-6">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="answer-a"
                                name="correct_answer"
                                value="A"
                                checked={data.correct_answer === 'A'}
                                onChange={e => setData('correct_answer', 'A')}
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="answer-a">
                                أ
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="answer-b"
                                name="correct_answer"
                                value="B"
                                checked={data.correct_answer === 'B'}
                                onChange={e => setData('correct_answer', 'B')}
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="answer-b">
                                ب
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="answer-c"
                                name="correct_answer"
                                value="C"
                                checked={data.correct_answer === 'C'}
                                onChange={e => setData('correct_answer', 'C')}
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="answer-c">
                                ج
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="answer-d"
                                name="correct_answer"
                                value="D"
                                checked={data.correct_answer === 'D'}
                                onChange={e => setData('correct_answer', 'D')}
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700" htmlFor="answer-d">
                                د
                            </label>
                        </div>
                    </div>
                    {errors.correct_answer && <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>}
                </fieldset>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                {isEdit && (
                    <button
                        onClick={() => router.delete(route('admin.questions.destroy', { subject: subject.id, id: question.id }))}
                        className="text-red-700 hover:underline"
                    >
                        حذف السؤال
                    </button>
                )}
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => router.get(route('admin.questions.index', { subject: subject.id }))}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        {isEdit ? 'تحديث السؤال' : 'إنشاء السؤال'}
                    </button>
                </div>
            </div>
        </form>
    </main>;
}