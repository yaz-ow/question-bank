<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class AdminLocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_answer_download_localizes_labels_and_direction_without_translating_saved_content(): void
    {
        $course = Subject::factory()->create(['name' => 'قواعد البيانات']);
        $student = User::factory()->create(['name' => 'طالب عربي']);
        $attempt = $student->quizAttempts()->create([
            'subject_id' => $course->id, 'question_count' => 2, 'status' => 'completed',
            'score' => 1, 'completed_at' => now(),
        ]);
        foreach ([1, 2] as $position) {
            $attempt->items()->create([
                'position' => $position, 'question_text' => '=سؤال محفوظ '.$position,
                'option_a' => '+خيار عربي', 'option_b' => 'Queue', 'option_c' => 'C', 'option_d' => '0',
                'correct_answer' => 'B', 'selected_answer' => $position === 1 ? 'B' : null,
                'is_correct' => $position === 1, 'answered_at' => now(),
            ]);
        }
        $this->actingAs(User::factory()->create(['role' => 'instructor']));

        foreach ([null, 'en', 'unsupported'] as $locale) {
            $response = $this->get(route('admin.student-results.export', [
                'subject' => $course, 'user' => $student, 'attempt' => $attempt, 'locale' => $locale,
            ]));
            $response->assertOk()->assertDownload("attempt-{$attempt->id}-answers.xlsx");
            Cell::setValueBinder(new DefaultValueBinder);
            $book = IOFactory::load($response->baseResponse->getFile()->getPathname());
            $sheet = $book->getActiveSheet();
            $english = $locale === 'en';
            $this->assertSame(! $english, $sheet->getRightToLeft());
            $this->assertSame($english ? 'Attempt answers' : 'إجابات المحاولة', $sheet->getTitle());
            $this->assertSame($english ? 'Student' : 'الطالب', $sheet->getCell('A2')->getValue());
            $this->assertSame($english ? 'Correct answer' : 'الإجابة الصحيحة', $sheet->getCell('H8')->getValue());
            $this->assertSame($english ? 'Correct' : 'صحيحة', $sheet->getCell('I9')->getValue());
            $this->assertSame($english ? 'Incorrect' : 'خاطئة', $sheet->getCell('I10')->getValue());
            $this->assertSame($english ? 'Unanswered' : 'لم يجب', $sheet->getCell('G10')->getValue());
            $this->assertSame($student->name, $sheet->getCell('B2')->getValue());
            $this->assertSame($course->name, $sheet->getCell('B3')->getValue());
            $this->assertSame('=سؤال محفوظ 1', $sheet->getCell('B9')->getValue());
            $this->assertSame(DataType::TYPE_STRING, $sheet->getCell('B9')->getDataType());
            $this->assertSame('+خيار عربي', $sheet->getCell('C9')->getValue());
            $this->assertSame('Queue', $sheet->getCell('D9')->getValue());
            $book->disconnectWorksheets();
        }
    }

    public function test_import_template_localizes_only_the_example_and_preserves_import_columns(): void
    {
        $course = Subject::factory()->create();
        $this->actingAs(User::factory()->create(['role' => 'instructor']));

        foreach ([null, 'en', 'unsupported'] as $locale) {
            $response = $this->get(route('admin.questions.download.template', [
                'subject' => $course, 'locale' => $locale,
            ]));
            $response->assertOk()->assertDownload('questions_template.xlsx');
            $book = IOFactory::load($response->baseResponse->getFile()->getPathname());
            $sheet = $book->getActiveSheet();
            $this->assertSame([
                'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer',
            ], $sheet->rangeToArray('A1:F1')[0]);
            $this->assertSame($locale === 'en' ? [
                'Which data structure follows FIFO?', 'Stack', 'Queue', 'Tree', 'Graph', 'B',
            ] : [
                'أي بنية بيانات تعمل وفق مبدأ FIFO؟', 'المكدس', 'الطابور', 'الشجرة', 'الرسم البياني', 'B',
            ], $sheet->rangeToArray('A2:F2')[0]);
            $book->disconnectWorksheets();
        }
    }
}
