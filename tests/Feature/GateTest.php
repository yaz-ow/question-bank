<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Subject;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GateTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function manage_questions_gate_works_for_admin()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($admin);

        // Test the gate directly
        $this->assertTrue(Gate::check('manage-questions', $subject));
    }

    /** @test */
    public function manage_questions_gate_fails_for_inactive_admin()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => false
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($admin);

        // Test the gate directly
        $this->assertFalse(Gate::check('manage-questions', $subject));
    }

    /** @test */
    public function manage_questions_gate_fails_for_student()
    {
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($student);

        // Test the gate directly
        $this->assertFalse(Gate::check('manage-questions', $subject));
    }
}