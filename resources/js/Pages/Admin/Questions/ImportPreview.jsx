import { Link, router, useForm } from '@inertiajs/react';
import FlashMessages from '../../../Components/FlashMessages';

export default function QuestionsImportPreview({ subject, rows, validCount, duplicateCount, errorCount, hasErrors }) {
    const { data, setData, post, processing } = useForm({});

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.questions.import.confirm', { subject: subject.id }), {
            onError: () => {},
        });
    };

    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">معاينة استيراد الأسئلة</h1>
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

        <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
                <div className="border-b pb-4">
                    <h2 className="text-xl font-bold">ملخص الاستيراد</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm">الأسئلة الصالحة:</p>
                            <p className="font-bold text-lg">{validCount}</p>
                        </div>
                        <div>
                            <p className="text-sm">الأسئلة المكررة (سيتم تخطيها):</p>
                            <p className="font-bold text-lg">{duplicateCount}</p>
                        </div>
                        <div>
                            <p className="text-sm">أخطاء التحقق:</p>
                            <p className="font-bold text-lg">{errorCount}</p>
                        </div>
                        <div>
                            <p className="text-sm">الإجمالي في الملف:</p>
                            <p className="font-bold text-lg">{validCount + duplicateCount + errorCount}</p>
                        </div>
                    </div>
                </div>

                {!hasErrors && (
                    <>
                        <div className="border-b pb-4">
                            <h2 className="text-xl font-bold">معاينة الأسئلة (الأولى 10)</h2>
                            <div className="overflow-x-auto"><table className="w-full text-right">
                                <thead><tr className="border-b"><th className="p-3">نص السؤال</th><th className="w-20">الخيار أ</th><th className="w-20">الخيار ب</th><th className="w-20">الخيار ج</th><th className="w-20">الخيار د</th><th className="w-10">الإجابة</th></tr></thead>
                                <tbody>
                                    {rows.map((row, index) => <tr key={index} className="border-b">
                                        <td className="p-3">{row.question_text}</td>
                                        <td className="p-2">{row.option_a}</td>
                                        <td className="p-2">{row.option_b}</td>
                                        <td className="p-2">{row.option_c}</td>
                                        <td className="p-2">{row.option_d}</td>
                                        <td className="p-2 text-center">{row.correct_answer}</td>
                                    </tr>)}
                                </tbody>
                            </table></div>
                        </div>

                        <div className="border-b pb-4">
                            <h2 className="text-xl font-bold">تنسيق الملف المطلوب</h2>
                            <p className="text-sm">يرجى تنزيل القالب للتأكد من التنسيق الصحيح:</p>
                            <Link
                                href={route('admin.questions.download.template', { subject: subject.id })}
                                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                تنزيل القالب
                            </Link>
                        </div>
                    </>
                )}

                {hasErrors && (
                    <div className="border-b pb-4">
                        <h2 className="text-xl font-bold">أخطاء في الملف</h2>
                        <p className="text-sm text-red-600">
                            يرجى تصحيح الأخطاء المذكورة أعلاه وإعادة رفع الملف.
                        </p>
                    </div>
                )}
            </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
            {hasErrors && (
                <Link
                    href={route('admin.questions.index', { subject: subject.id })}
                    className="px-3"
                >
                    العودة إلى قائمة الأسئلة
                </Link>
            )}
            {!hasErrors && (
                <>
                    <button
                        type="button"
                        onClick={() => router.get(route('admin.questions.index', { subject: subject.id }))}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        إلغاء
                    </button>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="file"
                                id="excel-file"
                                name="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={e => {
                                    if (e.target.files.length > 0) {
                                        setData('file', e.target.files[0]);
                                    }
                                }}
                            />
                            <label
                                htmlFor="excel-file"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                اختيار ملف آخر
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            تأكيد الاستيراد
                        </button>
                    </form>
                </>
            )}
        </div>
    </main>;
}