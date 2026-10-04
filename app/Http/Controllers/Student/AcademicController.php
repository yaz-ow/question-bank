<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicController extends Controller
{
    /**
     * Show the student levels landing page.
     */
    public function levels(Request $request)
    {
        $this->authorize('student', request()->user());

        // Get all levels 1-9 with course counts
        $levels = [];
        for ($level = 1; $level <= 9; $level++) {
            $courseCount = Subject::where('level', $level)->count();
            $levels[] = [
                'level' => $level,
                'course_count' => $courseCount,
            ];
        }

        return Inertia::render('Student/LevelsIndex', [
            'levels' => $levels,
        ]);
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
            ->when($search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Student/LevelCourses', [
            'level' => $level,
            'courses' => $courses,
            'search' => $search,
        ]);
    }

    /**
     * Show course details.
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
        $course = Subject::where('id', $id)
            ->where('level', $level)
            ->firstOrFail();

        return Inertia::render('Student/CourseDetails', [
            'course' => $course->loadCount('questions'),
            'questionCounts' => QuizAttempt::QUESTION_COUNTS,
            'activeAttempt' => $request->user()->quizAttempts()->where('status', 'in_progress')
                ->first(['id', 'subject_id', 'question_count']),
        ]);
    }
}
