import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StudentLayout from '../../../Layouts/StudentLayout';
import StudentIcon from '../../../Components/StudentIcon';

const letters = ['A', 'B', 'C', 'D'];
const labels = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };

export default function Show({ attempt, course, items }) {
    const [onlyWrong, setOnlyWrong] = useState(false);
    useEffect(() => { setOnlyWrong(false); }, [attempt.id]);
    const visibleItems = onlyWrong ? items.filter(item => !item.is_correct) : items;
    const incorrectCount = items.filter(item => !item.is_correct).length;
    const percentage = Math.round(attempt.score / attempt.question_count * 100);

    return <StudentLayout title="مراجعة الإجابات" description="راجع إجاباتك وتعلّم من أخطائك" activeNav="results" selectedResultCourseId={course.id}>
        <Head title={`مراجعة الإجابات — ${course.name}`} />
        <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href={route('student.results.index', { subject_id: course.id })} className="hover:text-blue-700">سجل النتائج</Link><span aria-hidden="true">/</span>
            <Link href={route('student.quizzes.show', attempt.id)} className="hover:text-blue-700">نتيجة الاختبار</Link><span aria-hidden="true">/</span><span aria-current="page">مراجعة الإجابات</span>
        </nav>
        <section aria-label="ملخص المحاولة" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><h2 className="break-words text-xl font-bold">{course.name}</h2><p className="mt-2 text-xs leading-6 text-slate-500">المستوى {course.level} · المحاولة #{attempt.id} · {attempt.question_count} سؤالًا</p></div>
                <div className="flex shrink-0 items-center gap-4 rounded-xl bg-blue-50/60 px-5 py-3"><span className="text-3xl font-bold tabular-nums">{percentage}٪</span><div className="text-xs leading-6 text-slate-500"><p>الدرجة: <bdi>{attempt.score}</bdi> من <bdi>{attempt.question_count}</bdi></p><p>{incorrectCount} إجابات خاطئة</p></div></div>
            </div>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">تُعرض الأسئلة والإجابات كما كانت وقت إجراء الاختبار. المراجعة للاطلاع والتعلّم، ولا تغيّر نتيجتك.</p>
        </section>
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div role="group" aria-label="تصفية أسئلة المراجعة" className="flex flex-wrap gap-2">
                {[{ wrong: false, text: 'جميع الأسئلة', count: items.length }, { wrong: true, text: 'الإجابات الخاطئة', count: incorrectCount }].map(filter => <button key={String(filter.wrong)} type="button" aria-pressed={onlyWrong === filter.wrong} onClick={() => setOnlyWrong(filter.wrong)} className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${onlyWrong === filter.wrong ? 'border-[#001f3f] bg-[#001f3f] text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'}`}>{filter.text} ({filter.count})</button>)}
            </div>
            <Link href={route('student.quizzes.show', attempt.id)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">العودة إلى النتيجة<StudentIcon name="arrow" className="size-4" /></Link>
        </div>
        <p role="status" className="text-xs text-slate-500">عرض {visibleItems.length} من {items.length} سؤالًا</p>
        <section aria-label="الأسئلة والإجابات" className="space-y-5">
            {visibleItems.length === 0 && <div className="rounded-xl border border-emerald-100 bg-white p-10 text-center"><span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><StudentIcon name="tick" className="size-7" /></span><h2 className="text-lg font-bold">{onlyWrong ? 'لا توجد إجابات خاطئة' : 'لا توجد أسئلة للمراجعة'}</h2><p className="mt-2 text-sm text-slate-500">{onlyWrong ? 'أجبت عن جميع الأسئلة إجابة صحيحة.' : 'يمكنك العودة إلى نتيجة الاختبار.'}</p></div>}
            {visibleItems.map(item => <article key={item.position} aria-labelledby={`review-question-${item.position}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                    <h2 id={`review-question-${item.position}`} className="font-bold">السؤال {item.position}</h2>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${item.is_correct ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}`}><StudentIcon name={item.is_correct ? 'tick' : 'close'} className="size-3.5" />{item.is_correct ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}</span>
                </div>
                <div className="space-y-5 p-5 sm:p-7">
                    <p dir="auto" className="whitespace-pre-wrap break-words text-start text-lg font-semibold leading-9">{item.question_text}</p>
                    <ul aria-label={`خيارات السؤال ${item.position}`} className="space-y-3">
                        {letters.map(letter => {
                            const correct = letter === item.correct_answer;
                            const selected = letter === item.selected_answer;
                            return <li key={letter} className={`flex flex-wrap items-center gap-3 rounded-xl border p-4 ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : selected ? 'border-red-400 bg-red-50 text-red-900' : 'border-slate-200 text-slate-600'}`}>
                                <span aria-hidden="true" className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${correct ? 'bg-emerald-100' : selected ? 'bg-red-100' : 'bg-slate-100'}`}>{labels[letter]}</span>
                                <span dir="auto" className="min-w-0 flex-1 whitespace-pre-wrap break-words text-start text-sm leading-7">{item[`option_${letter.toLowerCase()}`]}</span>
                                {(correct || selected) && <span className="flex basis-full flex-wrap items-center gap-1 text-xs font-bold sm:basis-auto"><StudentIcon name={correct ? 'tick' : 'close'} className="size-4" />{selected && 'إجابتك'}{selected && correct && ' · '}{correct && 'الإجابة الصحيحة'}</span>}
                            </li>;
                        })}
                    </ul>
                </div>
            </article>)}
        </section>
        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-5">
            <Link href={route('student.quizzes.show', attempt.id)} className="rounded-lg bg-[#001f3f] px-5 py-3 text-sm font-medium text-white hover:bg-[#12385e]">النتيجة وإعادة الاختبار</Link>
            <Link href={route('student.results.index', { subject_id: course.id })} className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium hover:bg-slate-50">سجل نتائج المقرر</Link>
        </div>
    </StudentLayout>;
}
