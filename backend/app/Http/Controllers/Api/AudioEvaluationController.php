<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PronunciationAttempt;
use App\Models\Sentence;
use App\Services\ComparisonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AudioEvaluationController extends Controller
{
    public function __construct(
        private ComparisonService $comparisonService
    ) {}

    /**
     * Receive audio from React, forward to Hugging Face Space for transcription,
     * compare against the target sentence, log the attempt, and return feedback.
     *
     * POST /api/evaluate-audio
     * Body: multipart/form-data { audio: File, sentence_id: int }
     */
    public function evaluate(Request $request): JsonResponse
    {
        $request->validate([
            'audio' => 'required|file|max:10240', // max 10MB
            'sentence_id' => 'required|integer|exists:sentences,id',
        ]);

        // 1. Look up the target sentence from Supabase
        $sentence = Sentence::findOrFail($request->input('sentence_id'));
        $targetText = $sentence->content;

        // 2. Forward the audio file to the Hugging Face Space
        $audioFile = $request->file('audio');

        try {
            $transcription = $this->forwardToHuggingFace($audioFile);
        } catch (\Exception $e) {
            Log::error('Hugging Face transcription error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Could not process audio. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        // 3. Run the diff / comparison algorithm
        $comparison = $this->comparisonService->compare($targetText, $transcription);

        $correctCount = collect($comparison)->where('status', 'correct')->count();
        $totalCount = count($comparison);
        $score = $totalCount > 0 ? round(($correctCount / $totalCount) * 100) : 0;

        // 4. Log the attempt in the Supabase database
        try {
            PronunciationAttempt::create([
                'sentence_id' => $sentence->id,
                'transcription' => $transcription,
                'score' => $score,
                'correct_count' => $correctCount,
                'total_count' => $totalCount,
                'comparison' => $comparison,
            ]);
        } catch (\Exception $e) {
            // Non-critical — don't fail the request if logging fails
            Log::warning('Failed to log pronunciation attempt: ' . $e->getMessage());
        }

        // 5. Return JSON feedback to the React frontend
        return response()->json([
            'transcription' => $transcription,
            'comparison' => $comparison,
            'score' => $score,
            'correct_count' => $correctCount,
            'total_count' => $totalCount,
        ]);
    }

    /**
     * Forward the audio file to the Hugging Face Space running whisper-tiny.en.
     * The HF endpoint expects multipart/form-data with key 'file'.
     * It returns JSON: { "text": "transcribed text here" }
     */
    private function forwardToHuggingFace($audioFile): string
    {
        $hfUrl = config('services.huggingface.space_url');

        if (empty($hfUrl)) {
            throw new \RuntimeException(
                'Hugging Face Space URL is not configured. Set HUGGINGFACE_SPACE_URL in .env'
            );
        }

        $endpoint = rtrim($hfUrl, '/') . '/transcribe';

        $response = Http::timeout(60) // Whisper can take a moment on CPU
            ->attach(
                'file',
                file_get_contents($audioFile->getRealPath()),
                $audioFile->getClientOriginalName() ?: 'audio.webm'
            )
            ->post($endpoint);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Hugging Face Space returned an error: ' . $response->body()
            );
        }

        $data = $response->json();

        if (!isset($data['text'])) {
            throw new \RuntimeException(
                'Unexpected response from Hugging Face Space: ' . $response->body()
            );
        }

        return trim($data['text']);
    }
}
