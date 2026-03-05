// ── Session history tracking (localStorage) ──

export interface SessionEntry {
  timestamp: number;
  sentenceId: number;
  sentence: string;
  score: number;
  difficulty: number;
  wordsMissed: string[];
  xpEarned: number;
  totalWords: number;
  correctWords: number;
}

const HISTORY_KEY = 'talkiemonkey_session_history';
const MAX_ENTRIES = 500; // Keep last 500 sessions

export function loadSessionHistory(): SessionEntry[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSessionEntry(entry: SessionEntry): void {
  const history = loadSessionHistory();
  history.push(entry);

  // Trim to max
  if (history.length > MAX_ENTRIES) {
    history.splice(0, history.length - MAX_ENTRIES);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// ── Analytics helpers ──

export function getWeeklyScores(): { day: string; avgScore: number; count: number }[] {
  const history = loadSessionHistory();
  const now = new Date();
  const days: { day: string; avgScore: number; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

    const daySessions = history.filter(
      (s) => new Date(s.timestamp).toDateString() === dateStr
    );

    const avgScore =
      daySessions.length > 0
        ? Math.round(daySessions.reduce((sum, s) => sum + s.score, 0) / daySessions.length)
        : 0;

    days.push({ day: dayLabel, avgScore, count: daySessions.length });
  }

  return days;
}

export function getFrequentlyMissedWords(limit = 10): { word: string; count: number }[] {
  const history = loadSessionHistory();
  const wordCounts: Record<string, number> = {};

  history.forEach((s) => {
    s.wordsMissed.forEach((w) => {
      const lower = w.toLowerCase();
      wordCounts[lower] = (wordCounts[lower] || 0) + 1;
    });
  });

  return Object.entries(wordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTotalPracticeTime(): { todayMinutes: number; weekMinutes: number } {
  const history = loadSessionHistory();
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const weekStart = now - 7 * 86400000;

  // Estimate ~30 seconds per attempt
  const todaySessions = history.filter((s) => s.timestamp >= todayStart).length;
  const weekSessions = history.filter((s) => s.timestamp >= weekStart).length;

  return {
    todayMinutes: Math.round((todaySessions * 30) / 60),
    weekMinutes: Math.round((weekSessions * 30) / 60),
  };
}

export function getImprovementTrend(): { week: string; avgScore: number }[] {
  const history = loadSessionHistory();
  if (history.length === 0) return [];

  const now = new Date();
  const weeks: { week: string; avgScore: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const label = `W${4 - i}`;
    const sessions = history.filter(
      (s) => s.timestamp >= weekStart.getTime() && s.timestamp < weekEnd.getTime()
    );

    const avg =
      sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        : 0;

    weeks.push({ week: label, avgScore: avg });
  }

  return weeks;
}

export function getDifficultyBreakdown(): { difficulty: number; count: number; avgScore: number }[] {
  const history = loadSessionHistory();
  const groups: Record<number, { total: number; scoreSum: number }> = {};

  history.forEach((s) => {
    if (!groups[s.difficulty]) groups[s.difficulty] = { total: 0, scoreSum: 0 };
    groups[s.difficulty].total++;
    groups[s.difficulty].scoreSum += s.score;
  });

  return [1, 2, 3].map((d) => ({
    difficulty: d,
    count: groups[d]?.total || 0,
    avgScore: groups[d] ? Math.round(groups[d].scoreSum / groups[d].total) : 0,
  }));
}
