const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Sentence {
  id: number;
  content: string;
  difficulty_level: number;
}

export interface WordResult {
  word: string;
  status: 'correct' | 'incorrect';
}

export interface PronunciationResult {
  transcription: string;
  comparison: WordResult[];
  score: number;
  correct_count: number;
  total_count: number;
}

/**
 * Fetch a random sentence from the backend.
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
 * Laravel forwards the audio to the Hugging Face Space for transcription,
 * then compares against the target sentence and returns scored feedback.
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
