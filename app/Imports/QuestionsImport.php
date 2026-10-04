<?php

namespace App\Imports;

use App\Models\Question;
use App\Models\Subject;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;

class QuestionsImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows
{
    use Importable;

    /**
     * The subject ID to associate imported questions with.
     */
    protected $subjectId;

    /**
     * Create a new import instance.
     */
    public function __construct($subjectId)
    {
        $this->subjectId = $subjectId;
    }

    /**
     * @param array $row
     *
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Normalize the answer letter to uppercase
        $correctAnswer = strtoupper(trim($row['correct_answer']));

        return new Question([
            'subject_id' => $this->subjectId,
            'question_text' => trim($row['question_text']),
            'option_a' => trim($row['option_a']),
            'option_b' => trim($row['option_b']),
            'option_c' => trim($row['option_c']),
            'option_d' => trim($row['option_d']),
            'correct_answer' => $correctAnswer,
        ]);
    }

    /**
     * Validation rules for the import.
     */
    public function rules(): array
    {
        return [
            '*.question_text' => ['required', 'string'],
            '*.option_a' => ['required', 'string', 'max:255'],
            '*.option_b' => ['required', 'string', 'max:255'],
            '*.option_c' => ['required', 'string', 'max:255'],
            '*.option_d' => ['required', 'string', 'max:255'],
            '*.correct_answer' => ['required', 'string', 'in:A,B,C,D'],
        ];
    }

    /**
     * Custom validation attributes for better error messages.
     */
    public function customValidationAttributes(): array
    {
        return [
            'question_text' => 'نص السؤال',
            'option_a' => 'الخيار أ',
            'option_b' => 'الخيار ب',
            'option_c' => 'الخيار ج',
            'option_d' => 'الخيار د',
            'correct_answer' => 'الإجابة الصحيحة',
        ];
    }
}