<?php

namespace Tests\Feature;

use App\Models\QuizAttempt;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class AdminStudentResultsTest extends TestCase
{
    use RefreshDatabase;

    private function attempt(User $student, Subject $course, array $attributes = []): QuizAttempt
    {
        $attempt = $student->quizAttempts()->create($attributes + [
            'subject_id' => $course->id, 'question_count' => 10, 'status' => 'completed',
            'score' => 8, 'completed_at' => now(),
        ]);
        $attempt->forceFill(['created_at' => $attributes['created_at'] ?? '2026-10-01 09:00:00'])->save();

        return $attempt;
    }

    public function test_initial_page_waits_for_a_course_and_never_mixes_results(): void
    {
        $course = Subject::factory()->create();
        $this->attempt(User::factory()->create(), $course);
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get(route('admin.student-results.index'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/StudentResultsPage')
            ->has('courses', 1)->where('course', null)->where('students', null)->where('stats', null)
            ->where('selectedStudent', null)->where('review', null));
    }

    public function test_selected_course_lists_all_its_students_including_inactive_students_with_correct_aggregates(): void
    {
        $course = Subject::factory()->create();
        $other = Subject::factory()->create();
        $student = User::factory()->create(['is_active' => false]);
        $ungraded = User::factory()->create();
        $this->attempt($student, $course, ['score' => 0]);
        $this->attempt($student, $course, ['score' => 20, 'question_count' => 20]);
        $this->attempt($student, $course, ['status' => 'abandoned', 'score' => 10]);
        $this->attempt($student, $course, ['status' => 'in_progress', 'score' => 10]);
        $this->attempt($ungraded, $course, ['status' => 'abandoned', 'score' => null]);
        $this->attempt($student, $other);
        $this->attempt(User::factory()->create(), $other);
        $this->attempt(User::factory()->create(['role' => 'admin']), $course);

        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.student-results.index', ['subject_id' => $course->id]))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('course.id', $course->id)
                ->where('stats.students', 2)->where('stats.completed', 2)->missing('stats.average_percentage')
                ->where('students.total', 2)->where('students.data.0.id', $student->id)
                ->where('students.data.0.completed_count', 2)
                ->where('students.data.0.average_percentage', fn ($value) => (float) $value === 50.0)
                ->where('students.data.1.average_percentage', null)->where('students.data.1.completed_count', 0)
                ->missing('students.data.0.email')->missing('students.data.0.password')->missing('students.data.0.items'));
    }

    public function test_students_are_paginated_in_a_stable_order_and_course_selection_is_preserved(): void
    {
        $course = Subject::factory()->create(['name' => 'Database', 'level' => 3]);
        $studentIds = [];
        foreach (range(1, 12) as $index) {
            $student = User::factory()->create();
            $studentIds[] = $student->id;
            $this->attempt($student, $course);
        }
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $url = route('admin.student-results.index', ['subject_id' => $course->id, 'search' => 'Database', 'level' => 3, 'page' => 2]);
        foreach (range(1, 2) as $repeat) {
            $this->get($url)->assertInertia(fn (Assert $page) => $page->where('students.total', 12)
                ->has('students.data', 2)->where('students.data.0.id', $studentIds[10])
                ->where('stats.students', 12)->where('stats.completed', 12)
                ->where('students.prev_page_url', fn ($url) => str_contains($url, 'subject_id='.$course->id)
                    && str_contains($url, 'search=Database') && str_contains($url, 'level=3')));
        }
    }

    public function test_all_student_attempts_are_reachable_newest_first_and_ungraded_scores_are_hidden(): void
    {
        $course = Subject::factory()->create();
        $other = Subject::factory()->create();
        $student = User::factory()->create();
        $attempts = [];
        foreach (range(1, 17) as $index) {
            $attempts[] = $this->attempt($student, $course, ['created_at' => now()->addMinutes($index),
                'status' => $index === 17 ? 'abandoned' : 'completed', 'score' => 8]);
        }
        $this->attempt($student, $other);
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.student-results.index', ['subject_id' => $course->id, 'student_id' => $student->id]))
            ->assertInertia(fn (Assert $page) => $page->where('selectedStudent.id', $student->id)
                ->where('selectedStudent.attempts.total', 17)->has('selectedStudent.attempts.data', 15)
                ->where('selectedStudent.attempts.data.0.id', $attempts[16]->id)
                ->where('selectedStudent.attempts.data.0.score', null)->missing('selectedStudent.attempts.data.0.items'));
        $this->get(route('admin.student-results.index', ['subject_id' => $course->id,
            'student_id' => $student->id, 'attempts_page' => 2]))
            ->assertInertia(fn (Assert $page) => $page->has('selectedStudent.attempts.data', 2)
                ->where('selectedStudent.attempts.data.0.id', $attempts[1]->id)
                ->where('selectedStudent.attempts.prev_page_url', fn ($url) => str_contains($url, 'student_id='.$student->id)
                    && str_contains($url, 'subject_id='.$course->id)));
    }

    public function test_review_and_excel_use_the_same_ordered_saved_answers_and_export_text_literally(): void
    {
        $course = Subject::factory()->create();
        $student = User::factory()->create(['name' => '=2+3']);
        $attempt = $this->attempt($student, $course);
        // Insert in reverse order so both review and export must use saved positions.
        foreach (array_reverse(range(1, 10)) as $position) {
            $attempt->items()->create(['position' => $position, 'question_text' => '=SNAPSHOT '.$position,
                'option_a' => '+Option A', 'option_b' => 'B', 'option_c' => 'C', 'option_d' => '0',
                'correct_answer' => 'B', 'selected_answer' => $position <= 8 ? 'B' : 'A',
                'is_correct' => $position <= 8, 'answered_at' => now()]);
        }
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.student-results.index', ['subject_id' => $course->id, 'student_id' => $student->id, 'attempt_id' => $attempt->id]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->where('review.attempt.id', $attempt->id)
            ->has('review.items', 10)->where('review.items.0.position', 1)->where('review.items.0.question_text', '=SNAPSHOT 1')
            ->where('review.items.8.selected_answer', 'A')->where('review.items.8.correct_answer', 'B')
            ->where('review.items.8.is_correct', false));
        $response = $this->get(route('admin.student-results.export', ['subject' => $course, 'user' => $student, 'attempt' => $attempt]));
        $response->assertOk()->assertDownload("attempt-{$attempt->id}-answers.xlsx");
        Cell::setValueBinder(new DefaultValueBinder);
        $book = IOFactory::load($response->baseResponse->getFile()->getPathname());
        $sheet = $book->getActiveSheet();
        $this->assertTrue($sheet->getRightToLeft());
        $this->assertSame('=2+3', $sheet->getCell('B2')->getValue());
        $this->assertSame(DataType::TYPE_STRING, $sheet->getCell('B2')->getDataType());
        $this->assertSame('=SNAPSHOT 1', $sheet->getCell('B9')->getValue());
        $this->assertSame(DataType::TYPE_STRING, $sheet->getCell('B9')->getDataType());
        $this->assertSame('+Option A', $sheet->getCell('C9')->getValue());
        $this->assertSame('0', $sheet->getCell('F9')->getValue());
        $this->assertSame('A', $sheet->getCell('G17')->getValue());
        $this->assertSame('B', $sheet->getCell('H17')->getValue());
        $this->assertSame('خاطئة', $sheet->getCell('I17')->getValue());
        $this->assertSame(10, $sheet->getCell('A18')->getValue());
        $this->assertSame($course->name, $sheet->getCell('B3')->getValue());
        $this->assertSame('80%', $sheet->getCell('B6')->getValue());
        $book->disconnectWorksheets();
    }

    public function test_review_and_download_reject_unfinished_attempts_and_mismatched_course_or_student(): void
    {
        $course = Subject::factory()->create();
        $other = Subject::factory()->create();
        $student = User::factory()->create();
        $otherStudent = User::factory()->create();
        $attempt = $this->attempt($student, $course);
        $this->attempt($student, $other);
        $this->attempt($otherStudent, $course);
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach ([[$other, $student], [$course, $otherStudent]] as [$subject, $user]) {
            $this->get(route('admin.student-results.index', ['subject_id' => $subject->id,
                'student_id' => $user->id, 'attempt_id' => $attempt->id]))->assertNotFound();
            $this->get(route('admin.student-results.export', ['subject' => $subject, 'user' => $user, 'attempt' => $attempt]))->assertNotFound();
        }
        foreach (['abandoned', 'in_progress'] as $status) {
            $attempt->update(['status' => $status]);
            $this->get(route('admin.student-results.index', ['subject_id' => $course->id,
                'student_id' => $student->id, 'attempt_id' => $attempt->id]))->assertNotFound();
            $this->get(route('admin.student-results.export', ['subject' => $course, 'user' => $student, 'attempt' => $attempt]))->assertNotFound();
        }
    }

    public function test_only_active_admins_can_read_or_export_admin_results(): void
    {
        $course = Subject::factory()->create();
        $student = User::factory()->create();
        $attempt = $this->attempt($student, $course);
        $urls = [route('admin.student-results.index', ['subject_id' => $course->id]),
            route('admin.student-results.export', ['subject' => $course, 'user' => $student, 'attempt' => $attempt])];
        foreach ($urls as $url) {
            $this->get($url)->assertRedirect(route('login-admin.show'));
        }
        foreach ([['student', true], ['instructor', true], ['admin', false], ['instructor', false]] as [$role, $active]) {
            $user = User::factory()->create(['role' => $role, 'is_active' => $active]);
            foreach ($urls as $url) {
                $this->actingAs($user)->get($url)->assertRedirect('/');
            }
        }
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get($urls[0])->assertOk();
        $this->assertSame(8, $attempt->fresh()->score);
    }

    public function test_empty_courses_and_invalid_selection_are_handled(): void
    {
        $course = Subject::factory()->create();
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get(route('admin.student-results.index', ['subject_id' => $course->id]))
            ->assertInertia(fn (Assert $page) => $page->where('students.total', 0)->where('stats.students', 0)->where('stats.completed', 0));
        foreach (['subject_id' => 99999, 'level' => 10, 'page' => 0, 'attempts_page' => 0, 'search' => str_repeat('x', 256)] as $key => $value) {
            $this->get(route('admin.student-results.index', [$key => $value]))->assertSessionHasErrors($key);
        }
        $this->get(route('admin.student-results.index', ['student_id' => 1]))->assertSessionHasErrors('subject_id');
        $this->get(route('admin.student-results.index', ['subject_id' => $course->id, 'student_id' => 99999]))->assertNotFound();
    }
}
