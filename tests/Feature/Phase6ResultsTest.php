<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase6ResultsTest extends TestCase
{
    use RefreshDatabase;

    public function test_history_is_private_paginated_and_does_not_expose_answers(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $course = Subject::factory()->create();
        foreach (range(1, 16) as $i) {
            $student->quizAttempts()->create(['subject_id' => $course->id, 'question_count' => 10, 'status' => 'completed', 'score' => 7]);
        }
        $other = User::factory()->create();
        $other->quizAttempts()->create(['subject_id' => $course->id, 'question_count' => 10]);
        $this->actingAs($student)->get(route('student.results.index'))->assertInertia(fn (Assert $page) => $page
            ->component('Student/Results/Index')->where('attempts.total', 16)->has('attempts.data', 15)
            ->where('statistics.completed_count', 16)->where('statistics.average_percentage', fn ($v) => (float) $v === 70.0)
            ->missing('attempts.data.0.items')->missing('attempts.data.0.user_id'));
    }

    public function test_filters_and_statistics_exclude_ungraded_attempts(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $course = Subject::factory()->create();
        $other = Subject::factory()->create();
        foreach ([['completed', 8], ['abandoned', null], ['in_progress', null]] as [$status, $score]) {
            $student->quizAttempts()->create(['subject_id' => $course->id, 'question_count' => 10, 'status' => $status, 'score' => $score]);
        }
        $student->quizAttempts()->create(['subject_id' => $other->id, 'question_count' => 10, 'status' => 'completed', 'score' => 0]);
        $this->actingAs($student)->get(route('student.results.index', ['subject_id' => $course->id, 'status' => 'abandoned']))
            ->assertInertia(fn (Assert $page) => $page->where('attempts.total', 1)->where('attempts.data.0.score', null)
                ->where('statistics.completed_count', 1)->where('statistics.average_percentage', fn ($v) => (float) $v === 80.0));
        $this->get(route('student.results.index', ['status' => 'invalid']))->assertSessionHasErrors('status');
    }

    public function test_review_requires_ownership_and_completion_and_uses_snapshots(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $subject = Subject::factory()->create();
        Question::factory()->count(10)->create(['subject_id' => $subject->id, 'correct_answer' => 'B']);
        $this->actingAs($student)->post(route('student.quizzes.store', $subject), ['question_count' => 10])->assertRedirect();
        $attempt = $student->quizAttempts()->firstOrFail();
        $this->get(route('student.results.show', $attempt))->assertNotFound();
        $original = $attempt->items()->first()->question_text;
        foreach (range(1, 10) as $position) {
            $this->post(route('student.quizzes.answer', $attempt), ['position' => $position, 'answer' => 'B'])->assertRedirect();
            $this->post(route('student.quizzes.next', $attempt), ['position' => $position])->assertRedirect();
        }
        $subject->questions()->update(['question_text' => 'New bank text']);
        $this->get(route('student.results.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->component('Student/Results/Show')->has('items', 10)->where('items.0.question_text', $original)
            ->where('items.0.correct_answer', 'B')->where('items.0.selected_answer', 'B')->where('attempt.score', 10));
        $this->post(route('student.quizzes.retry', $attempt))->assertRedirect();
        $this->assertSame(2, $student->quizAttempts()->count());
        $this->assertSame('completed', $attempt->fresh()->status);
        $this->actingAs(User::factory()->create(['role' => 'student']))->get(route('student.results.show', $attempt))->assertNotFound();
        $this->get(route('student.results.index'))->assertInertia(fn (Assert $page) => $page
            ->where('attempts.total', 0)->where('statistics.completed_count', 0)->where('statistics.average_percentage', null));
        $this->actingAs($student);
        $attempt->update(['status' => 'abandoned', 'score' => null]);
        $this->get(route('student.results.show', $attempt))->assertNotFound();
        $subject->delete();
        $this->get(route('student.results.index'))->assertInertia(fn (Assert $page) => $page->where('attempts.total', 0));
        $this->get(route('student.results.show', $attempt))->assertNotFound();
    }

    public function test_guests_instructors_and_inactive_students_cannot_access_results(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $attempt = $student->quizAttempts()->create(['subject_id' => Subject::factory()->create()->id, 'question_count' => 10]);
        foreach (['student.results.index', 'student.results.show'] as $route) {
            $url = route($route, $route === 'student.results.show' ? $attempt : []);
            $this->get($url)->assertRedirect();
        }
        foreach (['admin', 'instructor'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]))->get(route('student.results.index'))->assertForbidden();
            $this->get(route('student.results.show', $attempt))->assertForbidden();
        }
        $student->update(['is_active' => false]);
        $this->actingAs($student)->get(route('student.results.index'))->assertRedirect('/');
    }
}
