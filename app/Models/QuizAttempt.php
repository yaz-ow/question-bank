<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizAttempt extends Model
{
    public const QUESTION_COUNTS = [10, 20, 30];

    protected $fillable = [
        'subject_id', 'question_count', 'current_position', 'status',
        'score', 'completed_at', 'abandoned_at',
    ];

    protected function casts(): array
    {
        return [
            'question_count' => 'integer',
            'current_position' => 'integer',
            'score' => 'integer',
            'completed_at' => 'datetime',
            'abandoned_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuizItem::class)->orderBy('position');
    }
}
