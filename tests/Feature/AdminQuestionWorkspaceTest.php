<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class AdminQuestionWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function row(string $text = 'سؤال تجريبي'): array
    {
        return [$text, 'الأول', 'الثاني', 'الثالث', 'الرابع', 'B'];
    }

    private function csv(array $rows): UploadedFile
    {
        $stream = fopen('php://temp', 'r+');
        fputcsv($stream, ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']);
        foreach ($rows as $row) {
            fputcsv($stream, $row);
        }
        rewind($stream);
        $content = stream_get_contents($stream);
        fclose($stream);

        return UploadedFile::fake()->createWithContent('questions.csv', $content);
    }

    private function key(Subject $subject, User $user): string
    {
        return 'excel_import_'.$subject->id.'_'.$user->id;
    }

    public function test_preview_stays_in_workspace_and_shows_every_row_without_inserting_questions(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $rows = array_map(fn ($i) => $this->row('سؤال '.$i), range(1, 14));
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), ['file' => $this->csv($rows)])
            ->assertRedirect(route('admin.questions.index', $subject));
        $this->assertDatabaseCount('questions', 0);
        $this->get(route('admin.questions.index', $subject))->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Questions/Index')->has('importPreview.rows', 14)
            ->where('importPreview.validCount', 14)->where('importPreview.rows.13.line', 15)
            ->where('importPreview.rows.13.question_text', 'سؤال 14')->where('subject.questions_count', 0));
    }

    public function test_invalid_rows_keep_excel_line_numbers_and_block_the_entire_import(): void
    {
        $user = User::factory()->create(['role' => 'instructor']);
        $subject = Subject::factory()->create();
        $invalid = $this->row('سؤال ناقص');
        $invalid[2] = '';
        $invalid[5] = 'E';
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), [
            'file' => $this->csv([$this->row('صحيح'), ['', '', '', '', '', ''], $invalid]),
        ])->assertRedirect();
        $this->get(route('admin.questions.index', $subject))->assertInertia(fn (Assert $page) => $page
            ->where('importPreview.totalCount', 2)->where('importPreview.validCount', 1)
            ->where('importPreview.errorCount', 1)->where('importPreview.rows.1.line', 4)
            ->where('importPreview.rows.1.status', 'error')->has('importPreview.rows.1.errors', 2));
        $data = session($this->key($subject, $user));
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $data['token']])
            ->assertSessionHasErrors('import');
        $this->assertDatabaseCount('questions', 0);
    }

    public function test_confirm_imports_only_new_rows_and_consumes_the_preview(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        Question::factory()->create(['subject_id' => $subject->id, 'question_text' => 'موجود', 'option_a' => 'الأول', 'option_b' => 'الثاني', 'option_c' => 'الثالث', 'option_d' => 'الرابع', 'correct_answer' => 'B']);
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), [
            'file' => $this->csv([$this->row('جديد'), $this->row('جديد'), $this->row('موجود')]),
        ])->assertRedirect();
        $data = session($this->key($subject, $user));
        $this->assertSame(1, $data['preview']['validCount']);
        $this->assertSame(2, $data['preview']['duplicateCount']);
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $data['token']])
            ->assertRedirect(route('admin.questions.index', $subject))
            ->assertSessionHas('success', 'تم استيراد 1 سؤال بنجاح وتخطي 2 سؤال مكرر.');
        $this->assertDatabaseCount('questions', 2);
        $this->assertNull(session($this->key($subject, $user)));
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $data['token']])->assertSessionHasErrors('import');
        $this->assertDatabaseCount('questions', 2);
    }

    public function test_cancel_clears_pending_rows_and_stale_confirmation_is_rejected(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), ['file' => $this->csv([$this->row()])]);
        $token = session($this->key($subject, $user))['token'];
        $this->delete(route('admin.questions.import.cancel', $subject), ['import_token' => $token])->assertRedirect();
        $this->assertNull(session($this->key($subject, $user)));
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $token])->assertSessionHasErrors('import');
        $this->assertDatabaseCount('questions', 0);
    }

    public function test_replaced_file_requires_its_own_token_and_expired_preview_cannot_be_confirmed(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), ['file' => $this->csv([$this->row('قديم')])]);
        $oldToken = session($this->key($subject, $user))['token'];
        $this->post(route('admin.questions.upload.preview', $subject), ['file' => $this->csv([$this->row('جديد')])]);
        $newToken = session($this->key($subject, $user))['token'];
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $oldToken])->assertSessionHasErrors('import');
        $this->delete(route('admin.questions.import.cancel', $subject), ['import_token' => $oldToken])->assertSessionHasErrors('import');
        $this->assertSame($newToken, session($this->key($subject, $user))['token']);
        $this->travel(16)->minutes();
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $newToken])->assertSessionHasErrors('import');
        $this->assertNull(session($this->key($subject, $user)));
        $this->assertDatabaseCount('questions', 0);
    }

    public function test_bad_replacement_file_clears_previous_preview_and_cross_subject_confirm_is_blocked(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $other = Subject::factory()->create();
        $this->actingAs($user)->post(route('admin.questions.upload.preview', $subject), ['file' => $this->csv([$this->row()])]);
        $token = session($this->key($subject, $user))['token'];
        $this->post(route('admin.questions.import.confirm', $other), ['import_token' => $token])->assertSessionHasErrors('import');
        $this->post(route('admin.questions.upload.preview', $subject), ['file' => UploadedFile::fake()->createWithContent('bad.csv', "wrong,headers\nhello,world")])->assertSessionHasErrors('file');
        $this->assertNull(session($this->key($subject, $user)));
        $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $token])->assertSessionHasErrors('import');
        $this->assertDatabaseCount('questions', 0);
    }

    public function test_downloaded_xlsx_template_can_be_filled_previewed_and_confirmed(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $response = $this->actingAs($user)->get(route('admin.questions.download.template', $subject))->assertDownload('questions_template.xlsx');
        $workbook = IOFactory::load($response->baseResponse->getFile()->getPathname());
        $sheet = $workbook->getActiveSheet();
        for ($i = 1; $i <= 14; $i++) {
            $sheet->fromArray($this->row('سؤال Excel '.$i), null, 'A'.($i + 1));
        }
        $path = tempnam(sys_get_temp_dir(), 'questions-xlsx-');
        try {
            (new Xlsx($workbook))->save($path);
            $file = UploadedFile::fake()->createWithContent('questions.xlsx', file_get_contents($path));
            $this->post(route('admin.questions.upload.preview', $subject), ['file' => $file])->assertRedirect();
            $data = session($this->key($subject, $user));
            $this->assertCount(14, $data['preview']['rows']);
            $this->assertSame('سؤال Excel 14', $data['preview']['rows'][13]['question_text']);
            $this->post(route('admin.questions.import.confirm', $subject), ['import_token' => $data['token']])->assertRedirect();
            $this->assertDatabaseCount('questions', 14);
        } finally {
            unlink($path);
            $workbook->disconnectWorksheets();
        }
    }

    public function test_edit_and_delete_preserve_search_and_clamp_an_empty_last_page(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $subject = Subject::factory()->create();
        $questions = Question::factory()->count(7)->create(['subject_id' => $subject->id, 'question_text' => 'Searchable']);
        $data = ['question_text' => 'Searchable updated', 'option_a' => 'A', 'option_b' => 'B', 'option_c' => 'C', 'option_d' => 'D', 'correct_answer' => 'B', 'list_search' => 'Searchable', 'list_page' => 2];
        $this->actingAs($user)->put(route('admin.questions.update', [$subject, $questions->first()]), $data)
            ->assertRedirect(route('admin.questions.index', ['subject' => $subject->id, 'search' => 'Searchable', 'page' => 2]));
        $this->delete(route('admin.questions.destroy', [$subject, $questions->first()]), ['list_search' => 'Searchable', 'list_page' => 2])
            ->assertRedirect(route('admin.questions.index', ['subject' => $subject->id, 'search' => 'Searchable']));
    }
}
