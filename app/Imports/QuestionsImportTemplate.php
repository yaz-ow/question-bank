<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class QuestionsImportTemplate implements FromCollection, WithHeadings
{
    /**
     * The subject ID for the template.
     */
    protected $subjectId;

    /**
     * Create a new template instance.
     */
    public function __construct($subjectId)
    {
        $this->subjectId = $subjectId;
    }

    public function collection(): Collection
    {
        return collect([[
            'أي بنية بيانات تعمل وفق مبدأ FIFO؟',
            'المكدس', 'الطابور', 'الشجرة', 'الرسم البياني', 'B',
        ]]);
    }

    public function headings(): array
    {
        return [
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_answer',
        ];
    }
}
