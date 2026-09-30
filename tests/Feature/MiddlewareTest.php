<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class MiddlewareTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function student_cannot_access_admin_dashboard()
    {
        // Create an active student user
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => true,
        ]);

        // Act as the student
        $this->actingAs($student);

        // Attempt to access the admin dashboard
        $response = $this->get(route('admin.dashboard'));

        // Should be redirected (or forbidden) because the student lacks the admin/instructor role
        // In our middleware, the EnsureUserHasRole middleware will redirect to '/' with an error
        $response->assertRedirect('/');
        $response->assertSessionHas('error', 'غير مسموح لك بالوصول إلى هذه الصفحة');
    }

    /** @test */
    public function inactive_user_cannot_access_protected_route()
    {
        // Create an inactive student user
        $user = User::factory()->create([
            'role' => 'student',
            'is_active' => false,
        ]);

        // Act as the user
        $this->actingAs($user);

        // Attempt to access the student dashboard (protected by auth and active middleware)
        $response = $this->get(route('student.dashboard'));

        // Should be redirected to '/' because the user is inactive
        $response->assertRedirect('/');
        $response->assertSessionHas('error', 'حسابك غير نشط أو تم تعطيله');
    }
}