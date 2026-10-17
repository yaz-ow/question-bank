<?php

namespace App\Exports;

use App\Models\QuizAttempt;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttemptAnswersExport extends DefaultValueBinder implements FromArray, WithColumnWidths, WithCustomValueBinder, WithStrictNullComparison, WithStyles, WithTitle
{
    public function __construct(private QuizAttempt $attempt, private string $locale = 'ar') {}

    public function array(): array
    {
        $attempt = $this->attempt;
        $rows = [
            [$this->label('مراجعة إجابات الاختبار')],
            [$this->label('الطالب'), $attempt->user->name, $this->label('الرقم الجامعي'), $attempt->user->university_id],
            [$this->label('المقرر'), $attempt->subject->name, $this->label('المستوى'), $attempt->subject->level],
            [$this->label('رقم المحاولة'), $attempt->id, $this->label('تاريخ الاختبار'), ($attempt->completed_at ?? $attempt->created_at)->timezone('Asia/Riyadh')->format('Y-m-d H:i')],
            [$this->label('عدد الأسئلة'), $attempt->question_count, $this->label('الدرجة'), "{$attempt->score} / {$attempt->question_count}"],
            [$this->label('النسبة المئوية'), round(100 * $attempt->score / $attempt->question_count, 1).'%'],
            [''],
            [$this->label('رقم السؤال'), $this->label('السؤال'), 'A', 'B', 'C', 'D', $this->label('إجابة الطالب'), $this->label('الإجابة الصحيحة'), $this->label('التقييم')],
        ];
        foreach ($attempt->items as $item) {
            $rows[] = [
                $item->position, $item->question_text, $item->option_a, $item->option_b,
                $item->option_c, $item->option_d, $item->selected_answer ?? $this->label('لم يجب'),
                $item->correct_answer, $item->is_correct ? $this->label('صحيحة') : $this->label('خاطئة'),
            ];
        }

        return $rows;
    }

    private function label(string $arabic): string
    {
        if ($this->locale !== 'en') {
            return $arabic;
        }

        return [
            'مراجعة إجابات الاختبار' => 'Quiz answer review',
            'الطالب' => 'Student',
            'الرقم الجامعي' => 'University ID',
            'المقرر' => 'Course',
            'المستوى' => 'Level',
            'رقم المحاولة' => 'Attempt ID',
            'تاريخ الاختبار' => 'Quiz date',
            'عدد الأسئلة' => 'Question count',
            'الدرجة' => 'Score',
            'النسبة المئوية' => 'Percentage',
            'رقم السؤال' => 'Question number',
            'السؤال' => 'Question',
            'إجابة الطالب' => 'Student answer',
            'الإجابة الصحيحة' => 'Correct answer',
            'التقييم' => 'Result',
            'لم يجب' => 'Unanswered',
            'صحيحة' => 'Correct',
            'خاطئة' => 'Incorrect',
            'إجابات المحاولة' => 'Attempt answers',
        ][$arabic] ?? $arabic;
    }

    public function bindValue(Cell $cell, $value): bool
    {
        // Student names and question snapshots are text, including leading '=' or '+'.
        if (is_string($value)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);

            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function title(): string
    {
        return $this->label('إجابات المحاولة');
    }

    public function columnWidths(): array
    {
        return ['A' => 18, 'B' => 65, 'C' => 26, 'D' => 26, 'E' => 26, 'F' => 26, 'G' => 20, 'H' => 20, 'I' => 16];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->setRightToLeft($this->locale !== 'en');
        $sheet->mergeCells('A1:I1');
        $sheet->freezePane('C9');
        $sheet->setAutoFilter('A8:I'.$sheet->getHighestRow());
        $sheet->getStyle('A1:I'.$sheet->getHighestRow())->getAlignment()->setWrapText(true)->setVertical('center');
        $sheet->getDefaultRowDimension()->setRowHeight(-1);
        $sheet->getRowDimension(1)->setRowHeight(36);
        $sheet->getStyle('A9:I'.$sheet->getHighestRow())->getFont()->setSize(12);

        return [
            1 => ['font' => ['bold' => true, 'size' => 18, 'color' => ['rgb' => '082D4E']]],
            8 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '082D4E']]],
        ];
    }
}
