<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\Questions\QuestionController;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Tests\TestCase;

class Phase4QuestionTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_manage_questions()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.questions.index', ['subject' => $subject->id]))
            ->assertOk()
            ->assertInertia(function ($page) use ($subject) {
                $page->component('Admin/Questions/Index')
                    ->where('subject.id', $subject->id);
            });
    }

    /** @test */
    public function instructor_can_manage_questions()
    {
        $instructor = User::factory()->create([
            'role' => 'instructor',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($instructor)
            ->get(route('admin.questions.index', ['subject' => $subject->id]))
            ->assertOk()
            ->assertInertia(function ($page) use ($subject) {
                $page->component('Admin/Questions/Index')
                    ->where('subject.id', $subject->id);
            });
    }

    /** @test */
    public function student_cannot_manage_questions()
    {
        $student = User::factory()->create([
            'role' => 'student',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($student)
            ->get(route('admin.questions.index', ['subject' => $subject->id]))
            ->assertRedirect()
            ->assertSessionHas('error', 'غير مسموح لك بالوصول إلى هذه الصفحة');
    }

    /** @test */
    public function guest_cannot_manage_questions()
    {
        $subject = Subject::factory()->create();

        $this->get(route('admin.questions.index', ['subject' => $subject->id]))
            ->assertRedirect('/login/admin');
    }

    /** @test */
    public function inactive_user_cannot_manage_questions()
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => false
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.questions.index', ['subject' => $subject->id]))
            ->assertRedirect('/')
            ->assertSessionHas('error', 'حسابك غير نشط أو تم تعطيله');
    }

    /** @test */
    public function admin_can_create_question()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.questions.store', ['subject' => $subject->id]), [
                'question_text' => 'ما هو لون السماء؟',
                'option_a' => 'أزرق',
                'option_b' => 'أخضر',
                'option_c' => 'أحمر',
                'option_d' => 'أصفر',
                'correct_answer' => 'A'
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'تم إنشاء السؤال بنجاح');

        $this->assertDatabaseHas('questions', [
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);
    }

    /** @test */
    public function admin_cannot_create_question_with_invalid_input()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.questions.store', ['subject' => $subject->id]), [
                'question_text' => '', // Empty question text
                'option_a' => '', // Empty option A
                'option_b' => '', // Empty option B
                'option_c' => '', // Empty option C
                'option_d' => '', // Empty option D
                'correct_answer' => 'E' // Invalid answer
            ])
            ->assertInvalid([
                'question_text' => 'نص السؤال مطلوب',
                'option_a' => 'الخيار أ مطلوب',
                'option_b' => 'الخيار ب مطلوب',
                'option_c' => 'الخيار ج مطلوب',
                'option_d' => 'الخيار د مطلوب',
                'correct_answer' => 'الإجابة الصحيحة يجب أن تكون أ، ب، ج، أو د',
            ]);
    }

    /** @test */
    public function admin_cannot_access_question_from_another_subject()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        // Create two subjects
        $subject1 = Subject::factory()->create();
        $subject2 = Subject::factory()->create();

        // Create a question for subject1
        $question = Question::factory()->create([
            'subject_id' => $subject1->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        // Try to access the question from subject2's context (should 404)
        $this->actingAs($admin)
            ->get(route('admin.questions.show', ['subject' => $subject2->id, 'question' => $question->id]))
            ->assertNotFound();

        // Try to edit the question from subject2's context (should 404)
        $this->actingAs($admin)
            ->get(route('admin.questions.edit', ['subject' => $subject2->id, 'question' => $question->id]))
            ->assertNotFound();

        // Try to update the question from subject2's context (should 404)
        $this->actingAs($admin)
            ->put(route('admin.questions.update', ['subject' => $subject2->id, 'question' => $question->id]), [
                'question_text' => 'ما هو لون العشب؟',
                'option_a' => 'أخضر',
                'option_b' => 'أزرق',
                'option_c' => 'أحمر',
                'option_d' => 'أصفر',
                'correct_answer' => 'B'
            ])
            ->assertNotFound();

        // Try to delete the question from subject2's context (should 404)
        $this->actingAs($admin)
            ->delete(route('admin.questions.destroy', ['subject' => $subject2->id, 'question' => $question->id]))
            ->assertNotFound();

        // Verify the question still exists in the database
        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'subject_id' => $subject1->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);
    }

    /** @test */
    public function admin_can_update_question()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();
        $question = Question::factory()->create([
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        $this->actingAs($admin)
            ->put(route('admin.questions.update', [
                'subject' => $subject->id,
                'question' => $question->id
            ]), [
                'question_text' => 'ما هو لون العشب؟',
                'option_a' => 'أخضر',
                'option_b' => 'أزرق',
                'option_c' => 'أحمر',
                'option_d' => 'أصفر',
                'correct_answer' => 'B'
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'تم تحديث السؤال بنجاح');

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'question_text' => 'ما هو لون العشب؟',
            'option_a' => 'أخضر',
            'option_b' => 'أزرق',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'B'
        ]);
    }

    /** @test */
    public function admin_can_delete_question()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();
        $question = Question::factory()->create([
            'subject_id' => $subject->id
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.questions.destroy', [
                'subject' => $subject->id,
                'question' => $question->id
            ]))
            ->assertRedirect()
            ->assertSessionHas('success', 'تم حذف السؤال بنجاح');

        $this->assertDatabaseMissing('questions', [
            'id' => $question->id
        ]);
    }

    /** @test */
    public function admin_can_download_excel_template()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        $response = $this->actingAs($admin)
            ->get(route('admin.questions.download.template', ['subject' => $subject->id]))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            ->assertHeader('Content-Disposition', 'attachment; filename=questions_template.xlsx');

        $response->assertDownload('questions_template.xlsx');
        $file = $response->baseResponse->getFile();
        $this->assertGreaterThan(0, $file->getSize());
    }

    /** @test */
    public function admin_can_preview_excel_import()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        // Create CSV content for testing with valid data
        $data = [
            [
                'question_text' => 'ما هو لون السماء؟',
                'option_a' => 'أزرق',
                'option_b' => 'أخضر',
                'option_c' => 'أحمر',
                'option_d' => 'أصفر',
                'correct_answer' => 'A'
            ],
            [
                'question_text' => 'ما هو عدد كواكب المجموعة الشمسية؟',
                'option_a' => 'سبعة',
                'option_b' => 'ثمانية',
                'option_c' => 'تسعة',
                'option_d' => 'عشرة',
                'correct_answer' => 'B'
            ]
        ];

        $csvContent = implode("\n", array_map(fn($row) => implode(',', $row), [
            ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'],
            ['ما هو لون السماء؟', 'أزرق', 'أخضر', 'أحمر', 'أصفر', 'A'],
            ['ما هو عدد كواكب المجموعة الشمسية؟', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'B']
        ]));

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent, 'text/csv');

        $this->actingAs($admin)
            ->post(route('admin.questions.upload.preview', ['subject' => $subject->id]), [
                'file' => $file
            ])
            ->assertRedirect(route('admin.questions.index', $subject->id));

        $this->get(route('admin.questions.index', $subject->id))->assertInertia(function ($page) use ($subject) {
            $page->component('Admin/Questions/Index')
                ->where('subject.id', $subject->id);
        });
    }

    /** @test */
    public function admin_can_import_questions_from_excel()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        // Create CSV content for testing with valid data
        $data = [
            [
                'question_text' => 'ما هو لون السماء؟',
                'option_a' => 'أزرق',
                'option_b' => 'أخضر',
                'option_c' => 'أحمر',
                'option_d' => 'أصفر',
                'correct_answer' => 'A'
            ],
            [
                'question_text' => 'ما هو عدد كواكب المجموعة الشمسية؟',
                'option_a' => 'سبعة',
                'option_b' => 'ثمانية',
                'option_c' => 'تسعة',
                'option_d' => 'عشرة',
                'correct_answer' => 'B'
            ]
        ];

        $csvContent = implode("\n", array_map(fn($row) => implode(',', $row), [
            ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'],
            ['ما هو لون السماء؟', 'أزرق', 'أخضر', 'أحمر', 'أصفر', 'A'],
            ['ما هو عدد كواكب المجموعة الشمسية؟', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'B']
        ]));

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent, 'text/csv');

        $this->actingAs($admin)
            ->post(route('admin.questions.upload.preview', ['subject' => $subject->id]), [
                'file' => $file
            ])
            ->assertRedirect();

        // Now confirm the import
        $this->actingAs($admin)
            ->post(route('admin.questions.import.confirm', ['subject' => $subject->id]), [
                'import_token' => session('excel_import_'.$subject->id.'_'.$admin->id)['token'],
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'تم استيراد 2 سؤال بنجاح وتخطي 0 سؤال مكرر.');

        // Verify the questions were actually created in the database
        $this->assertDatabaseHas('questions', [
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        $this->assertDatabaseHas('questions', [
            'subject_id' => $subject->id,
            'question_text' => 'ما هو عدد كواكب المجموعة الشمسية؟',
            'option_a' => 'سبعة',
            'option_b' => 'ثمانية',
            'option_c' => 'تسعة',
            'option_d' => 'عشرة',
            'correct_answer' => 'B'
        ]);
    }

    /** @test */
    public function question_count_updates_in_subject_show()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true
        ]);

        $subject = Subject::factory()->create();

        // Initially no questions
        $this->actingAs($admin)
            ->get(route('admin.subjects.show', ['subject' => $subject->id]))
            ->assertOk()
            ->assertInertia(function ($page) use ($subject) {
                $page->component('Admin/Subjects/Show')
                    ->where('subject.id', $subject->id)
                    ->etc(['question_count' => 0]); // Assuming we added question count
            });

        // Create a question
        Question::factory()->create([
            'subject_id' => $subject->id,
            'question_text' => 'ما هو لون السماء؟',
            'option_a' => 'أزرق',
            'option_b' => 'أخضر',
            'option_c' => 'أحمر',
            'option_d' => 'أصفر',
            'correct_answer' => 'A'
        ]);

        // Check that question count increased
        $this->actingAs($admin)
            ->get(route('admin.subjects.show', ['subject' => $subject->id]))
            ->assertOk()
            ->assertInertia(function ($page) use ($subject) {
                $page->component('Admin/Subjects/Show')
                    ->where('subject.id', $subject->id)
                    ->etc(['question_count' => 1]);
            });
    }
}