<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

/** Keep empty rows so preview errors retain the original Excel row numbers. */
class QuestionPreviewRows implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows): void
    {
        // Reading only: questions are inserted after explicit confirmation.
    }
}
