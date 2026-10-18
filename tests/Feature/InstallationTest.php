<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InstallationTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_founder_is_created_with_a_hashed_password(): void
    {
        $this->artisan('app:create-founder')
            ->expectsQuestion('Founder name', 'Founder')
            ->expectsQuestion('Founder email', 'founder@example.com')
            ->expectsQuestion('Password (at least 12 characters)', 'secure-password-123')
            ->expectsQuestion('Confirm password', 'secure-password-123')
            ->assertSuccessful();

        $founder = User::sole();
        $this->assertSame('admin', $founder->role);
        $this->assertTrue($founder->is_active);
        $this->assertNull($founder->university_id);
        $this->assertTrue(Hash::check('secure-password-123', $founder->password));
        $this->post('/login/admin', ['email' => $founder->email, 'password' => 'secure-password-123'])
            ->assertRedirect('/admin/dashboard');
    }

    public function test_existing_founder_is_preserved_and_no_second_founder_is_created(): void
    {
        $founder = User::factory()->create(['role' => 'admin', 'is_active' => false]);
        $original = $founder->fresh()->getRawOriginal();
        $this->artisan('app:create-founder')->assertFailed();
        $this->assertDatabaseCount('users', 1);
        $this->assertSame($original, $founder->fresh()->getRawOriginal());
    }

    public function test_existing_student_cannot_be_promoted_by_the_installer(): void
    {
        $student = User::factory()->create();
        $this->artisan('app:create-founder')
            ->expectsQuestion('Founder name', 'Founder')
            ->expectsQuestion('Founder email', $student->email)
            ->expectsQuestion('Password (at least 12 characters)', 'secure-password-123')
            ->expectsQuestion('Confirm password', 'secure-password-123')
            ->assertFailed();
        $this->assertSame('student', $student->fresh()->role);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_invalid_passwords_do_not_create_an_account(): void
    {
        foreach ([['short', 'short'], ['secure-password-123', 'different-password'], [str_repeat('س', 37), str_repeat('س', 37)]] as [$password, $confirmation]) {
            $this->artisan('app:create-founder')
                ->expectsQuestion('Founder name', 'Founder')
                ->expectsQuestion('Founder email', 'founder@example.com')
                ->expectsQuestion('Password (at least 12 characters)', $password)
                ->expectsQuestion('Confirm password', $confirmation)
                ->assertFailed();
            $this->assertDatabaseCount('users', 0);
        }
    }

    public function test_default_seeder_does_not_install_demo_accounts(): void
    {
        $this->seed();
        $this->assertDatabaseCount('users', 0);
    }
}
