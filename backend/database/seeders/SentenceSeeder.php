<?php

namespace Database\Seeders;

use App\Models\Sentence;
use Illuminate\Database\Seeder;

class SentenceSeeder extends Seeder
{
    public function run(): void
    {
        $sentences = [
            // ── Level 1: Easy (3-6 simple words) ──
            ['content' => 'The cat sat on the mat.', 'difficulty_level' => 1],
            ['content' => 'I like to eat apples and bananas.', 'difficulty_level' => 1],
            ['content' => 'The big red dog runs in the park.', 'difficulty_level' => 1],
            ['content' => 'The sun is very hot.', 'difficulty_level' => 1],
            ['content' => 'I can see a blue bird.', 'difficulty_level' => 1],
            ['content' => 'My mom and dad love me.', 'difficulty_level' => 1],
            ['content' => 'The fish swims in the water.', 'difficulty_level' => 1],
            ['content' => 'I have a big red ball.', 'difficulty_level' => 1],
            ['content' => 'The baby is very happy.', 'difficulty_level' => 1],
            ['content' => 'We play in the rain.', 'difficulty_level' => 1],
            ['content' => 'I like my green hat.', 'difficulty_level' => 1],
            ['content' => 'The duck says quack quack.', 'difficulty_level' => 1],
            ['content' => 'I see the moon at night.', 'difficulty_level' => 1],
            ['content' => 'The frog jumps on a log.', 'difficulty_level' => 1],
            ['content' => 'My dog has a long tail.', 'difficulty_level' => 1],

            // ── Level 2: Medium (6-10 words, some longer words) ──
            ['content' => 'She reads a book before going to bed.', 'difficulty_level' => 2],
            ['content' => 'The butterfly flew over the beautiful garden.', 'difficulty_level' => 2],
            ['content' => 'The children played together at the playground.', 'difficulty_level' => 2],
            ['content' => 'My favorite color is purple and yellow.', 'difficulty_level' => 2],
            ['content' => 'The little rabbit hopped across the green field.', 'difficulty_level' => 2],
            ['content' => 'We had pancakes and orange juice for breakfast.', 'difficulty_level' => 2],
            ['content' => 'The teacher told us a funny story today.', 'difficulty_level' => 2],
            ['content' => 'I want to become an astronaut one day.', 'difficulty_level' => 2],
            ['content' => 'The elephant is the biggest animal at the zoo.', 'difficulty_level' => 2],
            ['content' => 'She put on her raincoat because it was raining.', 'difficulty_level' => 2],
            ['content' => 'The kitten climbed up the tall tree.', 'difficulty_level' => 2],
            ['content' => 'We built a snowman in the backyard yesterday.', 'difficulty_level' => 2],
            ['content' => 'The stars twinkle brightly in the dark sky.', 'difficulty_level' => 2],
            ['content' => 'I counted twenty seven colorful butterflies.', 'difficulty_level' => 2],
            ['content' => 'The monkey swings from branch to branch.', 'difficulty_level' => 2],

            // ── Level 3: Hard (10+ words, complex vocabulary) ──
            ['content' => 'The adventurous explorer discovered a mysterious hidden cave.', 'difficulty_level' => 3],
            ['content' => 'The magnificent rainbow appeared after the thunderstorm ended.', 'difficulty_level' => 3],
            ['content' => 'Scientists believe that dinosaurs disappeared millions of years ago.', 'difficulty_level' => 3],
            ['content' => 'The courageous firefighter rescued the frightened kitten from the roof.', 'difficulty_level' => 3],
            ['content' => 'My grandmother knitted a beautiful sweater with extraordinary patterns.', 'difficulty_level' => 3],
            ['content' => 'The chameleon changed its color to camouflage with the environment.', 'difficulty_level' => 3],
            ['content' => 'The orchestra performed a spectacular symphony at the concert hall.', 'difficulty_level' => 3],
            ['content' => 'Photosynthesis is the process by which plants create their own food.', 'difficulty_level' => 3],
            ['content' => 'The international space station orbits around the earth every day.', 'difficulty_level' => 3],
            ['content' => 'The enthusiastic audience applauded the incredible performance.', 'difficulty_level' => 3],
            ['content' => 'The veterinarian carefully examined the injured hummingbird.', 'difficulty_level' => 3],
            ['content' => 'Archaeologists discovered ancient Egyptian treasures beneath the pyramid.', 'difficulty_level' => 3],
            ['content' => 'The extraordinary caterpillar transformed into a beautiful butterfly.', 'difficulty_level' => 3],
            ['content' => 'The temperature dropped significantly during the winter solstice.', 'difficulty_level' => 3],
            ['content' => 'The imaginative author published an encyclopedia about mythological creatures.', 'difficulty_level' => 3],
        ];

        foreach ($sentences as $sentence) {
            Sentence::updateOrCreate(
                ['content' => $sentence['content']],
                ['difficulty_level' => $sentence['difficulty_level']]
            );
        }
    }
}
