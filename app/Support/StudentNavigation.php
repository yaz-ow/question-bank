<?php

namespace App\Support;

use App\Models\Subject;
use App\Models\User;

class StudentNavigation
{
    public static function props(User $student): array
    {
        $counts = Subject::selectRaw('level, COUNT(*) as course_count')
            ->groupBy('level')->pluck('course_count', 'level');

        return [
            'levels' => collect(range(1, 9))->map(fn ($level) => [
                'level' => $level,
                'course_count' => (int) ($counts[$level] ?? 0),
            ]),
            'resultCourses' => Subject::whereHas('quizAttempts', fn ($query) => $query
                ->where('user_id', $student->id)
                ->where('status', 'completed')
                ->whereNotNull('score'))
                ->orderBy('name')->get(['id', 'name']),
        ];
    }
}
