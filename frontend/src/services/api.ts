const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Sentence {
  id: number;
  content: string;
  difficulty_level: number;
}

export interface WordResult {
  word: string;
  status: 'correct' | 'incorrect';
  confidence: number;
}

export interface WordTip {
  phonetic: string;
  tip: string;
}

export interface AiFeedback {
  encouragement: string;
  word_tips: Record<string, WordTip>;
  practice_suggestion: string;
  fun_fact: string;
}

export interface PronunciationResult {
  transcription: string;
  comparison: WordResult[];
  score: number;
  correct_count: number;
  total_count: number;
  ai_feedback: AiFeedback | null;
}

/**
 * Fetch a random sentence from the backend, optionally filtered by difficulty.
 */
export async function fetchRandomSentence(difficulty?: number): Promise<Sentence> {
  const params = difficulty ? `?difficulty=${difficulty}` : '';
  const response = await fetch(`${API_BASE_URL}/sentences/random${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch sentence');
  }

  return response.json();
}

/**
 * Send recorded audio to the Laravel backend for evaluation.
 */
export async function evaluateAudio(audioBlob: Blob, sentenceId: number): Promise<PronunciationResult> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('sentence_id', sentenceId.toString());

  const response = await fetch(`${API_BASE_URL}/evaluate-audio`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to evaluate audio');
  }

  return response.json();
}

/**
 * Fetch pronunciation tips for specific words from Groq AI.
 */
export interface PronunciationTipDetail {
  phonetic: string;
  rhyme: string;
  tip: string;
}

export async function fetchPronunciationTips(
  words: string[]
): Promise<{ tips: Record<string, PronunciationTipDetail> } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get AI-powered practice recommendation.
 */
export interface AiRecommendation {
  should_increase_difficulty: boolean;
  message: string;
  focus_words: string[];
  encouragement_type: 'celebrate' | 'motivate' | 'comfort';
}

export async function fetchRecommendation(
  difficulty: number,
  recentScores: number[],
  missedWords: string[]
): Promise<AiRecommendation | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        difficulty,
        recent_scores: recentScores,
        missed_words: missedWords,
      }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// ── XP helpers (client-side persistence via localStorage) ──

const XP_KEY = 'talkiemonkey_xp';
const LEVEL_KEY = 'talkiemonkey_level';
const STREAK_KEY = 'talkiemonkey_streak';
const STREAK_DATE_KEY = 'talkiemonkey_streak_date';
const BEST_SCORE_KEY = 'talkiemonkey_best_score';
const TOTAL_ATTEMPTS_KEY = 'talkiemonkey_total_attempts';

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  bestScore: number;
  totalAttempts: number;
}

export function getXpForLevel(level: number): number {
  return level * 100; // 100 XP per level
}

export function calculateXpGain(score: number, wordCount: number): number {
  const baseXp = Math.round((score / 100) * wordCount * 5);
  const perfectBonus = score === 100 ? 20 : 0;
  const goodBonus = score >= 80 ? 10 : 0;
  return baseXp + perfectBonus + goodBonus;
}

export function loadProgress(): UserProgress {
  return {
    xp: parseInt(localStorage.getItem(XP_KEY) || '0', 10),
    level: parseInt(localStorage.getItem(LEVEL_KEY) || '1', 10),
    streak: parseInt(localStorage.getItem(STREAK_KEY) || '0', 10),
    bestScore: parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10),
    totalAttempts: parseInt(localStorage.getItem(TOTAL_ATTEMPTS_KEY) || '0', 10),
  };
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(XP_KEY, progress.xp.toString());
  localStorage.setItem(LEVEL_KEY, progress.level.toString());
  localStorage.setItem(STREAK_KEY, progress.streak.toString());
  localStorage.setItem(BEST_SCORE_KEY, progress.bestScore.toString());
  localStorage.setItem(TOTAL_ATTEMPTS_KEY, progress.totalAttempts.toString());
}

export function updateStreak(): number {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(STREAK_DATE_KEY);

  if (lastDate === today) {
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let streak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

  if (lastDate === yesterday) {
    streak += 1;
  } else {
    streak = 1; // Reset
  }

  localStorage.setItem(STREAK_KEY, streak.toString());
  localStorage.setItem(STREAK_DATE_KEY, today);
  return streak;
}
