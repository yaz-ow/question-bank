<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3AcademicTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function legacy_levels_page_redirects_to_dashboard()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $this->actingAs($student)
            ->get(route('student.levels'))
            ->assertRedirect(route('student.dashboard'));

        $this->get(route('student.dashboard'))
            ->assertOk()
            ->assertInertia(function ($page) {
                $page->component('StudentDashboardPage')
                    ->has('levels', 9); // Should have all 9 levels
            });
    }

    /** @test */
    public function student_can_browse_courses_for_a_specific_level()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        // Create some test subjects
        Subject::factory()->create([
            'name' => 'مقرر اختبار المستوى 1',
            'level' => 1,
        ]);

        Subject::factory()->create([
            'name' => 'مقرر اختبار المستوى 2',
            'level' => 2,
        ]);

        $this->actingAs($student)
            ->get(route('student.level.courses', ['level' => 1]))
            ->assertOk()
            ->assertInertia(function ($page) {
                $page->component('Student/LevelCourses')
                    ->where('level', 1)
                    ->has('courses.data', 1); // Should have 1 course for level 1
            });
    }

    /** @test */
    public function legacy_course_details_redirects_to_level_course_cards()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $course = Subject::factory()->create([
            'name' => 'مقرر تفصيلي للاختبار',
            'level' => 3,
        ]);

        $this->actingAs($student)
            ->get(route('student.course.details', [
                'level' => $course->level,
                'id' => $course->id
            ]))
            ->assertRedirect(route('student.level.courses', ['level' => $course->level]));

        $this->get(route('student.level.courses', ['level' => $course->level]))
            ->assertOk()
            ->assertInertia(function ($page) {
                $page->component('Student/LevelCourses')
                    ->where('courses.data.0.name', 'مقرر تفصيلي للاختبار')
                    ->where('courses.data.0.level', 3);
            });
    }

    /** @test */
    public function student_can_search_courses_within_level()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        // Create test subjects
        Subject::factory()->create([
            'name' => 'مقرر الرياضيات',
            'level' => 1,
        ]);

        Subject::factory()->create([
            'name' => 'مقرر الفيزياء',
            'level' => 1,
        ]);

        $this->actingAs($student)
            ->get(route('student.level.courses', ['level' => 1, 'search' => 'الرياضيات']))
            ->assertOk()
            ->assertInertia(function ($page) {
                $page->component('Student/LevelCourses')
                    ->where('level', 1)
                    ->where('search', 'الرياضيات')
                    ->has('courses.data', 1)
                    ->where('courses.data.0.name', 'مقرر الرياضيات');
            });
    }

    /** @test */
    public function guest_cannot_access_academic_routes()
    {
        $this->get(route('student.levels'))
            ->assertRedirect('/login/student');
            // ->assertSessionHas('error', 'يجب تسجيل الدخول أولًا');

        $this->get(route('student.level.courses', ['level' => 1]))
            ->assertRedirect('/login/student');

        $this->get(route('student.course.details', ['level' => 1, 'id' => 1]))
            ->assertRedirect('/login/student');
    }

    /** @test */
    public function inactive_student_cannot_access_academic_routes()
    {
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => false,
        ]);

        $this->actingAs($student)
            ->get(route('student.levels'))
            ->assertRedirect('/')
            ->assertSessionHas('error', 'حسابك غير نشط أو تم تعطيله');
    }

    /** @test */
    public function instructor_cannot_access_student_academic_routes()
    {
        $instructor = User::factory()->create([
            'role' => 'instructor',
        ]);

        $this->actingAs($instructor)
            ->get(route('student.levels'))
            ->assertRedirect('/')
            ->assertSessionHas('error', 'غير مسموح لك بالوصول إلى هذه الصفحة');
    }

    /** @test */
    public function invalid_level_returns_404()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $this->actingAs($student)
            ->get(route('student.level.courses', ['level' => 10])) // Invalid level
            ->assertNotFound();

        $this->actingAs($student)
            ->get(route('student.level.courses', ['level' => 0])) // Invalid level
            ->assertNotFound();
    }

    /** @test */
    public function course_with_wrong_level_returns_404()
    {
        $student = User::factory()->create([
            'role' => 'student',
        ]);

        // Create a course in level 1
        $course = Subject::factory()->create([
            'name' => 'مقرر المستوى الأول',
            'level' => 1,
        ]);

        $this->actingAs($student)
            ->get(route('student.course.details', [
                'level' => 2, // Wrong level
                'id' => $course->id
            ]))
            ->assertNotFound();
    }
}
