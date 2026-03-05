// ── Achievement definitions & tracking (localStorage) ──

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'practice' | 'score' | 'streak' | 'xp' | 'difficulty';
  requirement: number; // threshold to unlock
  unlocked: boolean;
  unlockedAt?: number; // timestamp
}

// Master list of all achievements
const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Practice milestones
  { id: 'first_try', title: 'First Steps', description: 'Complete your first attempt', emoji: '👶', category: 'practice', requirement: 1 },
  { id: 'practice_10', title: 'Getting Started', description: 'Complete 10 attempts', emoji: '📖', category: 'practice', requirement: 10 },
  { id: 'practice_25', title: 'Bookworm', description: 'Complete 25 attempts', emoji: '📚', category: 'practice', requirement: 25 },
  { id: 'practice_50', title: 'Practice Pro', description: 'Complete 50 attempts', emoji: '🎓', category: 'practice', requirement: 50 },
  { id: 'practice_100', title: 'Century Club', description: 'Complete 100 attempts', emoji: '💯', category: 'practice', requirement: 100 },

  // Score milestones
  { id: 'perfect_1', title: 'Perfect!', description: 'Get a 100% score', emoji: '⭐', category: 'score', requirement: 1 },
  { id: 'perfect_5', title: 'Star Student', description: 'Get 5 perfect scores', emoji: '🌟', category: 'score', requirement: 5 },
  { id: 'perfect_10', title: 'Superstar', description: 'Get 10 perfect scores', emoji: '💫', category: 'score', requirement: 10 },
  { id: 'perfect_25', title: 'Perfectionist', description: 'Get 25 perfect scores', emoji: '🏅', category: 'score', requirement: 25 },

  // Streak milestones
  { id: 'streak_3', title: 'On a Roll', description: 'Get a 3 streak', emoji: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak_5', title: 'Hot Streak', description: 'Get a 5 streak', emoji: '🔥', category: 'streak', requirement: 5 },
  { id: 'streak_10', title: 'Streak Master', description: 'Get a 10 streak', emoji: '🌋', category: 'streak', requirement: 10 },
  { id: 'streak_20', title: 'Unstoppable', description: 'Get a 20 streak', emoji: '⚡', category: 'streak', requirement: 20 },

  // XP milestones
  { id: 'xp_100', title: 'XP Hunter', description: 'Earn 100 XP', emoji: '💎', category: 'xp', requirement: 100 },
  { id: 'xp_500', title: 'XP Collector', description: 'Earn 500 XP', emoji: '💰', category: 'xp', requirement: 500 },
  { id: 'xp_1000', title: 'XP Master', description: 'Earn 1000 XP', emoji: '👑', category: 'xp', requirement: 1000 },
  { id: 'xp_5000', title: 'XP Legend', description: 'Earn 5000 XP', emoji: '🏆', category: 'xp', requirement: 5000 },

  // Difficulty milestones
  { id: 'medium_unlock', title: 'Growing Up', description: 'Unlock Medium difficulty', emoji: '🌿', category: 'difficulty', requirement: 1 },
  { id: 'hard_unlock', title: 'Big Kid', description: 'Unlock Hard difficulty', emoji: '🌳', category: 'difficulty', requirement: 1 },
  { id: 'hard_perfect', title: 'Jungle King', description: 'Get 100% on a Hard sentence', emoji: '🦁', category: 'difficulty', requirement: 1 },
];

const ACHIEVEMENTS_KEY = 'talkiemonkey_achievements';
const PERFECT_COUNT_KEY = 'talkiemonkey_perfect_count';
const DAILY_CHEST_KEY = 'talkiemonkey_daily_chest_date';
const STREAK_FREEZE_KEY = 'talkiemonkey_streak_freeze';

// ── Load / Save ──

export function loadAchievements(): Achievement[] {
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  const savedMap: Record<string, { unlocked: boolean; unlockedAt?: number }> = saved
    ? JSON.parse(saved)
    : {};

  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    unlocked: savedMap[def.id]?.unlocked || false,
    unlockedAt: savedMap[def.id]?.unlockedAt,
  }));
}

