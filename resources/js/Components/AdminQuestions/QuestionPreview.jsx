import { useState } from 'react';
import AdminIcon from '../AdminIcon';

export const choices = [
    { key: 'A', label: 'A', field: 'option_a' },
    { key: 'B', label: 'B', field: 'option_b' },
    { key: 'C', label: 'C', field: 'option_c' },
    { key: 'D', label: 'D', field: 'option_d' },
];
export const number = (value) => new Intl.NumberFormat('en-US').format(value);
export const emptyQuestion = {
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
};

export function QuestionContent({ question, showAnswer = true }) {
    return (
        <div className="admin-question-preview-content">
            <p className="admin-full-question" dir="auto">
                {question.question_text || 'اكتب نص السؤال لمعاينته.'}
            </p>
            <ol className="admin-preview-choices">
                {choices.map((choice) => (
                    <li
                        key={choice.key}
                        className={
                            showAnswer && question.correct_answer === choice.key
                                ? 'is-correct'
                                : ''
                        }
                    >
                        <span className="admin-choice-letter">
                            {choice.label}
                        </span>
                        <span dir="auto">
                            {question[choice.field] || `الخيار ${choice.label}`}
                        </span>
                        {showAnswer &&
                            question.correct_answer === choice.key && (
                                <AdminIcon name="tick" />
                            )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function QuestionPreview({ question, onClose, onEdit, busy }) {
    const [showAnswer, setShowAnswer] = useState(false);
    return (
        <section
            className="admin-panel admin-question-pane"
            aria-labelledby="question-preview-title"
        >
            <div className="admin-question-pane-heading">
                <h2 id="question-preview-title">
                    <AdminIcon name="eye" />
                    معاينة السؤال
                </h2>
            </div>
            <p className="admin-pane-hint">
                عرض السؤال وخياراته بالشكل الذي يراه الطالب.
            </p>
            <QuestionContent question={question} showAnswer={showAnswer} />
            <label className="admin-show-answer">
                <input
                    type="checkbox"
                    checked={showAnswer}
                    onChange={(e) => setShowAnswer(e.target.checked)}
                />{' '}
                إظهار الإجابة الصحيحة
            </label>
            <div className="admin-pane-actions">
                {question.id && (
                    <button
                        type="button"
                        className="admin-button admin-button-primary"
                        onClick={() => onEdit(question)}
                        disabled={busy}
                    >
                        <AdminIcon name="edit" />
                        تعديل السؤال
                    </button>
                )}
                <button
                    type="button"
                    className="admin-button admin-secondary-button"
                    onClick={onClose}
                    disabled={busy}
                >
                    العودة للمحرر
                </button>
            </div>
        </section>
    );
}
