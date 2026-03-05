<?php

namespace App\Services;

class ComparisonService
{
    /**
     * Compare the target sentence with the transcribed text.
     * Returns an array of word objects with status and a confidence score (0–1).
     *
     * Confidence levels:
     *   1.0      — exact positional match
     *   0.9      — exact word found at a different position
     *   0.72–0.89 — fuzzy match (Levenshtein similarity >= 80%)
     *   0.0–0.69 — no good match found → incorrect
     */
    public function compare(string $target, string $transcribed): array
    {
        $targetWords = $this->normalizeToWords($target);
        $transcribedWords = $this->normalizeToWords($transcribed);
        $originalWords = $this->getOriginalWords($target);

        $result = [];

        foreach ($targetWords as $index => $word) {
            $originalWord = $originalWords[$index] ?? $word;

            // 1. Exact positional match
            if (isset($transcribedWords[$index]) && $transcribedWords[$index] === $word) {
                $result[] = [
                    'word' => $originalWord,
                    'status' => 'correct',
                    'confidence' => 1.0,
                ];
                continue;
            }

            // 2. Exact word found at a different position
            if (in_array($word, $transcribedWords, true)) {
                $result[] = [
                    'word' => $originalWord,
                    'status' => 'correct',
                    'confidence' => 0.9,
                ];
                continue;
            }

            // 3. Fuzzy match — best Levenshtein similarity
            $bestSimilarity = 0.0;
            foreach ($transcribedWords as $tw) {
                $maxLen = max(strlen($word), strlen($tw));
                if ($maxLen === 0) {
                    continue;
                }
                $distance = levenshtein($word, $tw);
                $similarity = 1 - ($distance / $maxLen);
                $bestSimilarity = max($bestSimilarity, $similarity);
            }

            if ($bestSimilarity >= 0.8) {
                // Close enough — treat as correct but lower confidence
                $result[] = [
                    'word' => $originalWord,
                    'status' => 'correct',
                    'confidence' => round($bestSimilarity * 0.9, 2),
                ];
            } else {
                $result[] = [
                    'word' => $originalWord,
                    'status' => 'incorrect',
                    'confidence' => round($bestSimilarity, 2),
                ];
            }
        }

        return $result;
    }

    /**
     * Normalize text: lowercase, strip punctuation, split into words.
     */
    private function normalizeToWords(string $text): array
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[^\w\s]/u', '', $text);
        $text = preg_replace('/\s+/', ' ', trim($text));

        return explode(' ', $text);
    }

    /**
     * Get the original words (preserving case/punctuation) for display.
     */
    private function getOriginalWords(string $text): array
    {
        $text = preg_replace('/\s+/', ' ', trim($text));

        return explode(' ', $text);
    }
}
