<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class Phase2AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test student registration scenarios
     */
    public function test_student_registration_valid()
    {
        $response = $this->post('/register', [
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'university_id' => 'M123456789',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('student.dashboard'));
        $response->assertSessionHas('success', 'حسابك تم إنشاؤه بنجاح');

        // Verify user was created correctly
        $this->assertDatabaseHas('users', [
            'email' => 'student@example.com',
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => true,
        ]);

        // Verify user is authenticated
        $this->assertAuthenticated();
    }

    public function test_student_registration_duplicate_university_id()
    {
        // Create existing user
        User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => true,
        ]);

        $response = $this->post('/register', [
            'name' => 'Test Student',
            'email' => 'student2@example.com',
            'university_id' => 'M123456789', // Duplicate ID
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('university_id');
    }

    public function test_student_registration_invalid_university_id_format()
    {
        $response = $this->post('/register', [
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'university_id' => 'M12345678', // Too short
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('university_id');
    }

    public function test_student_registration_university_id_not_matching_pattern()
    {
        $response = $this->post('/register', [
            'name' => 'Test Student',
            'email' => 'student@example.com',
            'university_id' => 'T123456789', // Doesn't start with M
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('university_id');
    }

    /**
     * Test student login scenarios
     */
    public function test_student_login_correct_credentials()
    {
        // Create active student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => true,
            'email' => 'student@example.com',
        ]);

        $response = $this->post('/login/student', [
            'university_id' => 'M123456789',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('student.dashboard'));
        $response->assertSessionHas('success', 'مرحبا بعودتك');
        $this->assertAuthenticatedAs($user);
    }

    public function test_student_login_wrong_credentials()
    {
        // Create active student user
        User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => true,
        ]);

        $response = $this->post('/login/student', [
            'university_id' => 'M123456789',
            'password' => 'wrongpassword',
        ]);

        $response->assertRedirect('/login/student');
        $response->assertSessionHasErrors('university_id');
        $this->assertGuest();
    }

    public function test_student_login_wrong_portal_using_email_instead_of_university_id()
    {
        // Create active student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => true,
            'email' => 'student@example.com',
        ]);

        $response = $this->post('/login/student', [
            'university_id' => 'student@example.com', // Using email instead of university ID
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/student');
        $response->assertSessionHasErrors('university_id');
        $this->assertGuest();
    }

    public function test_student_login_forged_role_attempt()
    {
        // Create user with instructor role
        User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'instructor',
            'is_active' => true,
        ]);

        $response = $this->post('/login/student', [
            'university_id' => 'M123456789',
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/student');
        $response->assertSessionHasErrors('university_id');
        $this->assertGuest();
    }

    public function test_student_login_inactive_account()
    {
        // Create inactive student user
        User::factory()->create([
            'university_id' => 'M123456789',
            'role' => 'student',
            'is_active' => false,
        ]);

        $response = $this->post('/login/student', [
            'university_id' => 'M123456789',
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/student');
        $response->assertSessionHasErrors('university_id');
        $this->assertGuest();
    }

    /**
     * Test admin login scenarios
     */
    public function test_admin_login_correct_credentials()
    {
        // Create active admin user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $response->assertSessionHas('success', 'مرحبا بعودتك');
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_login_correct_credentials_instructor()
    {
        // Create active instructor user
        $user = User::factory()->create([
            'email' => 'instructor@example.com',
            'role' => 'instructor',
            'is_active' => true,
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'instructor@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $response->assertSessionHas('success', 'مرحبا بعودتك');
        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_login_wrong_credentials()
    {
        // Create active admin user
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'admin@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertRedirect('/login/admin');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_login_wrong_portal_using_university_id_instead_of_email()
    {
        // Create active admin user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'university_id' => 'M987654321',
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'M987654321', // Using university ID instead of email
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/admin');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_login_forged_role_attempt_student()
    {
        // Create user with student role
        User::factory()->create([
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'student@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/admin');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_login_inactive_account()
    {
        // Create inactive admin user
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => false,
        ]);

        $response = $this->post('/login/admin', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect('/login/admin');
        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}