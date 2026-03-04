<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sentence extends Model
{
    protected $fillable = ['content', 'difficulty_level'];

    protected $casts = [
        'difficulty_level' => 'integer',
    ];
}
