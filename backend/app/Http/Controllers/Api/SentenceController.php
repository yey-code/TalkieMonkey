<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sentence;
use Illuminate\Http\JsonResponse;

class SentenceController extends Controller
{
    /**
     * Get a random sentence, optionally filtered by difficulty level.
     */
    public function random(): JsonResponse
    {
        $query = Sentence::query();

        if (request()->has('difficulty')) {
            $query->where('difficulty_level', request('difficulty'));
        }

        $sentence = $query->inRandomOrder()->first();

        if (!$sentence) {
            return response()->json(['message' => 'No sentences found.'], 404);
        }

        return response()->json([
            'id' => $sentence->id,
            'content' => $sentence->content,
            'difficulty_level' => $sentence->difficulty_level,
        ]);
    }

    /**
     * Get all sentences.
     */
    public function index(): JsonResponse
    {
        $sentences = Sentence::all(['id', 'content', 'difficulty_level']);

        return response()->json($sentences);
    }
}
