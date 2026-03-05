<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GroqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private GroqService $groqService,
    ) {}

    /**
     * Get pronunciation tips for specific words.
     *
     * POST /api/ai/tips
     * Body: { words: string[] }
     */
    public function pronunciationTips(Request $request): JsonResponse
    {
        $request->validate([
            'words' => 'required|array|min:1|max:5',
            'words.*' => 'string|max:50',
        ]);

        $tips = $this->groqService->getPronunciationTips($request->input('words'));

        if ($tips === null) {
            return response()->json([
                'message' => 'AI tips are currently unavailable.',
                'tips' => null,
            ], 503);
        }

        return response()->json($tips);
    }

    /**
     * Get a personalized recommendation based on practice history.
     *
     * POST /api/ai/recommend
     * Body: { difficulty: int, recent_scores: int[], missed_words: string[] }
     */
    public function recommend(Request $request): JsonResponse
    {
        $request->validate([
            'difficulty' => 'required|integer|min:1|max:3',
            'recent_scores' => 'required|array',
            'recent_scores.*' => 'integer|min:0|max:100',
            'missed_words' => 'array',
            'missed_words.*' => 'string|max:50',
        ]);

        $recommendation = $this->groqService->recommendNextAction(
            $request->input('difficulty'),
            $request->input('recent_scores'),
            $request->input('missed_words', [])
        );

        if ($recommendation === null) {
            return response()->json([
                'message' => 'AI recommendations are currently unavailable.',
            ], 503);
        }

        return response()->json($recommendation);
    }
}
