<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectRouteTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_access_subjects_index()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $this->actingAs($admin)
            ->get(route('admin.subjects.index'))
            ->assertOk();
    }
}