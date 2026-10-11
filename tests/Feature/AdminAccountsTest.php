<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAccountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_statistics_are_global_and_search_status_and_registration_date_are_available(): void
    {
        $this->travelTo(now()->startOfMonth()->addDays(10));
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['name' => 'Current Student', 'email' => 'current@example.com', 'university_id' => 'M111111111']);
        User::factory()->create(['name' => 'Old Student', 'is_active' => false, 'created_at' => now()->subMonth()]);
        User::factory()->create(['role' => 'instructor', 'name' => 'Current Instructor']);

        $this->actingAs($admin)->get(route('admin.students.index', ['search' => 'M111111111', 'status' => 'active']))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/StudentManagementPage')
            ->where('stats.total', 2)->where('stats.active', 1)->where('stats.inactive', 1)->missing('stats.this_month')
            ->where('students.total', 1)->where('students.data.0.name', 'Current Student')
            ->where('students.data.0.created_at', now()->toDateString())
            ->where('filters.search', 'M111111111')->where('filters.status', 'active')
            ->missing('students.data.0.password')->missing('students.data.0.remember_token'));
        $this->get(route('admin.students.index', ['search' => 'current@example.com', 'status' => 'inactive']))
            ->assertInertia(fn (Assert $page) => $page->where('students.total', 0)->where('stats.total', 2));
    }

    public function test_both_account_lists_preserve_search_and_status_on_pagination(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach (['student' => 'students', 'instructor' => 'instructors'] as $role => $key) {
            User::factory()->count(12)->sequence(fn ($sequence) => [
                'name' => 'Account '.str_pad($sequence->index, 2, '0', STR_PAD_LEFT),
            ])->create(['role' => $role, 'is_active' => false]);
            User::factory()->create(['role' => $role, 'name' => 'Account Active']);
            $this->get(route("admin.{$key}.index", ['search' => 'Account', 'status' => 'inactive', 'page' => 2]))
                ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where("{$key}.total", 12)->has("{$key}.data", 2)->where("{$key}.data.0.name", 'Account 10')
                ->where('stats.total', 13)->where('stats.active', 1)->where('stats.inactive', 12)
                ->where("{$key}.prev_page_url", fn ($url) => str_contains($url, 'search=Account') && str_contains($url, 'status=inactive')));
        }
    }

    public function test_instructor_management_legacy_url_and_filter_validation(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->get(route('admin.instructors.create'))->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/InstructorCreationPage')
                ->where('instructors.total', 0)->where('stats.total', 0));
        foreach (['students', 'instructors'] as $key) {
            $this->get(route("admin.{$key}.index", ['status' => 'unknown']))->assertSessionHasErrors('status');
            $this->get(route("admin.{$key}.index", ['search' => str_repeat('x', 256)]))->assertSessionHasErrors('search');
        }
    }

    public function test_instructor_creation_keeps_the_founder_in_management_and_never_flashes_secrets(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        config(['admin.creation_code' => 'creation-secret']);
        $data = ['name' => 'New Instructor', 'email' => 'new@example.com', 'password' => 'password123',
            'password_confirmation' => 'password123', 'instructor_creation_code' => 'wrong-secret'];
        $this->from(route('admin.instructors.index'))->post(route('admin.instructors.store'), $data)
            ->assertRedirect(route('admin.instructors.index'))->assertSessionHasErrors('instructor_creation_code')
            ->assertSessionMissing('_old_input.password')->assertSessionMissing('_old_input.password_confirmation')
            ->assertSessionMissing('_old_input.instructor_creation_code');
        $this->assertDatabaseMissing('users', ['email' => 'new@example.com']);
        $data['instructor_creation_code'] = 'creation-secret';
        $this->post(route('admin.instructors.store'), array_merge($data, ['email' => 'bad email']))
            ->assertSessionHasErrors('email')->assertSessionMissing('_old_input.instructor_creation_code');
        $this->post(route('admin.instructors.store'), $data + ['role' => 'admin', 'is_active' => false])
            ->assertRedirect(route('admin.instructors.index'))->assertSessionHas('success');
        $user = User::where('email', 'new@example.com')->firstOrFail();
        $this->assertSame('instructor', $user->role);
        $this->assertTrue($user->is_active);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->get(route('admin.instructors.index'))->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 1)->where('instructors.data.0.email', 'new@example.com')
            ->missing('instructors.data.0.password')->missing('instructor_creation_code'));
    }

    public function test_instructor_edit_validates_unique_email_and_only_updates_name_and_email(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $instructor = User::factory()->create(['role' => 'instructor', 'is_active' => false]);
        $password = $instructor->password;
        $other = User::factory()->create();
        $this->put(route('admin.instructors.update', $instructor), ['name' => 'New Name', 'email' => $other->email])
            ->assertSessionHasErrors('email');
        $this->assertNotSame('New Name', $instructor->fresh()->name);
        $this->put(route('admin.instructors.update', $instructor), ['name' => 'New Name', 'email' => $instructor->email,
            'role' => 'admin', 'is_active' => true, 'password' => 'another-password'])
            ->assertRedirect()->assertSessionHas('success');
        $instructor->refresh();
        $this->assertSame('New Name', $instructor->name);
        $this->assertSame('instructor', $instructor->role);
        $this->assertFalse($instructor->is_active);
        $this->assertSame($password, $instructor->password);
        $this->put(route('admin.instructors.update', $instructor), ['name' => 'New Name', 'email' => 'changed@example.com'])
            ->assertSessionHas('success');
        $this->assertSame('changed@example.com', $instructor->fresh()->email);
    }

    public function test_explicit_status_updates_can_be_retried_without_reversing_the_status(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach (['student' => 'students', 'instructor' => 'instructors'] as $role => $key) {
            $user = User::factory()->create(['role' => $role]);
            foreach ([false, false, true] as $active) {
                $this->post(route("admin.{$key}.toggle", $user), ['is_active' => $active])
                    ->assertRedirect()->assertSessionHas('success');
                $this->assertSame($active, $user->fresh()->is_active);
            }
            $this->post(route("admin.{$key}.toggle", $user), ['is_active' => 'invalid'])
                ->assertSessionHasErrors('is_active');
            $this->assertTrue($user->fresh()->is_active);
        }
    }

    public function test_instructor_endpoints_cannot_mutate_students_or_admins(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach (['admin', 'student'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $this->put(route('admin.instructors.update', $user), ['name' => 'Forbidden', 'email' => 'forbidden@example.com'])->assertNotFound();
            $this->post(route('admin.instructors.toggle', $user), ['is_active' => false])->assertNotFound();
            $this->delete(route('admin.instructors.destroy', $user), ['instructor_creation_code' => 'creation-secret'])->assertNotFound();
            $this->assertTrue($user->fresh()->is_active);
            $this->assertNotSame('Forbidden', $user->fresh()->name);
        }
    }

    public function test_only_an_active_founder_can_manage_accounts(): void
    {
        $target = User::factory()->create(['role' => 'instructor']);
        $student = User::factory()->create();
        foreach (['student', 'instructor', 'inactive-admin'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role === 'inactive-admin' ? 'admin' : $role,
                'is_active' => $role !== 'inactive-admin']));
            foreach (['admin.students.index', 'admin.instructors.index', 'admin.instructors.create'] as $route) {
                $this->get(route($route))->assertRedirect();
            }
            $this->post(route('admin.instructors.store'), [])->assertRedirect();
            $this->put(route('admin.instructors.update', $target), ['name' => 'Forbidden', 'email' => 'forbidden@example.com'])->assertRedirect();
            $this->post(route('admin.instructors.toggle', $target), ['is_active' => false])->assertRedirect();
            $this->delete(route('admin.instructors.destroy', $target), ['instructor_creation_code' => 'creation-secret'])->assertRedirect();
            $this->post(route('admin.students.toggle', $student), ['is_active' => false])->assertRedirect();
        }
        $this->assertTrue($target->fresh()->is_active);
        $this->assertTrue($student->fresh()->is_active);
        $this->assertNotSame('Forbidden', $target->fresh()->name);
    }

    public function test_instructor_deletion_rejects_invalid_codes_without_flashing_the_secret(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        config(['admin.creation_code' => 'creation-secret']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        foreach ([[], ['instructor_creation_code' => 'wrong-secret'], ['instructor_creation_code' => ['creation-secret']],
            ['instructor_creation_code' => str_repeat('x', 256)]] as $input) {
            $this->from(route('admin.instructors.index'))->delete(route('admin.instructors.destroy', $instructor), $input)
                ->assertRedirect(route('admin.instructors.index'))->assertSessionHasErrors('instructor_creation_code')
                ->assertSessionMissing('_old_input.instructor_creation_code');
            $this->assertDatabaseHas('users', ['id' => $instructor->id]);
        }
    }

    public function test_instructor_deletion_requires_a_configured_creation_code(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        config(['admin.creation_code' => '']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'anything'])
            ->assertSessionHasErrors('instructor_creation_code');
        $this->assertDatabaseHas('users', ['id' => $instructor->id]);
    }

    public function test_instructor_deletion_with_the_creation_code_preserves_academic_data_and_student_results(): void
    {
        $this->actingAs($admin = User::factory()->create(['role' => 'admin']));
        config(['admin.creation_code' => 'creation-secret']);
        $student = User::factory()->create();
        $instructor = User::factory()->create(['role' => 'instructor']);
        $subject = Subject::factory()->create();
        $question = Question::factory()->create(['subject_id' => $subject->id]);
        $attempt = $student->quizAttempts()->create(['subject_id' => $subject->id,
            'question_count' => 10, 'status' => 'completed', 'score' => 8, 'completed_at' => now()]);
        Password::createToken($instructor);

        $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'creation-secret'])
            ->assertRedirect(route('admin.instructors.index'))->assertSessionHas('success')
            ->assertSessionMissing('_old_input.instructor_creation_code');
        $this->assertDatabaseMissing('users', ['id' => $instructor->id]);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $instructor->email]);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
        $this->assertDatabaseHas('users', ['id' => $student->id]);
        $this->assertDatabaseHas('subjects', ['id' => $subject->id]);
        $this->assertDatabaseHas('questions', ['id' => $question->id]);
        $this->assertDatabaseHas('quiz_attempts', ['id' => $attempt->id, 'user_id' => $student->id, 'score' => 8]);
        $this->get(route('admin.instructors.index'))->assertInertia(fn (Assert $page) => $page
            ->where('stats.total', 0)->where('instructors.total', 0));
        $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'creation-secret'])
            ->assertNotFound();
    }

    public function test_guest_cannot_delete_an_instructor(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'creation-secret'])
            ->assertRedirect(route('login-admin.show'));
        $this->assertDatabaseHas('users', ['id' => $instructor->id]);
    }

    public function test_instructor_deletion_code_attempts_are_rate_limited(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        config(['admin.creation_code' => 'creation-secret']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'wrong-secret'])
                ->assertSessionHasErrors('instructor_creation_code');
        }
        $this->delete(route('admin.instructors.destroy', $instructor), ['instructor_creation_code' => 'creation-secret'])
            ->assertStatus(429);
        $this->assertDatabaseHas('users', ['id' => $instructor->id]);
    }
}
