import { Link } from '@inertiajs/react';
import FlashMessages from '../../../Components/FlashMessages';

export default function QuestionsShow({ subject, question }) {
    return <main className="mx-auto max-w-4xl space-y-6 p-6" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">عرض السؤال</h1>
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
                <Link
                    href={route('admin.questions.edit', { subject: subject.id, question: question.id })}
                    className="text-sm text-blue-700 hover:underline"
                >
                    تعديل السؤال
                </Link>
            </div>
        </div>

        <FlashMessages />

        <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
                <div className="border-b pb-4">
                    <h2 className="text-xl font-bold mb-3">نص السؤال</h2>
                    <p className="text-gray-700 whitespace-pre-line">{question.question_text}</p>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">الخيارات</h3>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="w-8 text-center font-mono text-gray-800">أ.</span>
                            <p className="text-gray-700 whitespace-pre-line">{question.option_a}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="w-8 text-center font-mono text-gray-800">ب.</span>
                            <p className="text-gray-700 whitespace-pre-line">{question.option_b}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="w-8 text-center font-mono text-gray-800">ج.</span>
                            <p className="text-gray-700 whitespace-pre-line">{question.option_c}</p>
                        </div>
                        <div className="flex items-center">
                            <span className="w-8 text-center font-mono text-gray-800">د.</span>
                            <p className="text-gray-700 whitespace-pre-line">{question.option_d}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">الإجابة الصحيحة:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {question.correct_answer}
                        </span>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    <p>تم الإنشاء: {new Date(question.created_at).toLocaleDateString('ar-SA')}</p>
                    {question.updated_at && (
                        <p>تم التحديث: {new Date(question.updated_at).toLocaleDateString('ar-SA')}</p>
                    )}
                </div>
            </div>
        </div>
    </main>;
}