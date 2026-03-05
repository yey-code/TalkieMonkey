<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://api.groq.com/openai/v1';

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key', '');
        $this->model = config('services.groq.model', 'llama-3.3-70b-versatile');
    }

    /**
     * Generate kid-friendly pronunciation feedback using Groq LLM.
     */
    public function generateFeedback(
        string $targetSentence,
        string $transcription,
        array $comparison,
        int $score
    ): ?array {
        if (empty($this->apiKey)) {
            Log::warning('Groq API key not configured — skipping AI feedback');
            return null;
        }

        $incorrectWords = collect($comparison)
            ->where('status', 'incorrect')
            ->pluck('word')
            ->toArray();

        $correctWords = collect($comparison)
            ->where('status', 'correct')
            ->pluck('word')
            ->toArray();

        $prompt = $this->buildFeedbackPrompt(
            $targetSentence,
            $transcription,
            $incorrectWords,
            $correctWords,
            $score
        );

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(15)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $this->getSystemPrompt()],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->failed()) {
                Log::error('Groq feedback error: ' . $response->body());
                return null;
            }

            $content = $response->json('choices.0.message.content');
            return json_decode($content, true);
        } catch (\Exception $e) {
            Log::error('Groq feedback exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get detailed pronunciation tips for specific words.
     */
    public function getPronunciationTips(array $words): ?array
    {
        if (empty($this->apiKey) || empty($words)) {
            return null;
        }

        $wordList = implode(', ', array_slice($words, 0, 5));

        $prompt = <<<PROMPT
Give pronunciation tips for these English words that a child (age 4-8) is struggling with: {$wordList}

For each word, provide:
1. A simple phonetic breakdown using kid-friendly sounds (NOT IPA symbols — use simple syllables like "buh-ter-fly")
2. A fun rhyming word or short phrase to help remember
3. A short tip (1 sentence max, fun and encouraging)

Return JSON:
{
  "tips": {
    "word_here": {
      "phonetic": "simple sound breakdown",
      "rhyme": "a fun rhyming helper",
      "tip": "a short encouraging tip"
    }
  }
}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(10)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a friendly pronunciation coach for young children (ages 4-8). Always respond in valid JSON. Use simple words and fun emojis.',
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.6,
                'max_tokens' => 400,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->failed()) {
                Log::error('Groq tips error: ' . $response->body());
                return null;
            }

            $content = $response->json('choices.0.message.content');
            return json_decode($content, true);
        } catch (\Exception $e) {
            Log::error('Groq tips exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Recommend the next best sentence/difficulty for the child based on history.
     */
    public function recommendNextAction(
        int $currentDifficulty,
        array $recentScores,
        array $frequentlyMissedWords
    ): ?array {
        if (empty($this->apiKey)) {
            return null;
        }

        $scoresStr = implode(', ', array_slice($recentScores, -10));
        $missedStr = !empty($frequentlyMissedWords)
            ? implode(', ', array_slice($frequentlyMissedWords, 0, 8))
            : 'none';

        $prompt = <<<PROMPT
A child (age 4-8) is practicing English pronunciation.

Current difficulty: {$currentDifficulty}/3
Recent scores (last 10): [{$scoresStr}]
Words they often miss: {$missedStr}

Based on this data, give a recommendation as JSON:
{
  "should_increase_difficulty": true/false,
  "message": "A short encouraging message about their progress (1-2 sentences, use emojis)",
  "focus_words": ["up to 3 words they should practice more"],
  "encouragement_type": "celebrate" or "motivate" or "comfort"
}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(10)->post("{$this->baseUrl}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are Talkie Monkey 🐵, a fun pronunciation coach for kids. Always respond in valid JSON. Be encouraging and positive!',
                    ],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 300,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->failed()) return null;

            $content = $response->json('choices.0.message.content');
            return json_decode($content, true);
        } catch (\Exception $e) {
            Log::error('Groq recommendation exception: ' . $e->getMessage());
            return null;
        }
    }

    private function getSystemPrompt(): string
    {
        return <<<PROMPT
You are Talkie Monkey 🐵, a fun and encouraging pronunciation coach for young children (ages 4-8).
Your job is to give feedback on their English pronunciation practice.

Rules:
- Be VERY encouraging and positive, even when they make mistakes
- Use simple words a 5-year-old can understand
- Include fun emojis
- Keep tips SHORT (1-2 sentences max)
- For pronunciation tips, use simple sound-it-out style (NOT IPA symbols)
- Always respond in valid JSON format
PROMPT;
    }

    private function buildFeedbackPrompt(
        string $target,
        string $transcription,
        array $incorrectWords,
        array $correctWords,
        int $score
    ): string {
        $incorrect = !empty($incorrectWords) ? implode(', ', $incorrectWords) : 'none';
        $correct = !empty($correctWords) ? implode(', ', $correctWords) : 'none';

        return <<<PROMPT
A child just practiced saying this sentence:
Target: "{$target}"
What they said: "{$transcription}"
Score: {$score}%
Words they got right: {$correct}
Words they missed: {$incorrect}

Give feedback as JSON with this exact structure:
{
  "encouragement": "A fun, encouraging message for the child (1-2 sentences, use emojis)",
  "word_tips": {
    "missed_word_here": {
      "phonetic": "simple sound-it-out (e.g., 'buh-ter-fly')",
      "tip": "A short fun tip to help pronounce this word"
    }
  },
  "practice_suggestion": "What they should try next (1 sentence)",
  "fun_fact": "An optional fun fact related to a word in the sentence (1 sentence, kid-friendly)"
}

Only include word_tips for the words they missed. If they got 100%, make word_tips an empty object and celebrate!
PROMPT;
    }
}
