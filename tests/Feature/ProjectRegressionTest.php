<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProjectRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_html_contains_inertia_mount_and_current_routes(): void
    {
        $this->get('/')->assertOk()->assertSee('data-page=', false)
            ->assertSee('admin.students.toggle', false)->assertSee('password-reset.student.store', false)
            ->assertDontSee('@ inertia', false);
    }

    public function test_guests_are_sent_to_the_correct_login_portal(): void
    {
        $this->get('/student/dashboard')->assertRedirect('/login/student');
        $this->get('/admin/dashboard')->assertRedirect('/login/admin');
        $this->get('/admin/students')->assertRedirect('/login/admin');
    }

    public function test_admin_can_manage_students_and_create_instructors(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['name' => 'Regression Student']);
        $this->actingAs($admin)->get('/admin/students?search=Regression')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/StudentManagementPage')->has('students.data', 1));
        $this->post("/admin/students/{$student->id}/toggle")->assertRedirect();
        $this->assertFalse($student->fresh()->is_active);
        $this->post("/admin/students/{$student->id}/toggle")->assertRedirect();
        $this->assertTrue($student->fresh()->is_active);
        $this->get('/admin/instructors/create')->assertOk();
        config(['admin.creation_code' => 'test-creation-code']);
        $data = ['name' => 'Instructor', 'email' => 'instructor@example.com',
            'password' => 'password123', 'password_confirmation' => 'password123'];
        $this->post('/admin/instructors', $data + ['instructor_creation_code' => 'wrong'])
            ->assertSessionHasErrors('instructor_creation_code');
        $this->assertDatabaseMissing('users', ['email' => 'instructor@example.com']);
        $this->post('/admin/instructors', $data + ['instructor_creation_code' => 'test-creation-code'])
            ->assertRedirect('/admin/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'instructor@example.com', 'role' => 'instructor']);
    }

    public function test_instructors_cannot_manage_accounts_or_use_student_dashboard(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $student = User::factory()->create();
        $this->actingAs($instructor)->get('/admin/students')->assertRedirect('/');
        $this->post("/admin/students/{$student->id}/toggle")->assertRedirect('/');
        $this->post('/admin/instructors', [])->assertRedirect('/');
        $this->get('/student/dashboard')->assertRedirect('/');
        $this->assertTrue($student->fresh()->is_active);
    }

    public function test_admin_cannot_toggle_another_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $other = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->post("/admin/students/{$other->id}/toggle")->assertSessionHas('error');
        $this->assertTrue($other->fresh()->is_active);
    }

    public function test_subject_crud_and_validation(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->get('/admin/subjects/create')->assertOk();
        $this->post('/admin/subjects', ['name' => '  Algebra  ', 'level' => 2])->assertRedirect('/admin/subjects');
        $subject = Subject::firstOrFail();
        $this->assertSame('Algebra', $subject->name);
        $this->get('/admin/subjects?level=2&search=Alg')->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Subjects/Index')->has('subjects.data', 1));
        $this->get("/admin/subjects/{$subject->id}")->assertOk();
        $this->get("/admin/subjects/{$subject->id}/edit")->assertOk();
        $this->post('/admin/subjects', ['name' => 'Algebra', 'level' => 2])->assertSessionHasErrors('name');
        $this->post('/admin/subjects', ['name' => 'Invalid', 'level' => 10])->assertSessionHasErrors('level');
        $this->put("/admin/subjects/{$subject->id}", ['name' => 'Algebra', 'level' => 3])->assertRedirect('/admin/subjects');
        $this->assertSame(3, $subject->fresh()->level);
        $this->delete("/admin/subjects/{$subject->id}")->assertRedirect('/admin/subjects');
        $this->assertDatabaseCount('subjects', 0);
    }

    public function test_subjects_are_available_to_instructors_but_not_students(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'instructor']))->get('/admin/subjects')->assertOk();
        $this->actingAs(User::factory()->create())->get('/admin/subjects')->assertRedirect('/');
        $this->post('/admin/subjects', ['name' => 'Forbidden', 'level' => 1])->assertRedirect('/');
        $this->assertDatabaseCount('subjects', 0);
    }

    public function test_login_throttling_is_separate_from_page_visits_and_other_portals(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->get('/login/student')->assertOk();
        }
        $data = ['university_id' => 'M000000000', 'password' => 'wrong'];
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login/student', $data)->assertRedirect('/login/student');
        }
        $this->post('/login/student', $data)->assertStatus(429);
        $this->post('/login/admin', ['email' => 'missing@example.com', 'password' => 'wrong'])
            ->assertRedirect('/login/admin');
        $this->post('/password/request/student', $data + ['email' => 'missing@example.com'])
            ->assertRedirect('/password/request/student');
    }

    public function test_registration_normalizes_university_id_and_ignores_forged_role(): void
    {
        $this->post('/register', ['name' => 'Student', 'email' => 'new@example.com',
            'university_id' => 'm123456789', 'password' => 'password123', 'password_confirmation' => 'password123',
            'role' => 'admin', 'is_active' => false])->assertRedirect('/student/dashboard');
        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'university_id' => 'M123456789',
            'role' => 'student', 'is_active' => true]);
    }
}
