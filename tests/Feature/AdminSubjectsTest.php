<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSubjectsTest extends TestCase
{
    use RefreshDatabase;

    public function test_subject_list_includes_actual_question_counts_and_zero_for_empty_subjects(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create(['level' => 2]);
        Subject::factory()->create(['level' => 3]);
        Question::factory()->count(3)->create(['subject_id' => $subject->id]);

        $this->actingAs($admin)->get(route('admin.subjects.index'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Subjects/Index')->where('subjects.total', 2)
                ->where('subjects.data.0.questions_count', 3)
                ->where('subjects.data.1.questions_count', 0));
    }

    public function test_search_and_level_filters_are_preserved_across_subject_pages(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        Subject::factory()->count(12)->sequence(fn ($sequence) => [
            'name' => 'Database '.str_pad($sequence->index, 2, '0', STR_PAD_LEFT), 'level' => 4,
        ])->create();
        Subject::factory()->create(['name' => 'Database Other Level', 'level' => 5]);
        Subject::factory()->create(['name' => 'Operating Systems', 'level' => 4]);

        $this->actingAs($instructor)->get(route('admin.subjects.index', [
            'search' => 'Database', 'level' => 4, 'page' => 2,
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('subjects.total', 12)->where('subjects.current_page', 2)
            ->has('subjects.data', 2)->where('subjects.data.0.name', 'Database 10')
            ->where('subjects.data.0.level', 4)->where('subjects.data.0.questions_count', 0)
            ->where('subjects.prev_page_url', fn ($url) => str_contains($url, 'search=Database') && str_contains($url, 'level=4')));
    }
}
