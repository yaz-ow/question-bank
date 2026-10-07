import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import StudentIcon from '../../../Components/StudentIcon';

const letters = ['A', 'B', 'C', 'D'];
const labels = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };
const number = value => new Intl.NumberFormat('ar-SA').format(value);

export default function Show({ attempt, course, question, feedback }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [exitOpen, setExitOpen] = useState(false);
    const pending = useRef(false);
    const confirmingExit = useRef(false);
    const questionHeading = useRef(null);
    const exitDialog = useRef(null);
    const { errors = {}, auth } = usePage().props;
    const answered = question.position - 1 + (feedback ? 1 : 0);
    const percentage = Math.round(answered / attempt.question_count * 100);
    const lastQuestion = question.position === attempt.question_count;

    const submit = useCallback((action, data = {}) => {
        if (pending.current || (confirmingExit.current && action !== 'abandon')) return;
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
        if (!feedback || busy || exitOpen || error) return;
        const timer = window.setTimeout(() => {
            submit('next', { position: question.position });
        }, 3000);
        return () => window.clearTimeout(timer);
    }, [feedback, busy, exitOpen, error, question.position, submit]);

    useEffect(() => {
        const warn = event => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, []);

    useEffect(() => {
        if (!exitOpen) return;
        const dialog = exitDialog.current;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus();
        };
    }, [exitOpen]);

    function openExit() {
        if (pending.current) return;
        confirmingExit.current = true;
        setExitOpen(true);
    }

    function cancelExit() {
        if (pending.current) return;
        confirmingExit.current = false;
        setExitOpen(false);
        setError('');
    }

    return <div dir="rtl" className="student-dashboard min-h-screen bg-[#f5f7fb] text-[#112d49]">
        <Head title={`اختبار ${course.name}`} />
        <header className="border-b border-slate-200/70 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
                <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                    <span className="hidden items-center gap-2 whitespace-nowrap text-lg font-bold sm:flex"><StudentIcon className="size-7" />بنك الأسئلة</span>
                    <div className="min-w-0 sm:border-r sm:border-slate-200 sm:pr-6">
                        <h1 className="break-words text-lg font-bold sm:text-xl">{course.name}</h1>
                        <p className="mt-1 text-xs text-slate-500">المستوى {number(course.level)} · اختبار تدريبي</p>
                    </div>
                </div>
                <button type="button" disabled={busy} onClick={openExit} className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"><StudentIcon name="exit" className="size-4" />إنهاء الاختبار</button>
            </div>
        </header>

        <main className="mx-auto grid max-w-7xl items-start gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-8">
            <aside aria-label="تقدم الاختبار" className="order-2 space-y-4 lg:order-1">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="progress-title">
                    <div className="flex items-center justify-between gap-3"><h2 id="progress-title" className="text-sm font-bold">تقدّمك في الاختبار</h2><StudentIcon name="chart" className="size-5 text-slate-400" /></div>
                    <div className="mb-2 mt-5 flex items-center justify-between gap-3 text-xs"><span className="text-slate-500">تمت الإجابة</span><span className="font-bold">{number(answered)} من {number(attempt.question_count)}</span></div>
                    <progress value={answered} max={attempt.question_count} aria-label="الأسئلة المجاب عنها" className="block h-2 w-full overflow-hidden rounded-full accent-[#001f3f]" />
                    <p className="mt-3 text-xs text-slate-500">المتبقي {number(attempt.question_count - answered)} سؤالًا · اكتمل {number(percentage)}٪</p>
                    <div className="my-5 border-t border-slate-100" />
                    <h3 className="mb-4 text-sm font-bold">خريطة الأسئلة</h3>
                    <ol aria-label="حالات الأسئلة" className="grid grid-cols-5 gap-2">
                        {Array.from({ length: attempt.question_count }, (_, i) => i + 1).map(position => {
                            const current = position === question.position;
                            const done = position <= answered;
                            return <li key={position} aria-current={current ? 'step' : undefined} aria-label={`السؤال ${position}: ${current ? 'الحالي، ' : ''}${done ? 'تمت الإجابة' : 'لم تتم الإجابة'}`}
                                className={`relative flex min-h-10 items-center justify-center rounded-lg text-xs font-medium ${done ? 'bg-[#001f3f] text-white' : current ? 'border-2 border-blue-700 bg-blue-50 text-blue-900' : 'bg-slate-100 text-slate-500'} ${current && done ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                                {number(position)}{done && <span aria-hidden="true" className="absolute left-1 top-0.5 text-[9px]">✓</span>}
                            </li>;
                        })}
                    </ol>
                    <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                        <li className="flex items-center gap-2"><span aria-hidden="true" className="flex size-4 items-center justify-center rounded bg-[#001f3f] text-[10px] text-white">✓</span>تمت الإجابة</li>
                        <li className="flex items-center gap-2"><span aria-hidden="true" className="size-4 rounded border-2 border-blue-700 bg-blue-50" />السؤال الحالي</li>
                        <li className="flex items-center gap-2"><span aria-hidden="true" className="size-4 rounded bg-slate-100" />لم تتم الإجابة</li>
                    </ul>
                </section>
                <div className="flex items-center gap-3 rounded-xl bg-[#001f3f] p-4 text-white">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">{(auth?.user?.name || 'طالب').trim().slice(0, 1)}</span>
                    <div className="min-w-0"><p className="break-words text-sm font-medium">{auth?.user?.name || 'طالب'}</p>{auth?.user?.university_id && <p className="mt-1 text-xs text-blue-200"><bdi>{auth.user.university_id}</bdi></p>}</div>
                </div>
            </aside>

            <section aria-labelledby="question-title" className="order-1 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:order-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-blue-50/60 px-5 py-4 sm:px-8">
                    <span className="text-sm font-bold">السؤال {number(question.position)} من {number(attempt.question_count)}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">اختيار من متعدد</span>
                </div>
                <div className="space-y-6 p-5 sm:p-8">
                    <h2 id="question-title" ref={questionHeading} tabIndex={-1} dir="auto" className="whitespace-pre-wrap break-words text-start text-xl font-semibold leading-10 outline-none sm:text-2xl sm:leading-10">{question.question_text}</h2>
                    <p className="text-sm leading-6 text-slate-500">اختر إجابة واحدة؛ تُحفظ إجابتك ويظهر التصحيح مباشرة.</p>
                    <div role="group" aria-label="خيارات الإجابة" className="space-y-3">
                        {letters.map(letter => {
                            const correct = feedback?.correct_answer === letter;
                            const wrong = feedback?.selected_answer === letter && !correct;
                            return <button key={letter} type="button" disabled={busy || Boolean(feedback)} onClick={() => submit('answer', { position: question.position, answer: letter })}
                                className={`flex w-full flex-wrap items-center gap-3 rounded-xl border-2 p-4 text-start transition-colors sm:p-5 ${correct ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : wrong ? 'border-red-500 bg-red-50 text-red-900' : 'border-slate-200 bg-white enabled:hover:border-blue-400 enabled:hover:bg-blue-50/40'} ${busy && !feedback ? 'opacity-60' : ''}`}>
                                <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${correct ? 'bg-emerald-100' : wrong ? 'bg-red-100' : 'bg-slate-100 text-slate-600'}`}>{labels[letter]}</span>
                                <span dir="auto" className="min-w-0 flex-1 whitespace-pre-wrap break-words text-base leading-7">{question[`option_${letter.toLowerCase()}`]}</span>
                                {correct && <span className="flex items-center gap-1 text-xs font-bold"><span aria-hidden="true">✓</span>الإجابة الصحيحة</span>}
                                {wrong && <span className="flex items-center gap-1 text-xs font-bold"><StudentIcon name="close" className="size-4" />إجابتك</span>}
                            </button>;
                        })}
                    </div>
                    <div aria-live="polite" aria-atomic="true">
                        {feedback && <div className={`rounded-xl border p-4 ${feedback.is_correct ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
                            <p className="font-bold">{feedback.is_correct ? 'إجابة صحيحة، أحسنت!' : `إجابة غير صحيحة. الإجابة الصحيحة: ${labels[feedback.correct_answer]}`}</p>
                            {!error && <p className="mt-2 text-sm leading-6">{lastQuestion ? 'سيتم عرض النتيجة تلقائيًا بعد التصحيح.' : 'سيتم الانتقال تلقائيًا إلى السؤال التالي بعد التصحيح.'}</p>}
                        </div>}
                        {!feedback && busy && <p className="text-sm text-slate-500">جارٍ حفظ الإجابة...</p>}
                    </div>
                    {!exitOpen && (error || errors.answer || errors.position) && <p role="alert" className="text-sm text-red-700">{error || errors.answer || errors.position}</p>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-8">
                    <p className="flex items-center gap-2 text-xs leading-6 text-slate-500"><StudentIcon name="check" className="size-4 shrink-0" />{feedback ? 'تم حفظ إجابتك' : 'الاختبار دون مؤقت'}</p>
                    {feedback && <button type="button" disabled={busy} onClick={() => submit('next', { position: question.position })} className="flex items-center gap-2 rounded-lg bg-[#001f3f] px-5 py-3 text-sm font-medium text-white hover:bg-[#12385e] disabled:opacity-50">{lastQuestion ? 'عرض النتيجة' : 'السؤال التالي'}<StudentIcon name="arrow" className="size-4" /></button>}
                </div>
            </section>
        </main>
        <footer className="mx-auto max-w-7xl px-5 pb-6 text-center text-xs leading-6 text-slate-400 sm:px-8">بنك الأسئلة · تعلّم، تدرّب، وتابع تقدّمك</footer>

        <dialog ref={exitDialog} dir="rtl" aria-labelledby="exit-title" aria-describedby="exit-description" onCancel={event => { event.preventDefault(); cancelExit(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-[#112d49] shadow-2xl backdrop:bg-slate-900/60 sm:p-8">
            <h2 id="exit-title" className="text-xl font-bold">إنهاء الاختبار؟</h2>
            <p id="exit-description" className="mt-3 text-sm leading-7 text-slate-600">إذا أنهيت الاختبار الآن، فلن تُحتسب لك درجة. هل تريد المتابعة في الإنهاء؟</p>
            {error && exitOpen && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" autoFocus disabled={busy} onClick={cancelExit} className="flex-1 rounded-lg bg-[#001f3f] px-4 py-3 text-sm text-white hover:bg-[#12385e] disabled:opacity-50">متابعة الاختبار</button>
                <button type="button" disabled={busy} onClick={() => submit('abandon')} className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50">{busy ? 'جارٍ الإنهاء...' : 'إنهاء دون درجة'}</button>
            </div>
        </dialog>
    </div>;
}
