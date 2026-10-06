<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_only_summarizes_the_signed_in_students_completed_attempts(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $other = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $subject = Subject::factory()->create(['level' => 2]);
        Subject::factory()->create(['level' => 2]);
        Subject::factory()->create(['level' => 9]);
        $student->quizAttempts()->create([
            'subject_id' => $subject->id, 'question_count' => 10,
            'status' => 'completed', 'score' => 8, 'completed_at' => now(),
        ]);
        $student->quizAttempts()->create([
            'subject_id' => $subject->id, 'question_count' => 10,
            'status' => 'abandoned',
        ]);
        $other->quizAttempts()->create([
            'subject_id' => $subject->id, 'question_count' => 10,
            'status' => 'completed', 'score' => 2, 'completed_at' => now(),
        ]);

        $this->actingAs($student)->get(route('student.dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('StudentDashboardPage')
                ->where('statistics.completed_count', 1)
                ->where('statistics.average_percentage', fn ($value) => (float) $value === 80.0)
                ->has('levels', 9)
                ->where('levels.0.level', 1)->where('levels.0.course_count', 0)
                ->where('levels.1.level', 2)->where('levels.1.course_count', 2)
                ->where('levels.8.level', 9)->where('levels.8.course_count', 1)
                ->has('resultCourses', 1)
                ->where('resultCourses.0.id', $subject->id)
                ->missing('courses')->missing('recentResults'));

    }

    public function test_dashboard_handles_a_new_student_without_courses_or_results(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);

        $this->actingAs($student)->get(route('student.dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('StudentDashboardPage')
                ->where('statistics.completed_count', 0)
                ->where('statistics.average_percentage', null)
                ->has('resultCourses', 0)
                ->has('levels', 9)
                ->where('levels', fn ($levels) => collect($levels)->pluck('level')->all() === range(1, 9)
                    && collect($levels)->every(fn ($level) => $level['course_count'] === 0)));
    }
    public function test_sidebar_courses_require_the_students_own_scored_completed_attempt(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $other = User::factory()->create(['role' => 'student', 'is_active' => true]);
        $scored = Subject::factory()->create();
        $unfinished = Subject::factory()->create();
        $unscored = Subject::factory()->create();
        $otherCourse = Subject::factory()->create();
        foreach ([0, 8] as $score) {
            $student->quizAttempts()->create([
                'subject_id' => $scored->id, 'question_count' => 10,
                'status' => 'completed', 'score' => $score, 'completed_at' => now(),
            ]);
        }
        foreach (['abandoned', 'in_progress'] as $status) {
            $student->quizAttempts()->create([
                'subject_id' => $unfinished->id, 'question_count' => 10, 'status' => $status,
            ]);
        }
        $student->quizAttempts()->create([
            'subject_id' => $unscored->id, 'question_count' => 10, 'status' => 'completed',
        ]);
        $other->quizAttempts()->create([
            'subject_id' => $otherCourse->id, 'question_count' => 10,
            'status' => 'completed', 'score' => 10, 'completed_at' => now(),
        ]);

        $this->actingAs($student)->get(route('student.dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('StudentDashboardPage')
                ->has('resultCourses', 1)
                ->where('resultCourses.0.id', $scored->id)
                ->where('resultCourses.0.name', $scored->name));
    }

}
