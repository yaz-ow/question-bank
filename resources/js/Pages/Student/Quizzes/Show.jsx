import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';

export default function Show({ attempt, course, question, feedback }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const pending = useRef(false);
    const leaving = useRef(false);
    const questionHeading = useRef(null);
    const { errors = {} } = usePage().props;

    const submit = useCallback((action, data = {}) => {
        if (pending.current) return;
        pending.current = true;
        setBusy(true);
        setError('');
        router.post(route(`student.quizzes.${action}`, { attempt: attempt.id }), data, {
            preserveScroll: true,
            onError: () => setError('تعذر حفظ الطلب. حاول مجددًا.'),
            onFinish: () => {
                pending.current = false;
                setBusy(false);
            },
        });
    }, [attempt.id]);

    useEffect(() => {
        questionHeading.current?.focus();
        setError('');
    }, [question.position]);

    useEffect(() => {
        if (!feedback) return;
        const timer = window.setTimeout(() => {
            if (!leaving.current) submit('next', { position: question.position });
        }, 2000);
        return () => window.clearTimeout(timer);
    }, [feedback, question.position, submit]);

    useEffect(() => {
        const warn = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, []);

    function exit() {
        if (pending.current) return;
        leaving.current = true;
        if (window.confirm('هل تريد إنهاء الاختبار؟ لن تُحتسب لك درجة إذا خرجت قبل الإكمال.')) {
            submit('abandon');
        }
        leaving.current = false;
    }

    return <main dir="rtl" className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <Head title={`اختبار ${course.name}`} />
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-xl font-bold text-[#001F3F]">{course.name}</h1>
                <p className="mt-1 text-gray-600">السؤال {question.position} من {attempt.question_count}</p></div>
            <button type="button" disabled={busy} onClick={exit}
                className="rounded border border-red-300 px-4 py-2 text-red-700 disabled:opacity-50">الخروج من الاختبار</button>
        </header>
        <progress className="h-3 w-full accent-[#001F3F]" value={question.position - 1 + (feedback ? 1 : 0)}
            max={attempt.question_count} aria-label="تقدم الاختبار" />
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 ref={questionHeading} tabIndex={-1} dir="auto"
                className="whitespace-pre-wrap break-words text-start text-xl font-semibold outline-none">{question.question_text}</h2>
            <p className="text-sm text-gray-600">اختر إجابة واحدة؛ يتم حفظها وتصحيحها مباشرة.</p>
            <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map(letter => {
                    const correct = feedback?.correct_answer === letter;
                    const wrong = feedback?.selected_answer === letter && !correct;
                    return <button key={letter} type="button" disabled={busy || Boolean(feedback)}
                        onClick={() => submit('answer', { position: question.position, answer: letter })}
                        className={`flex w-full items-start gap-3 rounded-lg border-2 p-4 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${correct
                            ? 'border-green-600 bg-green-50 text-green-900'
                            : wrong ? 'border-red-600 bg-red-50 text-red-900'
                                : 'border-gray-200 enabled:hover:border-blue-500 enabled:hover:bg-blue-50'}`}>
                        <span className="font-bold" dir="ltr">{letter}</span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words" dir="auto">{question[`option_${letter.toLowerCase()}`]}</span>
                        {correct && <span className="text-sm font-bold">الإجابة الصحيحة</span>}
                        {wrong && <span className="text-sm font-bold">إجابتك</span>}
                    </button>;
                })}
            </div>
            <div aria-live="polite" aria-atomic="true">
                {feedback && <div className="space-y-3">
                    <p className={`font-bold ${feedback.is_correct ? 'text-green-800' : 'text-red-800'}`}>
                        {feedback.is_correct ? 'إجابة صحيحة!' : `إجابة غير صحيحة. الإجابة الصحيحة: ${feedback.correct_answer}`}
                    </p>
                    <p className="text-sm text-gray-600">سيتم الانتقال تلقائيًا بعد عرض التصحيح.</p>
                    <button type="button" disabled={busy} onClick={() => submit('next', { position: question.position })}
                        className="rounded bg-[#001F3F] px-5 py-2 text-white disabled:opacity-50">
                        {question.position === attempt.question_count ? 'عرض النتيجة' : 'السؤال التالي'}
                    </button>
                </div>}
                {!feedback && busy && <p>جارٍ حفظ الإجابة...</p>}
            </div>
            {(error || errors.answer || errors.position) && <p role="alert" className="text-red-700">{error || errors.answer || errors.position}</p>}
        </section>
    </main>;
}
