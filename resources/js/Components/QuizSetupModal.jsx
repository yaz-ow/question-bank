import { Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import StudentIcon from './StudentIcon';

export default function QuizSetupModal({ course, questionCounts, activeAttempt, onClose }) {
    const dialogRef = useRef(null);
    const submitting = useRef(false);
    const { data, setData, post, processing, errors } = useForm({
        question_count: questionCounts.find(count => count <= course.questions_count) ?? null,
    });
    const canStart = questionCounts.includes(Number(data.question_count))
        && Number(data.question_count) <= course.questions_count;

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, []);

    function start(event) {
        event.preventDefault();
        if (!canStart || processing || submitting.current || activeAttempt) return;
        submitting.current = true;
        post(route('student.quizzes.store', { subject: course.id }), {
            preserveScroll: true,
            onFinish: () => { submitting.current = false; },
        });
    }

    function close() {
        if (!processing && !submitting.current) onClose();
    }

    return <dialog ref={dialogRef} dir="rtl" aria-labelledby="quiz-setup-title" aria-describedby="quiz-setup-course" onCancel={event => { event.preventDefault(); close(); }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-[#112d49] shadow-2xl backdrop:bg-slate-900/60">
        <header className="flex items-start justify-between gap-4 bg-[#001f3f] px-6 py-6 text-white">
            <div className="min-w-0">
                <h2 id="quiz-setup-title" className="text-2xl font-bold">تخصيص الاختبار</h2>
                <p id="quiz-setup-course" className="mt-1 break-words text-sm text-blue-200">{course.name}</p>
            </div>
            <button type="button" aria-label="إغلاق تخصيص الاختبار" onClick={close} disabled={processing} className="shrink-0 rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"><StudentIcon name="close" /></button>
        </header>
        <div className="space-y-6 p-6 sm:p-8">
            {activeAttempt ? <div className="space-y-5">
                <p className="text-sm leading-7 text-slate-600">لديك اختبار لم يكتمل{Number(activeAttempt.subject_id) !== Number(course.id) ? ' في مقرر آخر' : ''}. أكمله أو اخرج منه قبل بدء اختبار جديد.</p>
                <Link href={route('student.quizzes.show', { attempt: activeAttempt.id })} className="block rounded-lg bg-[#001f3f] px-5 py-4 text-center font-medium text-white hover:bg-[#12385e]">متابعة الاختبار</Link>
            </div> : <form onSubmit={start} className="space-y-6">
                <fieldset disabled={processing}>
                    <legend className="mb-5 text-sm leading-7 text-slate-600">حدد عدد الأسئلة التي ترغب في الإجابة عليها لبدء الاختبار:</legend>
                    <div className="grid grid-cols-3 gap-3">
                        {questionCounts.map(count => {
                            const unavailable = count > course.questions_count;
                            return <label key={count} className="min-w-0">
                                <input type="radio" name="question_count" value={count} checked={Number(data.question_count) === count} disabled={unavailable || processing} onChange={() => setData('question_count', count)} className="peer sr-only" />
                                <span className="flex h-full min-h-24 flex-col items-center justify-center rounded-lg border-2 border-slate-100 bg-slate-50 px-1 py-4 text-blue-900 transition-colors peer-checked:border-blue-800 peer-checked:bg-blue-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-40">
                                    <span className="text-3xl font-bold">{count}</span>
                                    <span className="mt-1 text-xs text-slate-500">سؤالًا</span>
                                    {unavailable && <span className="mt-1 text-[11px] text-slate-500">غير متاح</span>}
                                </span>
                            </label>;
                        })}
                    </div>
                </fieldset>
                <p className="text-center text-xs leading-6 text-slate-500">الأسئلة المتاحة في المقرر: {course.questions_count}</p>
                {!questionCounts.some(count => count <= course.questions_count) && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800">يتطلب بدء الاختبار توفر {Math.min(...questionCounts)} أسئلة على الأقل.</p>}
                {Object.values(errors).map((error, index) => <p key={index} role="alert" className="text-sm text-red-700">{error}</p>)}
                <button type="submit" disabled={!canStart || processing} className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#001f3f] px-5 py-4 font-medium text-white shadow-md transition-colors hover:bg-[#12385e] disabled:cursor-not-allowed disabled:opacity-50">
                    {processing ? 'جارٍ إعداد الاختبار...' : 'ابدأ الآن'}
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 5 10 7-10 7Z" /></svg>
                </button>
                <p className="text-center text-xs leading-6 text-slate-400">أسئلة عشوائية وتصحيح فوري، دون مؤقت.</p>
            </form>}
        </div>
    </dialog>;
}
