<?php

namespace Tests\Feature;

use App\Models\Question;
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
        $subject = Subject::factory()->create();
        Question::factory()->count(2)->create(['subject_id' => $subject->id]);
        $completed = $student->quizAttempts()->create([
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
                ->where('statistics.available_courses', 1)
                ->has('recentResults', 1)->where('recentResults.0.id', $completed->id)
                ->has('courses', 1)->where('courses.0.questions_count', 2));
    }

    public function test_dashboard_handles_a_new_student_without_courses_or_results(): void
    {
        $student = User::factory()->create(['role' => 'student', 'is_active' => true]);

        $this->actingAs($student)->get(route('student.dashboard'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('StudentDashboardPage')
                ->where('statistics.completed_count', 0)
                ->where('statistics.average_percentage', null)
                ->where('statistics.available_courses', 0)
                ->has('courses', 0)->has('recentResults', 0));
    }
}
