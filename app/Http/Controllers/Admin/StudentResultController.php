<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AttemptAnswersExport;
use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class StudentResultController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view-student-results');
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'level' => ['nullable', 'integer', 'between:1,9'],
            'subject_id' => ['nullable', 'required_with:student_id,attempt_id', 'integer', 'exists:subjects,id'],
            'student_id' => ['nullable', 'required_with:attempt_id', 'integer', 'min:1'],
            'attempt_id' => ['nullable', 'integer', 'min:1'],
            'page' => ['nullable', 'integer', 'min:1'],
            'attempts_page' => ['nullable', 'integer', 'min:1'],
        ]);
        $course = empty($filters['subject_id']) ? null : Subject::findOrFail($filters['subject_id']);
        $student = empty($filters['student_id']) ? null : User::where('role', 'student')
            ->whereHas('quizAttempts', fn ($query) => $query->where('subject_id', $course->id))
            ->findOrFail($filters['student_id']);
        $attempt = empty($filters['attempt_id']) ? null : $this->completedAttempt(
            $course, $student, QuizAttempt::findOrFail($filters['attempt_id'])
        );

        return Inertia::render('Admin/StudentResultsPage', [
            'courses' => fn () => Subject::orderBy('level')->orderBy('name')->orderBy('id')->get(['id', 'name', 'level']),
            'course' => $course?->only(['id', 'name', 'level']),
            'filters' => $filters,
            'stats' => fn () => $course ? [
                'students' => $this->attempts($course)->distinct()->count('user_id'),
                'completed' => $this->attempts($course)->where('status', 'completed')->count(),
            ] : null,
            'students' => fn () => $course ? $this->students($course) : null,
            'selectedStudent' => fn () => $student ? [
                ...$student->only(['id', 'name', 'university_id']),
                'attempts' => $student->quizAttempts()->where('subject_id', $course->id)
                    ->orderByDesc('created_at')->orderByDesc('id')->paginate(15, ['*'], 'attempts_page')
                    ->withQueryString()->through(fn ($item) => [
                        'id' => $item->id,
                        'status' => $item->status,
                        'question_count' => $item->question_count,
                        'score' => $item->status === 'completed' ? $item->score : null,
                        'created_at' => $item->created_at->toIso8601String(),
                        'completed_at' => $item->completed_at?->toIso8601String(),
                        'abandoned_at' => $item->abandoned_at?->toIso8601String(),
                    ]),
            ] : null,
            'review' => fn () => $attempt ? [
                'attempt' => $attempt->only(['id', 'score', 'question_count', 'completed_at', 'created_at']),
                'items' => $attempt->items()->get()->map(fn ($item) => $item->only([
                    'position', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
                    'selected_answer', 'correct_answer', 'is_correct',
                ])),
            ] : null,
        ]);
    }

    public function export(Subject $subject, User $user, QuizAttempt $attempt)
    {
        $this->authorize('view-student-results');
        $this->completedAttempt($subject, $user, $attempt);
        $attempt->load(['user', 'subject', 'items']);

        return Excel::download(new AttemptAnswersExport($attempt), "attempt-{$attempt->id}-answers.xlsx");
    }

    private function completedAttempt(Subject $subject, User $student, QuizAttempt $attempt): QuizAttempt
    {
        abort_unless($student->role === 'student' && $attempt->status === 'completed'
            && (int) $attempt->subject_id === (int) $subject->id
            && (int) $attempt->user_id === (int) $student->id, 404);

        return $attempt;
    }

    private function attempts(Subject $subject)
    {
        return QuizAttempt::where('subject_id', $subject->id)
            ->whereHas('user', fn ($query) => $query->where('role', 'student'));
    }

    private function students(Subject $subject)
    {
        $summary = $this->attempts($subject)->select('user_id')
            ->selectRaw("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count")
            ->selectRaw("AVG(CASE WHEN status = 'completed' THEN 100.0 * score / NULLIF(question_count, 0) END) as average_percentage")
            ->selectRaw('MAX(created_at) as last_attempt_at')->groupBy('user_id');

        return User::joinSub($summary, 'results', fn ($join) => $join->on('users.id', '=', 'results.user_id'))
            ->select('users.id', 'users.name', 'users.university_id', 'results.completed_count',
                'results.average_percentage', 'results.last_attempt_at')
            ->orderByDesc('results.last_attempt_at')->orderBy('users.id')->paginate(10)->withQueryString()
            ->through(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'university_id' => $student->university_id,
                'completed_count' => (int) $student->completed_count,
                'average_percentage' => $student->average_percentage === null ? null : round((float) $student->average_percentage, 1),
                'last_attempt_at' => Carbon::parse($student->last_attempt_at)->toIso8601String(),
            ]);
    }
}
