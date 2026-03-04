<?php

namespace App\Services;

class ComparisonService
{
    /**
     * Compare the target sentence with the transcribed text.
     * Returns an array of word objects with status: 'correct' or 'incorrect'.
     */
    public function compare(string $target, string $transcribed): array
    {
        $targetWords = $this->normalizeToWords($target);
        $transcribedWords = $this->normalizeToWords($transcribed);

        $result = [];

        foreach ($targetWords as $index => $word) {
            // Use the original (non-normalized) word for display
            $originalWord = $this->getOriginalWords($target)[$index] ?? $word;

            // Check if the word exists at the same position in the transcription
            $isCorrect = isset($transcribedWords[$index])
                && $transcribedWords[$index] === $word;

            // Also check if the word appears anywhere in the transcription (fuzzy positional match)
            if (!$isCorrect) {
                $isCorrect = in_array($word, $transcribedWords, true);
            }

            $result[] = [
                'word' => $originalWord,
                'status' => $isCorrect ? 'correct' : 'incorrect',
            ];
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
