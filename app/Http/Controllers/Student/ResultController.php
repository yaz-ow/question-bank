<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'status' => ['nullable', Rule::in(['completed', 'abandoned', 'in_progress'])],
        ]);
        $query = $request->user()->quizAttempts();
        if (! empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }
        // Statistics always describe completed attempts in the selected course.
        $completed = (clone $query)->where('status', 'completed');
        $statistics = [
            'completed_count' => (clone $completed)->count(),
            'average_percentage' => (clone $completed)->selectRaw('AVG(100.0 * score / question_count) as average')->value('average'),
        ];
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return Inertia::render('Student/Results/Index', [
            'attempts' => $query->with('subject:id,name,level')->latest('id')->paginate(15)->withQueryString()
                ->through(fn ($attempt) => [
                    'id' => $attempt->id,
                    'status' => $attempt->status,
                    'question_count' => $attempt->question_count,
                    'score' => $attempt->status === 'completed' ? $attempt->score : null,
                    'created_at' => $attempt->created_at->toIso8601String(),
                    'course' => $attempt->subject->only(['id', 'name', 'level']),
                ]),
            'courses' => \App\Models\Subject::whereHas('quizAttempts', fn ($q) => $q->where('user_id', $request->user()->id))
                ->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
            'statistics' => $statistics,
        ]);
    }

    public function show(Request $request, QuizAttempt $attempt)
    {
        abort_unless((int) $attempt->user_id === (int) $request->user()->id, 404);
        abort_unless($attempt->status === 'completed', 404);

        return Inertia::render('Student/Results/Show', [
            'attempt' => $attempt->only(['id', 'score', 'question_count', 'completed_at']),
            'course' => $attempt->subject->only(['id', 'name', 'level']),
            'items' => $attempt->items()->get()->map(fn ($item) => $item->only([
                'position', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d',
                'selected_answer', 'correct_answer', 'is_correct',
            ])),
        ]);
    }
}
