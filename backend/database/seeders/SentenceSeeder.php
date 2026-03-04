<?php

namespace Database\Seeders;

use App\Models\Sentence;
use Illuminate\Database\Seeder;

class SentenceSeeder extends Seeder
{
    public function run(): void
    {
        $sentences = [
            ['content' => 'The cat sat on the mat.', 'difficulty_level' => 1],
            ['content' => 'I like to eat apples and bananas.', 'difficulty_level' => 1],
            ['content' => 'The big red dog runs in the park.', 'difficulty_level' => 1],
            ['content' => 'She reads a book before going to bed.', 'difficulty_level' => 2],
            ['content' => 'The butterfly flew over the beautiful garden.', 'difficulty_level' => 2],
        ];

        foreach ($sentences as $sentence) {
            Sentence::create($sentence);
        }
    }
}
