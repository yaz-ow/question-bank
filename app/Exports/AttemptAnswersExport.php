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
    public function __construct(private QuizAttempt $attempt) {}

    public function array(): array
    {
        $attempt = $this->attempt;
        $rows = [
            ['مراجعة إجابات الاختبار'],
            ['الطالب', $attempt->user->name, 'الرقم الجامعي', $attempt->user->university_id],
            ['المقرر', $attempt->subject->name, 'المستوى', $attempt->subject->level],
            ['رقم المحاولة', $attempt->id, 'تاريخ الاختبار', ($attempt->completed_at ?? $attempt->created_at)->timezone('Asia/Riyadh')->format('Y-m-d H:i')],
            ['عدد الأسئلة', $attempt->question_count, 'الدرجة', "{$attempt->score} / {$attempt->question_count}"],
            ['النسبة المئوية', round(100 * $attempt->score / $attempt->question_count, 1).'%'],
            [''],
            ['رقم السؤال', 'السؤال', 'A', 'B', 'C', 'D', 'إجابة الطالب', 'الإجابة الصحيحة', 'التقييم'],
        ];
        foreach ($attempt->items as $item) {
            $rows[] = [
                $item->position, $item->question_text, $item->option_a, $item->option_b,
                $item->option_c, $item->option_d, $item->selected_answer ?? 'لم يجب',
                $item->correct_answer, $item->is_correct ? 'صحيحة' : 'خاطئة',
            ];
        }

        return $rows;
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
        return 'إجابات المحاولة';
    }

    public function columnWidths(): array
    {
        return ['A' => 18, 'B' => 65, 'C' => 26, 'D' => 26, 'E' => 26, 'F' => 26, 'G' => 20, 'H' => 20, 'I' => 16];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->setRightToLeft(true);
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
