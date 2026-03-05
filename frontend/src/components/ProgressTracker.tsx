import DifficultySelector from './DifficultySelector';
import { getXpForLevel } from '../services/api';

interface ProgressTrackerProps {
  attempts: number;
  bestScore: number;
  currentStreak: number;
  state: 'idle' | 'recording' | 'processing' | 'success' | 'tryAgain';
  difficulty: number;
  onDifficultyChange: (level: number) => void;
  xp: number;
  level: number;
}

/**
 * Sidebar progress tracker with stats, XP, streak, and difficulty selector.
 */
export default function ProgressTracker({
  attempts,
  bestScore,
  currentStreak,
  state,
  difficulty,
  onDifficultyChange,
  xp,
  level,
}: ProgressTrackerProps) {
  const stats = [
    { label: 'Tries', value: attempts, icon: '🎯', color: 'bg-sky-blue' },
    { label: 'Best', value: `${bestScore}%`, icon: '🏆', color: 'bg-banana-yellow' },
    { label: 'Streak', value: currentStreak, icon: '🔥', color: 'bg-sunset-pink' },
  ];

  const xpForNext = getXpForLevel(level);
  const xpInLevel = xp % xpForNext || (xp > 0 ? xpForNext : 0);
  const xpProgress = Math.min((xpInLevel / xpForNext) * 100, 100);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Logo / Title */}
      <div className="card-brutal bg-gradient-to-br from-monkey-orange to-banana-yellow p-4 text-center">
        <div className="text-3xl lg:text-4xl mb-1">🐵</div>
        <h1 className="text-lg lg:text-xl font-extrabold font-[Fredoka] text-gray-900 leading-tight">
          Talkie<br/>Monkey
        </h1>
        <span className="text-[10px] font-bold text-gray-600/70 font-[Fredoka] uppercase tracking-wider">
          v2.0
        </span>
      </div>

      {/* XP / Level mini card */}
      <div className="card-brutal-sm p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-grape-purple to-berry-pink border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center">
            <span className="text-xs font-extrabold text-white font-[Fredoka]">{level}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-[Fredoka]">Level</div>
            <div className="text-xs font-bold text-grape-purple font-[Fredoka]">{xpInLevel}/{xpForNext} XP</div>
          </div>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full border border-[#2d3436] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-grape-purple to-berry-pink transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-brutal-sm flex items-center gap-3 px-3 py-2.5"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center text-lg border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider font-[Fredoka]">
                {stat.label}
              </div>
              <div className="text-lg font-extrabold text-gray-900 font-[Fredoka] leading-tight">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="card-brutal-sm p-3 mt-auto">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              state === 'recording'
                ? 'bg-sunset-pink animate-pulse'
                : state === 'processing'
                ? 'bg-monkey-orange animate-pulse'
                : state === 'success'
                ? 'bg-jungle-green'
                : 'bg-gray-300'
            }`}
          />
          <span className="text-xs font-bold text-gray-500 font-[Fredoka] uppercase">
            {state === 'idle' && 'Ready'}
            {state === 'recording' && 'Listening...'}
            {state === 'processing' && 'Thinking...'}
            {state === 'success' && 'Nailed it!'}
            {state === 'tryAgain' && 'Review'}
          </span>
        </div>
      </div>

      {/* Difficulty selector */}
      <div className="card-brutal-sm p-3">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider font-[Fredoka] mb-2">
          Difficulty
        </div>
        <DifficultySelector current={difficulty} onChange={onDifficultyChange} />
      </div>
    </div>
  );
}
