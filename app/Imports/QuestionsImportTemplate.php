<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class QuestionsImportTemplate implements FromCollection, WithHeadings
{
    public function __construct(private string $locale = 'ar')
    {
    }

    public function collection(): Collection
    {
        if ($this->locale === 'en') {
            return collect([[
                'Which data structure follows FIFO?',
                'Stack', 'Queue', 'Tree', 'Graph', 'B',
            ]]);
        }

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
