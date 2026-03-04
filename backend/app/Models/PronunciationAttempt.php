<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PronunciationAttempt extends Model
{
    protected $fillable = [
        'sentence_id',
        'transcription',
        'score',
        'correct_count',
        'total_count',
        'comparison',
    ];

    protected $casts = [
        'score' => 'integer',
        'correct_count' => 'integer',
        'total_count' => 'integer',
        'comparison' => 'array',
    ];

    public function sentence(): BelongsTo
    {
        return $this->belongsTo(Sentence::class);
    }
}
