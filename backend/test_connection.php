<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $count = \App\Models\Sentence::count();
    echo "✅ Connected to Supabase! Sentences in DB: $count\n";
    
    if ($count > 0) {
        $sentences = \App\Models\Sentence::all();
        foreach ($sentences as $s) {
            echo "  [{$s->id}] (Level {$s->difficulty_level}) {$s->content}\n";
        }
    } else {
        echo "⚠️  No sentences found. Did you run the SQL in Supabase SQL Editor?\n";
    }
} catch (Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
}
