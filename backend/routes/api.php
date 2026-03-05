<?php

use App\Http\Controllers\Api\AudioEvaluationController;
use App\Http\Controllers\Api\SentenceController;
use Illuminate\Support\Facades\Route;

// Sentence routes
Route::get('/sentences', [SentenceController::class, 'index']);
Route::get('/sentences/random', [SentenceController::class, 'random']);

// Audio evaluation — forwards to Hugging Face Space for transcription
Route::post('/evaluate-audio', [AudioEvaluationController::class, 'evaluate']);
