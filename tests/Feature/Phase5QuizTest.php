<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class Phase5QuizTest extends TestCase
{
    use RefreshDatabase;

    private function bank(int $count = 10): Subject
    {
        $subject = Subject::factory()->create();
        Question::factory()->count($count)->create(['subject_id' => $subject->id, 'correct_answer' => 'B']);

        return $subject;
    }

    private function start(?Subject $subject = null, int $count = 10): QuizAttempt
    {
        $subject ??= $this->bank($count);
        $this->actingAs(User::factory()->create(['role' => 'student', 'is_active' => true]));
        $response = $this->post(route('student.quizzes.store', $subject), ['question_count' => $count]);
        $attempt = QuizAttempt::latest('id')->firstOrFail();
        $response->assertRedirect(route('student.quizzes.show', $attempt));

        return $attempt;
    }

    private function finish(QuizAttempt $attempt): void
    {
        for ($position = 1; $position <= $attempt->question_count; $position++) {
            $this->post(route('student.quizzes.answer', $attempt), ['position' => $position, 'answer' => 'B'])->assertRedirect();
            $this->post(route('student.quizzes.next', $attempt), ['position' => $position])->assertRedirect();
        }
    }

    public function test_course_offers_only_agreed_counts_and_no_question_keys(): void
    {
        $subject = $this->bank(12);
        $this->actingAs(User::factory()->create(['role' => 'student']))
            ->get(route('student.course.details', ['level' => $subject->level, 'id' => $subject->id]))
            ->assertInertia(fn (Assert $page) => $page->component('Student/CourseDetails')
                ->where('questionCounts', [10, 20, 30])->where('course.questions_count', 12)
                ->missing('course.questions')->where('activeAttempt', null));
    }

    public function test_attempt_uses_distinct_questions_only_from_its_course_and_survives_reload(): void
    {
        $subject = $this->bank(20);
        $this->bank(15);
        $attempt = $this->start($subject);
        $ids = $attempt->items()->pluck('question_id');
        $this->assertCount(10, $ids->unique());
        $this->assertSame(10, Question::where('subject_id', $subject->id)->whereIn('id', $ids)->count());
        $item = $attempt->items()->first();
        for ($i = 0; $i < 2; $i++) {
            $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
                ->component('Student/Quizzes/Show')->where('question.question_text', $item->question_text)
                ->where('question.position', 1)->where('feedback', null)
                ->missing('question.correct_answer')->missing('attempt.items')->missing('attempt.score'));
        }
        $this->assertSame($ids->all(), $attempt->items()->pluck('question_id')->all());
        $this->assertNull($attempt->fresh()->score);
    }

    public function test_twenty_and_thirty_question_attempts_use_the_requested_size(): void
    {
        foreach ([20, 30] as $count) {
            $attempt = $this->start($this->bank($count), $count);
            $this->assertSame($count, $attempt->question_count);
            $this->assertSame($count, $attempt->items()->count());
        }
    }

    public function test_invalid_or_unavailable_counts_do_not_create_partial_attempts(): void
    {
        $subject = $this->bank(9);
        $this->actingAs(User::factory()->create(['role' => 'student']));
        foreach ([0, 5, 10, 20, 30, 31, 10.5] as $count) {
            $this->post(route('student.quizzes.store', $subject), ['question_count' => $count])
                ->assertSessionHasErrors('question_count');
        }
        $this->assertDatabaseCount('quiz_attempts', 0);
        $this->assertDatabaseCount('quiz_items', 0);
    }

    public function test_repeated_start_resumes_the_existing_attempt_even_from_another_course(): void
    {
        $attempt = $this->start();
        $this->post(route('student.quizzes.store', $this->bank(20)), ['question_count' => 20])
            ->assertRedirect(route('student.quizzes.show', $attempt));
        $this->assertDatabaseCount('quiz_attempts', 1);
    }

    public function test_only_active_students_can_use_quiz_routes(): void
    {
        $subject = $this->bank();
        $this->post(route('student.quizzes.store', $subject), ['question_count' => 10])->assertRedirect('/login/student');
        $this->get(route('student.quizzes.show', 1))->assertRedirect('/login/student');
        foreach (['admin', 'instructor'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role]))
                ->post(route('student.quizzes.store', $subject), ['question_count' => 10])->assertRedirect('/');
        }
        $this->actingAs(User::factory()->create(['role' => 'student', 'is_active' => false]))
            ->post(route('student.quizzes.store', $subject), ['question_count' => 10])->assertRedirect('/');
        $this->assertDatabaseCount('quiz_attempts', 0);
    }

    public function test_other_students_cannot_read_or_mutate_an_attempt(): void
    {
        $attempt = $this->start();
        $this->actingAs(User::factory()->create(['role' => 'student']));
        $this->get(route('student.quizzes.show', $attempt))->assertNotFound();
        foreach (['answer', 'next', 'abandon', 'retry'] as $action) {
            $this->post(route('student.quizzes.'.$action, $attempt), ['position' => 1, 'answer' => 'B'])->assertNotFound();
        }
        $this->assertNull($attempt->items()->first()->selected_answer);
    }

    public function test_answer_is_graded_on_server_and_cannot_be_changed(): void
    {
        $attempt = $this->start();
        $this->post(route('student.quizzes.answer', $attempt), [
            'position' => 1, 'answer' => 'A', 'is_correct' => true, 'score' => 10, 'correct_answer' => 'A',
        ])->assertRedirect();
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'B'])->assertRedirect();
        $item = $attempt->items()->first();
        $this->assertSame('A', $item->selected_answer);
        $this->assertFalse($item->is_correct);
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->where('feedback.selected_answer', 'A')->where('feedback.correct_answer', 'B')
            ->where('feedback.is_correct', false)->missing('question.correct_answer')->missing('attempt.items'));
        $this->assertNull($attempt->fresh()->score);
    }

    public function test_questions_cannot_be_skipped_and_repeated_advance_is_idempotent(): void
    {
        $attempt = $this->start();
        $this->post(route('student.quizzes.next', $attempt), ['position' => 1])->assertStatus(422);
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 2, 'answer' => 'B'])->assertStatus(422);
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'E'])->assertSessionHasErrors('answer');
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'B'])->assertRedirect();
        $this->post(route('student.quizzes.next', $attempt), ['position' => 1])->assertRedirect();
        $this->post(route('student.quizzes.next', $attempt), ['position' => 1])->assertRedirect();
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'A'])->assertRedirect();
        $this->assertSame(2, $attempt->fresh()->current_position);
        $this->assertSame(1, $attempt->items()->whereNotNull('answered_at')->count());
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->where('feedback', null)->missing('question.correct_answer'));
    }

    public function test_completion_calculates_one_final_score_and_cannot_be_changed_by_exit(): void
    {
        $attempt = $this->start();
        $this->finish($attempt);
        $this->assertSame('completed', $attempt->fresh()->status);
        $this->assertSame(10, $attempt->fresh()->score);
        $this->post(route('student.quizzes.next', $attempt), ['position' => 10])->assertRedirect();
        $this->post(route('student.quizzes.abandon', $attempt))->assertRedirect();
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 10, 'answer' => 'A'])->assertStatus(409);
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->component('Student/Quizzes/Summary')->where('attempt.score', 10)->where('canRetry', true));
    }

    public function test_score_counts_wrong_answers_and_is_absent_until_completion(): void
    {
        $attempt = $this->start();
        for ($position = 1; $position <= 10; $position++) {
            $this->post(route('student.quizzes.answer', $attempt), ['position' => $position, 'answer' => $position <= 7 ? 'B' : 'A'])->assertRedirect();
            $this->assertNull($attempt->fresh()->score);
            $this->post(route('student.quizzes.next', $attempt), ['position' => $position])->assertRedirect();
        }
        $this->assertSame(7, $attempt->fresh()->score);
    }

    public function test_abandoned_attempt_never_receives_a_grade_or_resumes(): void
    {
        $attempt = $this->start();
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'B']);
        $this->post(route('student.quizzes.abandon', $attempt))->assertRedirect();
        $this->post(route('student.quizzes.abandon', $attempt))->assertRedirect();
        $this->post(route('student.quizzes.next', $attempt), ['position' => 1])->assertStatus(409);
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'B'])->assertStatus(409);
        $this->post(route('student.quizzes.retry', $attempt))->assertStatus(409);
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->component('Student/Quizzes/Summary')->where('attempt.status', 'abandoned')->where('attempt.score', null));
        $this->assertNull($attempt->fresh()->completed_at);
        $this->assertNotNull($attempt->fresh()->abandoned_at);
    }

    public function test_retry_preserves_subject_and_size_and_uses_unseen_questions_when_available(): void
    {
        $attempt = $this->start($this->bank(20));
        $oldIds = $attempt->items()->pluck('question_id');
        $this->finish($attempt);
        $this->post(route('student.quizzes.retry', $attempt), ['question_count' => 30, 'subject_id' => $this->bank()->id])->assertRedirect();
        $newAttempt = QuizAttempt::latest('id')->first();
        $this->assertNotSame($attempt->id, $newAttempt->id);
        $this->assertEquals($attempt->subject_id, $newAttempt->subject_id);
        $this->assertSame(10, $newAttempt->question_count);
        $this->assertCount(0, $newAttempt->items()->pluck('question_id')->intersect($oldIds));
        $this->assertNull($newAttempt->score);
    }

    public function test_retry_with_a_small_pool_keeps_unique_questions_and_a_new_order(): void
    {
        $attempt = $this->start();
        $oldIds = $attempt->items()->pluck('question_id')->all();
        $this->finish($attempt);
        $this->post(route('student.quizzes.retry', $attempt))->assertRedirect();
        $newIds = QuizAttempt::latest('id')->first()->items()->pluck('question_id');
        $this->assertCount(10, $newIds->unique());
        $this->assertNotSame($oldIds, $newIds->all());
    }

    public function test_question_edits_and_deletion_do_not_change_an_existing_attempt(): void
    {
        $attempt = $this->start();
        $item = $attempt->items()->first();
        $question = Question::findOrFail($item->question_id);
        $question->update(['question_text' => 'Changed text', 'correct_answer' => 'A']);
        $question->delete();
        $this->assertNull($item->fresh()->question_id);
        $this->post(route('student.quizzes.answer', $attempt), ['position' => 1, 'answer' => 'B'])->assertRedirect();
        $this->assertTrue($item->fresh()->is_correct);
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page
            ->where('question.question_text', $item->question_text));
    }

    public function test_retry_rechecks_available_count_and_course_deletion_cascades(): void
    {
        $attempt = $this->start();
        $this->finish($attempt);
        $attempt->subject->questions()->first()->delete();
        $this->post(route('student.quizzes.retry', $attempt))->assertSessionHasErrors('question_count');
        $this->assertDatabaseCount('quiz_attempts', 1);
        $this->get(route('student.quizzes.show', $attempt))->assertInertia(fn (Assert $page) => $page->where('canRetry', false));
        $attempt->subject->delete();
        $this->assertDatabaseCount('quiz_attempts', 0);
        $this->assertDatabaseCount('quiz_items', 0);
        $this->get(route('student.quizzes.show', $attempt->id))->assertNotFound();
    }
}
