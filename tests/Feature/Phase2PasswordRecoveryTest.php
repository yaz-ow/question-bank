<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CustomResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class Phase2PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test student password recovery with matching university ID and email
     */
    public function test_student_recovery_matching_details()
    {
        // Create a student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        // Check that a reset notification was actually sent
        Notification::fake();

        // Request password reset with matching details
        $response = $this->post('/password/request/student', [
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
        ]);

        // Should redirect back with status message
        $response->assertRedirect('/password/request/student');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');

        // Assert that a reset notification was sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\CustomResetPassword::class
        );
    }

    /**
     * Test student password recovery with mismatched university ID and email
     */
    public function test_student_recovery_mismatched_details()
    {
        // Create a student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        // No reset notification should have been sent
        Notification::fake();

        // Request password reset with mismatched details
        $response = $this->post('/password/request/student', [
            'university_id' => 'M123456789', // Correct ID
            'email' => 'wrong@example.com',   // Wrong email
        ]);

        // Should still show generic message (for security)
        $response->assertRedirect('/password/request/student');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');

        Notification::assertNotSentTo(
            $user,
            \App\Notifications\CustomResetPassword::class
        );
    }

    /**
     * Test student password recovery with non-existent user
     */
    public function test_student_recovery_nonexistent_user()
    {
        // Request password reset for non-existent user
        $response = $this->post('/password/request/student', [
            'university_id' => 'M999999999',
            'email' => 'nonexistent@example.com',
        ]);

        // Should still show generic message (for security)
        $response->assertRedirect('/password/request/student');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    }

    /**
     * Test admin password recovery with matching email
     */
    public function test_admin_recovery_matching_details()
    {
        // Create an admin user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Check that a reset notification was actually sent
        Notification::fake();

        // Request password reset with matching email
        $response = $this->post('/password/request/admin', [
            'email' => 'admin@example.com',
        ]);

        // Should redirect back with status message
        $response->assertRedirect('/password/request/admin');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');

        // Assert that a reset notification was sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\CustomResetPassword::class
        );
    }

    /**
     * Test instructor password recovery with matching email
     */
    public function test_instructor_recovery_matching_details()
    {
        // Create an instructor user
        $user = User::factory()->create([
            'email' => 'instructor@example.com',
            'role' => 'instructor',
            'is_active' => true,
        ]);

        // Check that a reset notification was actually sent
        Notification::fake();

        // Request password reset with matching email
        $response = $this->post('/password/request/admin', [
            'email' => 'instructor@example.com',
        ]);

        // Should redirect back with status message
        $response->assertRedirect('/password/request/admin');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');

        // Assert that a reset notification was sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\CustomResetPassword::class
        );
    }

    /**
     * Test admin password recovery with non-matching role (student)
     */
    public function test_admin_recovery_wrong_role()
    {
        // Create a student user
        $user = User::factory()->create([
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        // No reset notification should have been sent
        Notification::fake();

        // Request password reset for admin route with student user
        $response = $this->post('/password/request/admin', [
            'email' => 'student@example.com',
        ]);

        // Should still show generic message (for security)
        $response->assertRedirect('/password/request/admin');
        $response->assertSessionHas('status', 'إذا كانت التفاصيل صحيحة، سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');

        Notification::assertNotSentTo(
            $user,
            \App\Notifications\CustomResetPassword::class
        );
    }

    /**
     * Test successful student password reset with valid token
     */
    public function test_successful_student_password_reset()
    {
        // Create a student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Show the reset form (should work)
        $response = $this->get("/password/reset/student/{$token}");
        $response->assertStatus(200);

        // Submit the password reset form
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect to login page with success message
        $response->assertRedirect('/login/student');
        $response->assertSessionHas('success', 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول');

        // Verify the password was actually changed and user can login with new password
        $this->post('/login/student', [
            'university_id' => 'M123456789',
            'password' => 'new_password',
        ]);

        $this->assertAuthenticated();
        $this->assertAuthenticatedAs($user);

        // Verify role and active status are preserved
        $this->assertEquals('student', $user->fresh()->role);
        $this->assertTrue($user->fresh()->is_active);
    }

    /**
     * Test successful admin password reset with valid token
     */
    public function test_successful_admin_password_reset()
    {
        // Create an admin user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Submit the password reset form
        $response = $this->post('/password/reset/admin', [
            'token' => $token,
            'email' => 'admin@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect to login page with success message
        $response->assertRedirect('/login/admin');
        $response->assertSessionHas('success', 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول');

        // Verify the password was actually changed and user can login with new password
        $this->post('/login/admin', [
            'email' => 'admin@example.com',
            'password' => 'new_password',
        ]);

        $this->assertAuthenticated();
        $this->assertAuthenticatedAs($user);

        // Verify role and active status are preserved
        $this->assertEquals('admin', $user->fresh()->role);
        $this->assertTrue($user->fresh()->is_active);
    }

    /**
     * Test password reset with invalid token
     */
    public function test_password_reset_invalid_token()
    {
        // Create a user with valid university ID for student
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'role' => 'student',
            'university_id' => 'M123456789',
            'is_active' => true,
        ]);

        // Try to reset password with invalid token
        $response = $this->withHeaders([
            'Referer' => '/password/reset/student/invalid-token'
        ])->post('/password/reset/student', [
            'token' => 'invalid-token',
            'university_id' => 'M123456789',
            'email' => 'test@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect back with errors (invalid token is rejected)
        $response->assertRedirect('/password/reset/student/invalid-token');
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test password reset with mismatched university ID for student
     */
    public function test_password_reset_student_mismatched_university_id()
    {
        // Create a student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Set previous URL
        $this->from("/password/reset/student/{$token}");

        // Try to reset password with wrong university ID
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => 'M999999999', // Wrong ID
            'email' => 'student@example.com',
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect back with errors
        $response->assertRedirect("/password/reset/student/{$token}");
        $response->assertSessionHasErrors('university_id');

        // Assert that the user's password remains unchanged
        $this->assertTrue(Hash::check('old_password', $user->fresh()->password));
    }

    /**
     * Test password reset with mismatched email for student
     */
    public function test_password_reset_student_mismatched_email()
    {
        // Create a student user
        $user = User::factory()->create([
            'university_id' => 'M123456789',
            'email' => 'student@example.com',
            'role' => 'student',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Set previous URL
        $this->from("/password/reset/student/{$token}");

        // Try to reset password with wrong email
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => $user->university_id,
            'email' => 'wrong@example.com', // Wrong email
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect back with errors
        $response->assertRedirect("/password/reset/student/{$token}");
        $response->assertSessionHasErrors('email');

        // Assert that the user's password remains unchanged
        $this->assertTrue(Hash::check('old_password', $user->fresh()->password));
    }

    /**
     * Test password reset with mismatched email for admin
     */
    public function test_password_reset_admin_mismatched_email()
    {
        // Create an admin user
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Try to reset password with wrong email
        $response = $this->post('/password/reset/admin', [
            'token' => $token,
            'email' => 'wrong@example.com', // Wrong email
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should redirect back with errors
        $response->assertRedirect("/password/reset/admin/{$token}");
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that expired tokens cannot be used (simulate by using old token)
     */
    public function test_password_reset_expired_token()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'role' => 'student',
            'is_active' => true,
        ]);

        // Create a token and then "expire" it by changing the user's email
        // (in real scenario, tokens have expiration, but we'll simulate by making token invalid)
        $token = Password::createToken($user);

        // Change user's email to invalidate the token
        $user->update(['email' => 'newemail@example.com']);

        // Try to use the old token
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => $user->university_id,
            'email' => 'test@example.com', // Original email (no longer matches user)
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should fail because user not found with that email
        $response->assertRedirect("/password/reset/student/{$token}");
        $response->assertSessionHasErrors('email');
    }

    /**
     * Test that a reset token can only be used once (reused token)
     */
    public function test_password_reset_reused_token()
    {
        // Create a user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'role' => 'student',
            'is_active' => true,
            'password' => bcrypt('old_password'),
        ]);

        // Generate a reset token
        $token = Password::createToken($user);

        // Use the token to reset password (first time)
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => $user->university_id,
            'email' => $user->email,
            'password' => 'new_password',
            'password_confirmation' => 'new_password',
        ]);

        // Should succeed
        $response->assertRedirect('/login/student');
        $response->assertSessionHas('success');

        // Try to use the same token again (second time)
        $response = $this->post('/password/reset/student', [
            'token' => $token,
            'university_id' => $user->university_id,
            'email' => $user->email,
            'password' => 'another_password',
            'password_confirmation' => 'another_password',
        ]);

        // Should fail because token was already used
        $response->assertRedirect("/password/reset/student/{$token}");
        $response->assertSessionHasErrors('email');
    }
}