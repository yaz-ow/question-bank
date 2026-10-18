<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordValidationTest extends TestCase
{
    use RefreshDatabase;

    private function invalidPasswords(): array
    {
        return [str_repeat('a', 73), str_repeat('س', 37), "password\0invalid"];
    }

    public function test_registration_rejects_passwords_that_bcrypt_cannot_preserve(): void
    {
        foreach ($this->invalidPasswords() as $password) {
            $this->post('/register', ['name' => 'Student', 'email' => 'student@example.com',
                'university_id' => 'M123456789', 'password' => $password, 'password_confirmation' => $password])
                ->assertSessionHasErrors('password');
            $this->assertDatabaseCount('users', 0);
        }
    }

    public function test_instructor_creation_rejects_invalid_passwords_without_creating_an_account(): void
    {
        config(['admin.creation_code' => 'test-creation-code']);
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        foreach ($this->invalidPasswords() as $password) {
            $this->post('/admin/instructors', ['name' => 'Instructor', 'email' => 'teacher@example.com',
                'instructor_creation_code' => 'test-creation-code',
                'password' => $password, 'password_confirmation' => $password])
                ->assertSessionHasErrors('password');
            $this->assertDatabaseMissing('users', ['email' => 'teacher@example.com']);
        }
    }

    public function test_password_reset_rejects_invalid_passwords_for_every_role_and_preserves_credentials(): void
    {
        foreach (['student', 'admin', 'instructor'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $oldHash = $user->password;
            $token = Password::createToken($user);
            $portal = $role === 'student' ? 'student' : 'admin';
            foreach ($this->invalidPasswords() as $password) {
                $this->post('/password/reset/'.$portal, ['email' => $user->email,
                    'university_id' => $user->university_id, 'token' => $token,
                    'password' => $password, 'password_confirmation' => $password])
                    ->assertSessionHasErrors('password');
                $this->assertSame($oldHash, $user->fresh()->password);
            }
        }
    }

    public function test_a_multibyte_password_at_the_byte_limit_can_register_and_sign_in(): void
    {
        $password = str_repeat('س', 36);
        $this->post('/register', ['name' => 'Student', 'email' => 'student@example.com',
            'university_id' => 'M123456789', 'password' => $password, 'password_confirmation' => $password])
            ->assertRedirect('/student/dashboard')->assertSessionHasNoErrors();
        $student = User::sole();
        $this->post('/logout');
        $this->post('/login/student', ['university_id' => $student->university_id, 'password' => $password])
            ->assertRedirect('/student/dashboard');
        $this->assertAuthenticatedAs($student);
    }
}
