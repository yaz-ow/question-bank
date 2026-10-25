<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InstructorWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function teacher(): User
    {
        return User::factory()->create(['role' => 'instructor']);
    }

    private function questionData(): array
    {
        return ['question_text' => 'سؤال المقرر', 'option_a' => 'أ', 'option_b' => 'ب',
            'option_c' => 'ج', 'option_d' => 'د', 'correct_answer' => 'B'];
    }

    private function csv(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('questions.csv',
            "question_text,option_a,option_b,option_c,option_d,correct_answer\nImported,A,B,C,D,B\n");
    }

    public function test_admin_assigns_multiple_courses_and_unassigns_without_deleting_academic_data(): void
    {
        $teacher = $this->teacher();
        $courses = Subject::factory()->count(2)->create();
        $question = Question::factory()->create(['subject_id' => $courses[0]->id]);
        $student = User::factory()->create();
        $attempt = $student->quizAttempts()->create(['subject_id' => $courses[0]->id,
            'question_count' => 10, 'status' => 'completed', 'score' => 8, 'completed_at' => now()]);
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $url = route('admin.instructors.subjects', $teacher);

        $this->put($url, ['subject_ids' => $courses->modelKeys()])->assertSessionHasNoErrors();
        $this->assertEqualsCanonicalizing($courses->modelKeys(), $teacher->subjects()->pluck('id')->all());
        $this->get(route('admin.instructors.index'))->assertInertia(fn (Assert $page) => $page
            ->has('subjects', 2)->where('subjects.0.instructor_id', $teacher->id)
            ->where('subjects.0.instructor_name', $teacher->name));
        $this->put($url, ['subject_ids' => [$courses[1]->id]])->assertSessionHasNoErrors();
        $this->assertNull($courses[0]->fresh()->instructor_id);
        $this->assertSame($teacher->id, $courses[1]->fresh()->instructor_id);
        $this->put($url, ['subject_ids' => []])->assertSessionHasNoErrors();
        $this->assertSame(0, $teacher->subjects()->count());
        $this->assertDatabaseHas('questions', ['id' => $question->id]);
        $this->assertDatabaseHas('quiz_attempts', ['id' => $attempt->id, 'score' => 8]);
        $this->assertDatabaseCount('subjects', 2);
    }

    public function test_assignment_conflicts_are_atomic_and_never_steal_another_teachers_course(): void
    {
        $teacher = $this->teacher();
        $other = $this->teacher();
        $owned = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $free = Subject::factory()->create();
        $taken = Subject::factory()->create(['instructor_id' => $other->id]);
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $this->put(route('admin.instructors.subjects', $teacher), ['subject_ids' => [$free->id, $taken->id]])
            ->assertSessionHasErrors('subject_ids');
        $this->assertSame($teacher->id, $owned->fresh()->instructor_id);
        $this->assertNull($free->fresh()->instructor_id);
        $this->assertSame($other->id, $taken->fresh()->instructor_id);
        // A stale second administrator's selection must also be rejected after an assignment has changed.
        $this->put(route('admin.instructors.subjects', $teacher), ['subject_ids' => [$free->id]])->assertSessionHasNoErrors();
        $this->put(route('admin.instructors.subjects', $other), ['subject_ids' => [$free->id]])->assertSessionHasErrors('subject_ids');
        $this->assertSame($teacher->id, $free->fresh()->instructor_id);
    }

    public function test_assignment_validates_input_and_cannot_target_student_or_admin_accounts(): void
    {
        $teacher = $this->teacher();
        $course = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create();
        $this->put(route('admin.instructors.subjects', $teacher), ['subject_ids' => []])->assertRedirect(route('login-admin.show'));
        $this->actingAs($admin);
        foreach ([[], ['subject_ids' => 'bad'], ['subject_ids' => [999999]],
            ['subject_ids' => [$course->id, $course->id]], ['subject_ids' => [null]], ['subject_ids' => [[]]]] as $input) {
            $this->put(route('admin.instructors.subjects', $teacher), $input)->assertSessionHasErrors();
            $this->assertSame($teacher->id, $course->fresh()->instructor_id);
        }
        foreach ([$admin, $student] as $user) {
            $this->put(route('admin.instructors.subjects', $user), ['subject_ids' => []])->assertNotFound();
        }
        foreach ([$teacher, $student, User::factory()->create(['role' => 'admin', 'is_active' => false])] as $user) {
            $this->actingAs($user)->put(route('admin.instructors.subjects', $teacher), ['subject_ids' => []])->assertRedirect('/');
        }
        $this->assertSame($teacher->id, $course->fresh()->instructor_id);
    }

    public function test_existing_instructor_accounts_login_to_their_workspace_even_with_an_old_admin_intended_url(): void
    {
        $teacher = $this->teacher();
        $this->withSession(['url.intended' => route('admin.subjects.index')])
            ->post(route('login-admin.store'), ['email' => $teacher->email, 'password' => 'password'])
            ->assertRedirect(route('instructor.courses.index'))->assertSessionMissing('url.intended');
        $this->assertAuthenticatedAs($teacher);
        $this->get(route('instructor.courses.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Courses')->has('courses', 0));
    }

    public function test_course_cards_include_only_assigned_courses_with_levels_and_actual_question_counts(): void
    {
        $teacher = $this->teacher();
        $third = Subject::factory()->create(['name' => 'Programming', 'level' => 3, 'instructor_id' => $teacher->id]);
        Subject::factory()->create(['name' => 'Database', 'level' => 5, 'instructor_id' => $teacher->id]);
        Question::factory()->count(3)->create(['subject_id' => $third->id]);
        Subject::factory()->create(['instructor_id' => $this->teacher()->id]);
        Subject::factory()->create();

        $this->actingAs($teacher)->get(route('instructor.courses.index'))->assertInertia(fn (Assert $page) => $page
            ->component('Instructor/Courses')->has('courses', 2)->where('courses.0.id', $third->id)
            ->where('courses.0.level', 3)->where('courses.0.questions_count', 3)->where('courses.1.questions_count', 0));
        $this->get(route('instructor.student-results.index'))->assertInertia(fn (Assert $page) => $page
            ->has('courses', 2)->where('course', null)->where('students', null));
    }

    public function test_instructors_cannot_use_any_admin_management_endpoints(): void
    {
        $teacher = $this->teacher();
        $subject = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $question = Question::factory()->create(['subject_id' => $subject->id]);
        $this->actingAs($teacher);
        foreach (['admin.dashboard', 'admin.subjects.index', 'admin.instructors.index', 'admin.students.index', 'admin.student-results.index'] as $name) {
            $this->get(route($name))->assertRedirect('/');
        }
        $this->get(route('admin.questions.index', $subject))->assertRedirect('/');
        $this->post(route('admin.subjects.store'), ['name' => 'Forbidden', 'level' => 3])->assertRedirect('/');
        $this->put(route('admin.subjects.update', $subject), ['name' => 'Forbidden', 'level' => 3])->assertRedirect('/');
        $this->delete(route('admin.subjects.destroy', $subject))->assertRedirect('/');
        $this->post(route('admin.questions.store', $subject), $this->questionData())->assertRedirect('/');
        $this->delete(route('admin.questions.destroy', [$subject, $question]))->assertRedirect('/');
        $this->assertFalse(Gate::forUser($teacher)->allows('manage-subjects'));
        $this->assertDatabaseCount('subjects', 1);
        $this->assertDatabaseCount('questions', 1);
    }

    public function test_instructor_can_manage_assigned_questions_and_redirects_stay_in_the_instructor_workspace(): void
    {
        $teacher = $this->teacher();
        $subject = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $other = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $mismatch = Question::factory()->create(['subject_id' => $other->id]);
        $this->actingAs($teacher)->get(route('instructor.questions.index', $subject))->assertOk();
        $this->post(route('instructor.questions.store', $subject), $this->questionData() + ['subject_id' => $other->id])
            ->assertRedirect(route('instructor.questions.index', $subject));
        $question = $subject->questions()->sole();
        $this->put(route('instructor.questions.update', [$subject, $question]),
            array_replace($this->questionData(), ['question_text' => 'Updated']))
            ->assertRedirect(route('instructor.questions.index', $subject));
        $this->assertSame('Updated', $question->fresh()->question_text);
        foreach (['show', 'edit'] as $action) {
            $this->get(route('instructor.questions.'.$action, [$subject, $question]))
                ->assertRedirect(route('instructor.questions.index', ['subject' => $subject->id, 'page' => 1]));
            $this->get(route('instructor.questions.'.$action, [$subject, $mismatch]))->assertNotFound();
        }
        $this->put(route('instructor.questions.update', [$subject, $mismatch]), $this->questionData())->assertNotFound();
        $this->delete(route('instructor.questions.destroy', [$subject, $mismatch]))->assertNotFound();
        $this->delete(route('instructor.questions.destroy', [$subject, $question]))->assertRedirect(route('instructor.questions.index', $subject));
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
        $this->assertDatabaseHas('questions', ['id' => $mismatch->id]);
    }

    public function test_all_question_operations_reject_other_teachers_and_unassigned_courses(): void
    {
        $teacher = $this->teacher();
        $subjects = [Subject::factory()->create(), Subject::factory()->create(['instructor_id' => $this->teacher()->id])];
        $this->actingAs($teacher);
        foreach ($subjects as $subject) {
            $question = Question::factory()->create(['subject_id' => $subject->id]);
            foreach (['index', 'create', 'download.template'] as $action) {
                $this->get(route('instructor.questions.'.$action, $subject))->assertForbidden();
            }
            foreach (['show', 'edit'] as $action) {
                $this->get(route('instructor.questions.'.$action, [$subject, $question]))->assertForbidden();
            }
            $this->post(route('instructor.questions.store', $subject), $this->questionData())->assertForbidden();
            $this->put(route('instructor.questions.update', [$subject, $question]), $this->questionData())->assertForbidden();
            $this->delete(route('instructor.questions.destroy', [$subject, $question]))->assertForbidden();
            $this->post(route('instructor.questions.upload.preview', $subject), ['file' => $this->csv()])->assertForbidden();
            $this->post(route('instructor.questions.import.confirm', $subject), ['import_token' => 'old'])->assertForbidden();
            $this->delete(route('instructor.questions.import.cancel', $subject), ['import_token' => 'old'])->assertForbidden();
            $this->assertFalse(Gate::allows('manage-questions', $subject));
        }
        $this->assertDatabaseCount('questions', 2);
    }

    public function test_instructor_excel_preview_confirm_cancel_and_template_use_the_existing_workflow(): void
    {
        $teacher = $this->teacher();
        $subject = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $this->actingAs($teacher)->get(route('instructor.questions.download.template', ['subject' => $subject, 'locale' => 'en']))
            ->assertDownload('questions_template.xlsx');
        $this->post(route('instructor.questions.upload.preview', $subject), ['file' => $this->csv()])
            ->assertRedirect(route('instructor.questions.index', $subject));
        $this->get(route('instructor.questions.index', $subject))->assertInertia(fn (Assert $page) => $page
            ->where('importPreview.validCount', 1)->where('importPreview.rows.0.question_text', 'Imported'));
        $key = 'excel_import_'.$subject->id.'_'.$teacher->id;
        $token = session($key)['token'];
        $this->assertDatabaseCount('questions', 0);
        $this->post(route('instructor.questions.import.confirm', $subject), ['import_token' => $token])
            ->assertRedirect(route('instructor.questions.index', $subject));
        $this->assertDatabaseHas('questions', ['subject_id' => $subject->id, 'question_text' => 'Imported']);
        $this->post(route('instructor.questions.upload.preview', $subject), ['file' => $this->csv()]);
        $this->delete(route('instructor.questions.import.cancel', $subject), ['import_token' => session($key)['token']])
            ->assertRedirect(route('instructor.questions.index', $subject));
        $this->assertNull(session($key));
    }

    public function test_results_reviews_exports_and_partial_requests_are_limited_to_assigned_courses(): void
    {
        $teacher = $this->teacher();
        $own = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $other = Subject::factory()->create(['instructor_id' => $this->teacher()->id]);
        $student = User::factory()->create();
        foreach ([$own, $other] as $subject) {
            $attempt = $student->quizAttempts()->create(['subject_id' => $subject->id, 'question_count' => 10,
                'status' => 'completed', 'score' => 8, 'completed_at' => now()]);
            $attempt->items()->create(['position' => 1, ...$this->questionData(), 'selected_answer' => 'B', 'is_correct' => true, 'answered_at' => now()]);
            $this->actingAs($teacher);
            $review = route('instructor.student-results.index', ['subject_id' => $subject->id, 'student_id' => $student->id, 'attempt_id' => $attempt->id]);
            $export = route('instructor.student-results.export', [$subject, $student, $attempt]);
            if ($subject->id === $own->id) {
                $this->get($review)->assertInertia(fn (Assert $page) => $page->has('courses', 1)
                    ->where('courses.0.id', $own->id)->where('review.attempt.id', $attempt->id));
                $this->get($export)->assertDownload("attempt-{$attempt->id}-answers.xlsx");
            } else {
                $this->get($review)->assertForbidden();
                $this->get($export)->assertForbidden();
                $this->get($review, ['X-Inertia' => 'true',
                    'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(request()),
                    'X-Inertia-Partial-Component' => 'Admin/StudentResultsPage',
                    'X-Inertia-Partial-Data' => 'selectedStudent,review,filters'])->assertForbidden();
            }
        }
    }

    public function test_revoking_and_transferring_courses_applies_to_the_next_request_and_preserves_results(): void
    {
        $teacher = $this->teacher();
        $next = $this->teacher();
        $course = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $student = User::factory()->create();
        $attempt = $student->quizAttempts()->create(['subject_id' => $course->id,
            'question_count' => 10, 'status' => 'completed', 'score' => 8, 'completed_at' => now()]);
        $this->actingAs($teacher)->post(route('instructor.questions.upload.preview', $course), ['file' => $this->csv()]);
        $token = session('excel_import_'.$course->id.'_'.$teacher->id)['token'];
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->put(route('admin.instructors.subjects', $teacher), ['subject_ids' => []])->assertSessionHasNoErrors();
        $this->put(route('admin.instructors.subjects', $next), ['subject_ids' => [$course->id]])->assertSessionHasNoErrors();

        $this->actingAs($teacher)->get(route('instructor.questions.index', $course))->assertForbidden();
        $this->post(route('instructor.questions.import.confirm', $course), ['import_token' => $token])->assertForbidden();
        $this->get(route('instructor.student-results.index', ['subject_id' => $course->id]))->assertForbidden();
        $this->get(route('instructor.student-results.export', [$course, $student, $attempt]))->assertForbidden();
        $this->actingAs($next)->get(route('instructor.questions.index', $course))->assertOk();
        $this->get(route('instructor.questions.index', $course))->assertInertia(fn (Assert $page) => $page->where('importPreview', null));
        $this->get(route('instructor.student-results.index', ['subject_id' => $course->id]))->assertOk();
        $this->assertDatabaseHas('quiz_attempts', ['id' => $attempt->id, 'score' => 8]);
        $this->assertDatabaseCount('questions', 0);
        $this->actingAs($student)->get(route('student.level.courses', $course->level))->assertOk();
    }

    public function test_deleting_an_instructor_releases_courses_without_deleting_questions_or_results(): void
    {
        config(['admin.creation_code' => 'secret']);
        $teacher = $this->teacher();
        $course = Subject::factory()->create(['instructor_id' => $teacher->id]);
        $question = Question::factory()->create(['subject_id' => $course->id]);
        $attempt = User::factory()->create()->quizAttempts()->create(['subject_id' => $course->id,
            'question_count' => 10, 'status' => 'completed', 'score' => 8, 'completed_at' => now()]);
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->delete(route('admin.instructors.destroy', $teacher), ['instructor_creation_code' => 'secret'])->assertSessionHasNoErrors();
        $this->assertNull($course->fresh()->instructor_id);
        $this->assertDatabaseHas('questions', ['id' => $question->id]);
        $this->assertDatabaseHas('quiz_attempts', ['id' => $attempt->id, 'score' => 8]);
    }

    public function test_guest_student_admin_and_inactive_instructor_cannot_enter_the_instructor_portal(): void
    {
        $this->get(route('instructor.courses.index'))->assertRedirect(route('login-admin.show'));
        foreach ([User::factory()->create(), User::factory()->create(['role' => 'admin']),
            User::factory()->create(['role' => 'instructor', 'is_active' => false])] as $user) {
            $this->actingAs($user)->get(route('instructor.courses.index'))->assertRedirect('/');
            $this->actingAs($user)->get(route('instructor.student-results.index'))->assertRedirect('/');
        }
    }
}
