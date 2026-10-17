import { adminLanguage, adminText as t } from '../../i18n/admin';
import { useEffect, useState } from 'react';
import AdminIcon from '../AdminIcon';
const letters = ['A', 'B', 'C', 'D'];
const date = (value) =>
    value
        ? new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Riyadh',
          }).format(new Date(value))
        : '—';
export default function AttemptReview({
    review,
    course,
    student,
    busy,
    onClose,
}) {
    const [onlyWrong, setOnlyWrong] = useState(false);
    useEffect(() => {
        setOnlyWrong(false);
    }, [review.attempt.id]);
    const items = onlyWrong
        ? review.items.filter((item) => !item.is_correct)
        : review.items;
    const wrong = review.items.filter((item) => !item.is_correct).length;
    const percentage =
        Math.round(
            (review.attempt.score / review.attempt.question_count) * 1000,
        ) / 10;
    return (
        <section
            className="admin-results-review"
            aria-labelledby="attempt-review-title"
        >
            <div className="admin-results-review-heading">
                <div>
                    <h3 id="attempt-review-title" tabIndex={-1}>
                        {t('مراجعة إجابات المحاولة #')}
                        {review.attempt.id}
                    </h3>
                    <p>
                        <bdi>{student.name}</bdi> · {course.name} ·{' '}
                        <bdi>
                            {date(
                                review.attempt.completed_at ||
                                    review.attempt.created_at,
                            )}
                        </bdi>
                    </p>
                </div>
                <div className="admin-results-review-actions">
                    <a
                        className="admin-button admin-button-primary"
                        href={route('admin.student-results.export', {
                            subject: course.id,
                            user: student.id,
                            attempt: review.attempt.id,
                            locale: adminLanguage(),
                        })}
                    >
                        <AdminIcon name="download" />
                        {t('تصدير الإجابات إلى Excel')}
                    </a>
                    <button
                        type="button"
                        className="admin-button admin-account-cancel"
                        disabled={busy}
                        onClick={onClose}
                    >
                        {t('إغلاق المراجعة')}
                    </button>
                </div>
            </div>
            <div className="admin-results-review-summary">
                <span>
                    {t('الدرجة: ')}
                    <bdi>
                        {review.attempt.score} / {review.attempt.question_count}
                    </bdi>
                </span>
                <strong>
                    <bdi>{percentage}%</bdi>
                </strong>
                <span>
                    {wrong}
                    {t(' إجابات خاطئة')}
                </span>
            </div>
            <p className="admin-results-note">
                {t(
                    'الأسئلة والإجابات محفوظة كما كانت وقت الاختبار. ملف Excel يشمل جميع أسئلة هذه المحاولة بنفس ترتيبها.',
                )}
            </p>
            <div
                className="admin-results-review-filters"
                role="group"
                aria-label={t('تصفية إجابات المحاولة')}
            >
                <button
                    type="button"
                    className={`admin-account-action admin-account-edit ${!onlyWrong ? 'is-selected' : ''}`}
                    aria-pressed={!onlyWrong}
                    onClick={() => setOnlyWrong(false)}
                >
                    {t('جميع الأسئلة (')}
                    {review.items.length})
                </button>
                <button
                    type="button"
                    className={`admin-account-action admin-account-edit ${onlyWrong ? 'is-selected' : ''}`}
                    aria-pressed={onlyWrong}
                    onClick={() => setOnlyWrong(true)}
                >
                    {t('الإجابات الخاطئة (')}
                    {wrong})
                </button>
            </div>
            <div
                className="admin-results-review-scroll"
                tabIndex={0}
                aria-label={t('أسئلة المحاولة وإجابات الطالب')}
            >
                {!items.length && (
                    <div className="admin-empty">
                        <AdminIcon name="tick" />
                        <h3>{t('لا توجد إجابات خاطئة')}</h3>
                        <p>{t('أجاب الطالب عن جميع الأسئلة بشكل صحيح.')}</p>
                    </div>
                )}
                {items.map((item) => (
                    <article
                        key={item.position}
                        className="admin-results-question"
                        aria-labelledby={`review-question-${item.position}`}
                    >
                        <div className="admin-results-question-heading">
                            <h4 id={`review-question-${item.position}`}>
                                {t('السؤال ')}
                                {item.position}
                            </h4>
                            <span
                                className={`admin-account-status ${item.is_correct ? 'is-active' : 'is-inactive'}`}
                            >
                                {item.is_correct
                                    ? t('إجابة صحيحة')
                                    : t('إجابة خاطئة')}
                            </span>
                        </div>
                        <p className="admin-results-question-text" dir="auto">
                            {item.question_text}
                        </p>
                        <ul
                            className="admin-results-options"
                            aria-label={t('خيارات السؤال {0}', {
                                0: item.position,
                            })}
                        >
                            {letters.map((letter) => {
                                const correct = item.correct_answer === letter;
                                const selected =
                                    item.selected_answer === letter;
                                return (
                                    <li
                                        key={letter}
                                        className={`${correct ? 'is-correct' : ''} ${selected && !correct ? 'is-wrong' : ''}`}
                                    >
                                        <span className="admin-results-option-letter">
                                            {letter}
                                        </span>
                                        <span
                                            className="admin-results-option-text"
                                            dir="auto"
                                        >
                                            {
                                                item[
                                                    `option_${letter.toLowerCase()}`
                                                ]
                                            }
                                        </span>
                                        <span className="admin-results-option-label">
                                            {correct && t('الإجابة الصحيحة')}
                                            {correct && selected && ' · '}
                                            {selected && t('إجابة الطالب')}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        {!item.selected_answer && (
                            <p className="admin-field-error">
                                {t('لم يجب الطالب عن هذا السؤال.')}
                            </p>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
