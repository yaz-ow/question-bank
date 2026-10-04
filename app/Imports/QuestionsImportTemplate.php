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

    /**
     * @return Collection
     */
    public function collection(): Collection
    {
        // Return an empty collection since this is just a template
        return collect([]);
    }

    /**
     * @return array
     */
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