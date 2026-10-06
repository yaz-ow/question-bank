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

        $counts = Subject::selectRaw('level, COUNT(*) as course_count')
            ->groupBy('level')->pluck('course_count', 'level');

        return Inertia::render('StudentDashboardPage', [
            'statistics' => [
                'completed_count' => (clone $completed)->count(),
                'average_percentage' => $average === null ? null : round((float) $average, 1),
            ],
            'resultCourses' => Subject::whereHas('quizAttempts', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->where('status', 'completed')
                ->whereNotNull('score'))
                ->orderBy('name')->get(['id', 'name']),
            'levels' => collect(range(1, 9))->map(fn ($level) => [
                'level' => $level,
                'course_count' => (int) ($counts[$level] ?? 0),
            ]),
        ]);
    }
}
