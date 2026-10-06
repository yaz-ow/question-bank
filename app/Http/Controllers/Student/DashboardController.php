<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $completed = $request->user()->quizAttempts()->where('status', 'completed');
        $average = (clone $completed)
            ->selectRaw('AVG(100.0 * score / question_count) as average')->value('average');

        return Inertia::render('StudentDashboardPage', [
            'statistics' => [
                'completed_count' => (clone $completed)->count(),
                'average_percentage' => $average === null ? null : round((float) $average, 1),
                'available_courses' => Subject::count(),
            ],
            'courses' => Subject::withCount('questions')->orderBy('level')->orderBy('name')
                ->limit(3)->get(['id', 'name', 'level']),
            'recentResults' => (clone $completed)->with('subject:id,name,level')
                ->latest('completed_at')->latest('id')->limit(5)->get()
                ->map(fn ($attempt) => [
                    'id' => $attempt->id,
                    'score' => $attempt->score,
                    'question_count' => $attempt->question_count,
                    'completed_at' => $attempt->completed_at?->toIso8601String(),
                    'course' => $attempt->subject?->only(['id', 'name', 'level']),
                ]),
        ]);
    }
}