function saveAchievements(achievements: Achievement[]): void {
  const map: Record<string, { unlocked: boolean; unlockedAt?: number }> = {};
  achievements.forEach((a) => {
    if (a.unlocked) {
      map[a.id] = { unlocked: true, unlockedAt: a.unlockedAt };
    }
  });
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(map));
}

// ── Check & unlock achievements based on current stats ──

export interface AchievementCheckParams {
  totalAttempts: number;
  currentStreak: number;
  totalXp: number;
  lastScore: number;
  lastDifficulty: number;
  mediumUnlocked: boolean;
  hardUnlocked: boolean;
}

export function checkAchievements(params: AchievementCheckParams): {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
} {
  const achievements = loadAchievements();
  const newlyUnlocked: Achievement[] = [];

  // Update perfect count
  let perfectCount = parseInt(localStorage.getItem(PERFECT_COUNT_KEY) || '0', 10);
  if (params.lastScore === 100) {
    perfectCount++;
    localStorage.setItem(PERFECT_COUNT_KEY, perfectCount.toString());
  }

  const checks: Record<string, boolean> = {
    first_try: params.totalAttempts >= 1,
    practice_10: params.totalAttempts >= 10,
    practice_25: params.totalAttempts >= 25,
    practice_50: params.totalAttempts >= 50,
    practice_100: params.totalAttempts >= 100,
    perfect_1: perfectCount >= 1,
    perfect_5: perfectCount >= 5,
    perfect_10: perfectCount >= 10,
    perfect_25: perfectCount >= 25,
    streak_3: params.currentStreak >= 3,
    streak_5: params.currentStreak >= 5,
    streak_10: params.currentStreak >= 10,
    streak_20: params.currentStreak >= 20,
    xp_100: params.totalXp >= 100,
    xp_500: params.totalXp >= 500,
    xp_1000: params.totalXp >= 1000,
    xp_5000: params.totalXp >= 5000,
    medium_unlock: params.mediumUnlocked,
    hard_unlock: params.hardUnlocked,
    hard_perfect: params.lastDifficulty === 3 && params.lastScore === 100,
  };

  achievements.forEach((a) => {
    if (!a.unlocked && checks[a.id]) {
      a.unlocked = true;
      a.unlockedAt = Date.now();
      newlyUnlocked.push(a);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveAchievements(achievements);
  }

  return { achievements, newlyUnlocked };
}

// ── Level Unlock System ──

export interface LevelUnlockStatus {
  easy: boolean;
  medium: boolean;
  hard: boolean;
  mediumRequirement: string;
  hardRequirement: string;
}

export function getLevelUnlockStatus(xp: number, level: number, totalAttempts: number): LevelUnlockStatus {
  const mediumUnlocked = level >= 3 || totalAttempts >= 10;
  const hardUnlocked = level >= 6 || totalAttempts >= 30;

  return {
    easy: true,
    medium: mediumUnlocked,
    hard: hardUnlocked,
    mediumRequirement: mediumUnlocked ? 'Unlocked!' : `Reach Level 3 or 10 attempts (${totalAttempts}/10)`,
    hardRequirement: hardUnlocked ? 'Unlocked!' : `Reach Level 6 or 30 attempts (${totalAttempts}/30)`,
  };
}

// ── Daily Chest ──

export function canOpenDailyChest(): boolean {
  const lastDate = localStorage.getItem(DAILY_CHEST_KEY);
  return lastDate !== new Date().toDateString();
}

export function openDailyChest(): number {
  localStorage.setItem(DAILY_CHEST_KEY, new Date().toDateString());
  // Random XP reward: 10-50
  return Math.floor(Math.random() * 41) + 10;
}

// ── Streak Freeze ──

export function hasStreakFreeze(): boolean {
  return localStorage.getItem(STREAK_FREEZE_KEY) === 'true';
}

export function buyStreakFreeze(): boolean {
  // Costs 50 XP — caller should deduct
  localStorage.setItem(STREAK_FREEZE_KEY, 'true');
  return true;
}

export function useStreakFreeze(): void {
  localStorage.removeItem(STREAK_FREEZE_KEY);
}

export function getStreakFreezeCount(): number {
  return hasStreakFreeze() ? 1 : 0;
}
