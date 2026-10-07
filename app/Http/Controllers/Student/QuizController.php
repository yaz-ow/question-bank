<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuizController extends Controller
{
    public function store(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'question_count' => ['required', 'integer', Rule::in(QuizAttempt::QUESTION_COUNTS)],
        ], ['question_count.*' => 'اختر 10 أو 20 أو 30 سؤالًا.']);

        $attempt = $this->start($request, $subject, (int) $data['question_count']);

        return to_route('student.quizzes.show', $attempt);
    }

    public function show(Request $request, QuizAttempt $attempt)
    {
        $this->ensureOwner($request, $attempt);
        $subject = $attempt->subject;
        $summary = $attempt->only(['id', 'status', 'question_count', 'current_position']);

        if ($attempt->status !== 'in_progress') {
            return Inertia::render('Student/Quizzes/Summary', [
                'attempt' => array_merge($summary, [
                    'score' => $attempt->status === 'completed' ? $attempt->score : null,
                ]),
                'course' => $subject->only(['id', 'name', 'level']),
                'canRetry' => $attempt->status === 'completed'
                    && $subject->questions()->count() >= $attempt->question_count,
            ]);
        }

        $item = $attempt->items()->where('position', $attempt->current_position)->firstOrFail();

        return Inertia::render('Student/Quizzes/Show', [
            'attempt' => $summary,
            'course' => $subject->only(['id', 'name', 'level']),
            'question' => $item->only(['position', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d']),
            // Only this question's key is revealed, after its answer is committed.
            'feedback' => $item->answered_at ? [
                'selected_answer' => $item->selected_answer,
                'correct_answer' => $item->correct_answer,
                'is_correct' => $item->is_correct,
            ] : null,
        ]);
    }

    public function answer(Request $request, QuizAttempt $attempt)
    {
        $this->ensureOwner($request, $attempt);
        $data = $request->validate([
            'position' => ['required', 'integer', 'min:1', 'max:'.$attempt->question_count],
            'answer' => ['required', Rule::in(['A', 'B', 'C', 'D'])],
        ], ['answer.*' => 'اختر إجابة واحدة من الخيارات الأربعة.']);

        DB::transaction(function () use ($attempt, $data) {
            $locked = QuizAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->status === 'in_progress', 409);
            abort_if((int) $data['position'] > $locked->current_position, 422);
            // Old requests and second clicks cannot replace an accepted answer.
            if ((int) $data['position'] < $locked->current_position) {
                return;
            }
            $item = $locked->items()->where('position', $locked->current_position)->firstOrFail();
            if (! $item->answered_at) {
                $item->update([
                    'selected_answer' => $data['answer'],
                    'is_correct' => $data['answer'] === $item->correct_answer,
                    'answered_at' => now(),
                ]);
            }
        }, 3);

        return to_route('student.quizzes.show', $attempt);
    }

    public function next(Request $request, QuizAttempt $attempt)
    {
        $this->ensureOwner($request, $attempt);
        $data = $request->validate([
            'position' => ['required', 'integer', 'min:1', 'max:'.$attempt->question_count],
        ]);

        DB::transaction(function () use ($attempt, $data) {
            $locked = QuizAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->status === 'abandoned', 409);
            if ($locked->status === 'completed' || (int) $data['position'] < $locked->current_position) {
                return;
            }
            abort_unless((int) $data['position'] === $locked->current_position, 422);
            $item = $locked->items()->where('position', $locked->current_position)->firstOrFail();
            abort_unless($item->answered_at !== null, 422);

            if ($locked->current_position === $locked->question_count) {
                abort_unless($locked->items()->whereNotNull('answered_at')->count() === $locked->question_count, 422);
                $locked->update([
                    'status' => 'completed',
                    'score' => $locked->items()->where('is_correct', true)->count(),
                    'completed_at' => now(),
                ]);
            } else {
                $locked->increment('current_position');
            }
        }, 3);

        return to_route('student.quizzes.show', $attempt);
    }

    public function abandon(Request $request, QuizAttempt $attempt)
    {
        $this->ensureOwner($request, $attempt);
        DB::transaction(function () use ($attempt) {
            $locked = QuizAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            if ($locked->status === 'in_progress') {
                $locked->update(['status' => 'abandoned', 'score' => null, 'abandoned_at' => now()]);
            }
        }, 3);

        return to_route('student.quizzes.show', $attempt);
    }

    public function retry(Request $request, QuizAttempt $attempt)
    {
        $this->ensureOwner($request, $attempt);
        abort_unless($attempt->status === 'completed', 409);
        $newAttempt = $this->start($request, $attempt->subject, $attempt->question_count, $attempt);

        return to_route('student.quizzes.show', $newAttempt);
    }

    private function ensureOwner(Request $request, QuizAttempt $attempt): void
    {
        abort_unless((int) $attempt->user_id === (int) $request->user()->id, 404);
    }

    private function start(Request $request, Subject $subject, int $count, ?QuizAttempt $previous = null): QuizAttempt
    {
        return DB::transaction(function () use ($request, $subject, $count, $previous) {
            // Serialize starts for this student, including concurrent/repeated clicks.
            $student = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $active = $student->quizAttempts()->where('status', 'in_progress')->first();
            if ($active) {
                return $active;
            }

            $oldIds = $previous ? $previous->items()->whereNotNull('question_id')->pluck('question_id')->all() : [];
            $questions = $subject->questions()->whereNotIn('id', $oldIds)->inRandomOrder()->limit($count)->get();
            if ($questions->count() < $count && $oldIds !== []) {
                $questions = $questions->concat($subject->questions()->whereIn('id', $oldIds)
                    ->inRandomOrder()->limit($count - $questions->count())->get());
            }
            if ($questions->count() < $count) {
                throw ValidationException::withMessages([
                    'question_count' => 'عدد أسئلة المقرر لا يكفي لهذا الاختبار. اختر عددًا أقل لبدء الاختبار.',
                ]);
            }
            $questions = $questions->shuffle()->values();
            // With a small pool, overlap is unavoidable, but do not repeat the exact order.
            if ($oldIds !== [] && $questions->pluck('id')->all() === $oldIds) {
                $questions->push($questions->shift());
            }
            $attempt = $student->quizAttempts()->create([
                'subject_id' => $subject->id,
                'question_count' => $count,
            ]);
            foreach ($questions as $index => $question) {
                $attempt->items()->create(array_merge(
                    $question->only(['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']),
                    ['question_id' => $question->id, 'position' => $index + 1],
                ));
            }

            return $attempt;
        }, 3);
    }
}
