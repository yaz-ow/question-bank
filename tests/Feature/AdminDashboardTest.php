<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_founder_sees_actual_counts_and_subject_question_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(3)->create(['role' => 'student']);
        User::factory()->create(['role' => 'instructor']);
        $subject = Subject::factory()->create(['level' => 2]);
        Subject::factory()->create(['level' => 2]);
        Subject::factory()->create(['level' => 5]);
        Question::factory()->count(4)->create(['subject_id' => $subject->id]);

        $this->actingAs($admin)->get(route('admin.dashboard'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('AdminDashboardPage')
                ->where('stats.subjects', 3)->where('stats.questions', 4)
                ->where('stats.students', 3)->where('stats.levels', 2)
                ->has('subjects.data', 3)
                ->where('subjects.data', fn ($rows) => collect($rows)->firstWhere('id', $subject->id)['questions_count'] === 4));
    }

    public function test_instructor_does_not_receive_student_statistics(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $this->actingAs($instructor)->get(route('admin.dashboard'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('AdminDashboardPage')->missing('stats.students')
                ->where('stats.subjects', 0)->where('stats.questions', 0)->where('stats.levels', 0));
    }

    public function test_dashboard_filters_and_pagination_preserve_global_totals(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Subject::factory()->count(7)->sequence(fn ($sequence) => ['name' => 'Database '.$sequence->index, 'level' => 4])->create();
        Subject::factory()->create(['name' => 'Database Other Level', 'level' => 5]);
        Subject::factory()->create(['name' => 'Operating Systems', 'level' => 4]);

        $this->actingAs($admin)->get(route('admin.dashboard', ['search' => 'Database', 'level' => 4, 'page' => 2]))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('stats.subjects', 9)->where('subjects.total', 7)
                ->where('subjects.current_page', 2)->has('subjects.data', 3)
                ->where('subjects.data.0.name', 'Database 4')->where('subjects.data.0.level', 4)
                ->where('filters.search', 'Database')->where('filters.level', '4')
                ->where('subjects.prev_page_url', fn ($url) => str_contains($url, 'search=Database') && str_contains($url, 'level=4')));
    }

    public function test_student_inactive_and_guest_cannot_access_admin_dashboard(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect();
        $student = User::factory()->create(['role' => 'student']);
        $this->actingAs($student)->get(route('admin.dashboard'))
            ->assertRedirect('/')->assertSessionHas('error', 'غير مسموح لك بالوصول إلى هذه الصفحة');
        $inactive = User::factory()->create(['role' => 'admin', 'is_active' => false]);
        $this->actingAs($inactive)->get(route('admin.dashboard'))
            ->assertRedirect('/')->assertSessionHas('error', 'حسابك غير نشط أو تم تعطيله');
    }

    public function test_invalid_level_filter_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get(route('admin.dashboard', ['level' => 10]))->assertSessionHasErrors('level');
    }
}
