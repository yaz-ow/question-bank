<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\CustomResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class Phase2PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_notifications_link_to_the_correct_portal(): void
    {
        Notification::fake();
        foreach (['student', 'admin', 'instructor'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $portal = $role === 'student' ? 'student' : 'admin';
            $this->post("/password/request/{$portal}", [
                'email' => $user->email, 'university_id' => $user->university_id,
            ])->assertRedirect("/password/request/{$portal}")->assertSessionHas('status');
            Notification::assertSentTo($user, CustomResetPassword::class, function ($notification) use ($user, $portal) {
                $url = $notification->toMail($user)->actionUrl;
                $this->assertStringContainsString("/password/reset/{$portal}/", $url);
                $this->assertStringContainsString('email='.urlencode($user->email), $url);

                return true;
            });
        }
    }

    public function test_recovery_does_not_disclose_missing_or_mismatched_accounts(): void
    {
        Notification::fake();
        $student = User::factory()->create();
        $requests = [
            ['student', ['email' => 'missing@example.com', 'university_id' => $student->university_id]],
            ['student', ['email' => $student->email, 'university_id' => 'M000000000']],
            ['admin', ['email' => $student->email]],
        ];
        foreach ($requests as [$portal, $data]) {
            $this->post("/password/request/{$portal}", $data)
                ->assertRedirect("/password/request/{$portal}")->assertSessionHas('status');
        }
        Notification::assertNothingSent();
    }

    public function test_each_role_can_reset_and_login_with_the_new_password(): void
    {
        foreach (['student', 'admin', 'instructor'] as $role) {
            $user = User::factory()->create(['role' => $role]);
            $portal = $role === 'student' ? 'student' : 'admin';
            $token = Password::createToken($user);
            $this->get("/password/reset/{$portal}/{$token}")->assertOk();
            $this->post("/password/reset/{$portal}", $this->resetData($user, $token))
                ->assertRedirect("/login/{$portal}")->assertSessionHas('success');
            $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
            $this->assertSame($role, $user->fresh()->role);
            $this->assertTrue($user->fresh()->is_active);
            $this->post("/login/{$portal}", [
                'email' => $user->email, 'university_id' => $user->university_id,
                'password' => 'new-password-123',
            ])->assertRedirect();
            $this->assertAuthenticatedAs($user);
            $this->post('/logout');
        }
    }

    public function test_invalid_expired_and_reused_tokens_are_rejected(): void
    {
        $user = User::factory()->create();
        $this->from('/password/reset/student/invalid')
            ->post('/password/reset/student', $this->resetData($user, 'invalid'))
            ->assertRedirect('/password/reset/student/invalid')->assertSessionHasErrors('email');

        $expired = Password::createToken($user);
        $this->travel(config('auth.passwords.users.expire') + 1)->minutes();
        $this->from("/password/reset/student/{$expired}")
            ->post('/password/reset/student', $this->resetData($user, $expired))
            ->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
        $this->travelBack();

        $token = Password::createToken($user);
        $this->post('/password/reset/student', $this->resetData($user, $token))
            ->assertRedirect('/login/student');
        $this->from("/password/reset/student/{$token}")
            ->post('/password/reset/student', $this->resetData($user, $token, 'another-password-123'))
            ->assertSessionHasErrors('email');
        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }

    public function test_reset_rejects_mismatched_student_identity(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);
        foreach (['email' => 'wrong@example.com', 'university_id' => 'M000000000'] as $field => $value) {
            $data = array_replace($this->resetData($user, $token), [$field => $value]);
            $this->from("/password/reset/student/{$token}")->post('/password/reset/student', $data)
                ->assertRedirect("/password/reset/student/{$token}")->assertSessionHasErrors('university_id');
        }
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_admin_reset_rejects_student_accounts_and_mismatched_email(): void
    {
        $student = User::factory()->create();
        $token = Password::createToken($student);
        $this->from("/password/reset/admin/{$token}")
            ->post('/password/reset/admin', $this->resetData($student, $token))->assertSessionHasErrors('email');
        $admin = User::factory()->create(['role' => 'admin']);
        $token = Password::createToken($admin);
        $this->from("/password/reset/admin/{$token}")->post('/password/reset/admin',
            array_replace($this->resetData($admin, $token), ['email' => 'wrong@example.com']))
            ->assertRedirect("/password/reset/admin/{$token}")->assertSessionHasErrors('email');
    }

    public function test_password_reset_invalidates_an_existing_authenticated_session(): void
    {
        $user = User::factory()->create();
        $oldHash = $user->password;
        $token = Password::createToken($user);
        $this->post('/password/reset/student', $this->resetData($user, $token))->assertRedirect('/login/student');
        $this->actingAs($user->fresh())->withSession(['password_hash_web' => $oldHash])
            ->get('/student/dashboard')->assertRedirect('/login/student');
        $this->assertGuest();
    }

    public function test_reset_removes_only_the_affected_users_database_sessions(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        foreach ([$user, $other] as $account) {
            DB::table('sessions')->insert([
                'id' => 'existing-session-'.$account->id,
                'user_id' => $account->id,
                'payload' => base64_encode(serialize([])),
                'last_activity' => now()->timestamp,
            ]);
        }
        config(['session.driver' => 'database']);
        $token = Password::createToken($user);
        $this->post('/password/reset/student', $this->resetData($user, $token))
            ->assertRedirect('/login/student');
        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseHas('sessions', ['user_id' => $other->id]);
    }

    private function resetData(User $user, string $token, string $password = 'new-password-123'): array
    {
        return ['token' => $token, 'email' => $user->email, 'university_id' => $user->university_id,
            'password' => $password, 'password_confirmation' => $password];
    }
}
