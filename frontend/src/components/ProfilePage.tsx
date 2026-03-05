import { type UserProgress, getXpForLevel } from '../services/api';
import { type Achievement, getLevelUnlockStatus } from '../services/achievements';

interface ProfilePageProps {
  progress: UserProgress;
  achievements: Achievement[];
}

const AVATARS = ['🐵', '🐒', '🦍', '🐻', '🐼', '🦊', '🦁', '🐯', '🐸', '🦜'];

/**
 * Profile page — avatar, XP ring, badges summary, stats.
 */
export default function ProfilePage({ progress, achievements }: ProfilePageProps) {
  const xpForNext = getXpForLevel(progress.level);
  const xpInLevel = progress.xp % xpForNext || (progress.xp > 0 ? xpForNext : 0);
  const xpPercent = Math.min((xpInLevel / xpForNext) * 100, 100);

  const unlockedBadges = achievements.filter((a) => a.unlocked);
  const unlockStatus = getLevelUnlockStatus(progress.xp, progress.level, progress.totalAttempts);

  const getLevelTitle = () => {
    if (progress.level <= 2) return 'Baby Monkey';
    if (progress.level <= 5) return 'Jungle Explorer';
    if (progress.level <= 8) return 'Tree Climber';
    if (progress.level <= 12) return 'Vine Swinger';
    if (progress.level <= 16) return 'Banana Champion';
    return 'Jungle King';
  };

  // Unlock avatars based on level
  const unlockedAvatarCount = Math.min(Math.max(Math.ceil(progress.level / 2), 1), AVATARS.length);

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold font-[Fredoka] text-white drop-shadow-md">
          👤 My Profile
        </h2>
      </div>

      {/* XP Ring + Avatar */}
      <div className="card-brutal bg-gradient-to-br from-grape-purple/10 via-white to-berry-pink/10 p-6 flex flex-col items-center gap-3">
        {/* SVG Ring */}
        <div className="relative w-28 h-28 md:w-36 md:h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60" cy="60" r="52"
              fill="none" stroke="#e5e7eb" strokeWidth="10"
            />
            {/* Progress ring */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#xpGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(xpPercent / 100) * 327} 327`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6c5ce7" />
                <stop offset="100%" stopColor="#fd79a8" />
              </linearGradient>
            </defs>
          </svg>
          {/* Avatar in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl md:text-6xl">{AVATARS[0]}</span>
          </div>
          {/* Level badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-grape-purple to-berry-pink border-3 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center">
            <span className="text-sm font-extrabold text-white font-[Fredoka]">{progress.level}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mt-2">
          <h3 className="text-xl font-extrabold font-[Fredoka] text-gray-900">
            {getLevelTitle()}
          </h3>
          <p className="text-sm font-bold text-grape-purple font-[Fredoka]">
            {progress.xp} XP total • {xpInLevel}/{xpForNext} to next level
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Attempts', value: progress.totalAttempts, emoji: '📝' },
          { label: 'Best Score', value: `${progress.bestScore}%`, emoji: '🏆' },
          { label: 'Day Streak', value: progress.streak, emoji: '🔥' },
          { label: 'Badges', value: unlockedBadges.length, emoji: '🎖️' },
        ].map((stat) => (
          <div key={stat.label} className="card-brutal-sm p-3 text-center">
            <span className="text-2xl">{stat.emoji}</span>
            <div className="text-xl font-extrabold font-[Fredoka] text-gray-900">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-400 font-[Fredoka] uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Unlockable Avatars */}
      <div className="card-brutal bg-white p-4">
        <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-3">
          🐵 Unlockable Avatars
        </h3>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((avatar, i) => {
            const isUnlocked = i < unlockedAvatarCount;
            return (
              <div
                key={i}
                className={`
                  w-12 h-12 rounded-xl border-2 border-[#2d3436] flex items-center justify-center text-xl
                  transition-all duration-300
                  ${isUnlocked
                    ? 'bg-banana-light shadow-[2px_2px_0_#2d3436] hover:scale-110 cursor-pointer'
                    : 'bg-gray-100 opacity-30 grayscale'
                  }
                `}
                title={isUnlocked ? avatar : `Unlock at Level ${(i + 1) * 2}`}
              >
                {isUnlocked ? avatar : '🔒'}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] font-bold text-gray-400 font-[Fredoka] mt-2">
          Level up to unlock more avatars!
        </p>
      </div>

      {/* Level Unlock Progress */}
      <div className="card-brutal bg-white p-4">
        <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-3">
          🔓 Difficulty Unlocks
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { label: '🌱 Easy', unlocked: unlockStatus.easy, req: 'Always available' },
            { label: '🌿 Medium', unlocked: unlockStatus.medium, req: unlockStatus.mediumRequirement },
            { label: '🌳 Hard', unlocked: unlockStatus.hard, req: unlockStatus.hardRequirement },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-3">
              <span className={`text-sm font-bold font-[Fredoka] ${l.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {l.label}
              </span>
              <span className="flex-1 text-[10px] font-bold text-gray-400 font-[Fredoka] text-right">
                {l.unlocked ? '✅' : l.req}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Badges */}
      {unlockedBadges.length > 0 && (
        <div className="card-brutal bg-white p-4">
          <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider mb-3">
            🎖️ Recent Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.slice(-6).reverse().map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-banana-light border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]"
              >
                <span className="text-lg">{a.emoji}</span>
                <span className="text-xs font-extrabold font-[Fredoka] text-gray-800">
                  {a.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
