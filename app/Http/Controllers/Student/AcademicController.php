<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\QuizAttempt;
use App\Support\StudentNavigation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicController extends Controller
{
    /**
     * Redirect saved levels links to the dashboard's level cards.
     */
    public function levels(Request $request)
    {
        $this->authorize('student', request()->user());

        return to_route('student.dashboard');
    }

    /**
     * Show courses for a specific level.
     */
    public function levelCourses(Request $request, $level)
    {
        $this->authorize('student', request()->user());

        // Validate level is between 1-9
        $level = (int)$level;
        if ($level < 1 || $level > 9) {
            abort(404);
        }

        // Get search parameter
        $search = $request->input('search', '');

        // Get courses for this level
        $courses = Subject::where('level', $level)
            ->withCount('questions')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Student/LevelCourses', [
            ...StudentNavigation::props($request->user()),
            'level' => $level,
            'courses' => $courses,
            'search' => $search,
            'questionCounts' => QuizAttempt::QUESTION_COUNTS,
            'activeAttempt' => $request->user()->quizAttempts()->where('status', 'in_progress')
                ->first(['id', 'subject_id', 'question_count']),
        ]);
    }

    /**
     * Redirect saved course details links to the current course cards.
     */
    public function courseDetails(Request $request, $level, $id)
    {
        $this->authorize('student', request()->user());

        // Validate level is between 1-9
        $level = (int)$level;
        if ($level < 1 || $level > 9) {
            abort(404);
        }

        // Get the course and verify it belongs to the specified level
        Subject::where('id', $id)
            ->where('level', $level)
            ->firstOrFail();

        return to_route('student.level.courses', ['level' => $level]);
    }
}
