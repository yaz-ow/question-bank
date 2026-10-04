<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizItem extends Model
{
    protected $fillable = [
        'question_id', 'position', 'question_text', 'option_a', 'option_b',
        'option_c', 'option_d', 'correct_answer', 'selected_answer',
        'is_correct', 'answered_at',
    ];

    protected $hidden = ['correct_answer', 'is_correct'];

    protected function casts(): array
    {
        return ['position' => 'integer', 'is_correct' => 'boolean', 'answered_at' => 'datetime'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }
}
