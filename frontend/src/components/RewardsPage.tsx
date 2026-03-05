import { useState } from 'react';
import {
  type Achievement,
  canOpenDailyChest,
  openDailyChest,
  hasStreakFreeze,
  buyStreakFreeze,
} from '../services/achievements';
import { type UserProgress, saveProgress } from '../services/api';

interface RewardsPageProps {
  achievements: Achievement[];
  progress: UserProgress;
  onProgressUpdate: (p: UserProgress) => void;
}

export default function RewardsPage({
  achievements,
  progress,
  onProgressUpdate,
}: RewardsPageProps) {
  const [chestOpen, setChestOpen] = useState(false);
  const [chestReward, setChestReward] = useState(0);
  const [showChestAnim, setShowChestAnim] = useState(false);

  const canOpen = canOpenDailyChest();
  const hasFreezeItem = hasStreakFreeze();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const handleOpenChest = () => {
    if (!canOpen) return;
    const reward = openDailyChest();
    setChestReward(reward);
    setShowChestAnim(true);
    setChestOpen(true);

    // Add XP reward
    const updated = {
      ...progress,
      xp: progress.xp + reward,
    };
    onProgressUpdate(updated);
    saveProgress(updated);

    setTimeout(() => setShowChestAnim(false), 2000);
  };

  const handleBuyFreeze = () => {
    if (progress.xp < 50 || hasFreezeItem) return;
    buyStreakFreeze();
    const updated = { ...progress, xp: progress.xp - 50 };
    onProgressUpdate(updated);
    saveProgress(updated);
  };

  const categories = [
    { key: 'practice', label: 'Practice', emoji: '📖' },
    { key: 'score', label: 'Score', emoji: '⭐' },
    { key: 'streak', label: 'Streak', emoji: '🔥' },
    { key: 'xp', label: 'XP', emoji: '💎' },
    { key: 'difficulty', label: 'Difficulty', emoji: '🌳' },
  ];

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold font-[Fredoka] text-white drop-shadow-md">
          🏆 Rewards
        </h2>
        <p className="text-sm font-bold text-white/70 font-[Fredoka]">
          {unlockedCount}/{totalCount} achievements unlocked
        </p>
      </div>

      {/* Daily Chest */}
      <div className="card-brutal bg-gradient-to-br from-banana-yellow via-monkey-orange to-banana-yellow p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenChest}
            disabled={!canOpen || chestOpen}
            className={`
              text-5xl transition-transform duration-500
              ${showChestAnim ? 'animate-bounce-word scale-125' : ''}
              ${canOpen && !chestOpen ? 'hover:scale-110 cursor-pointer' : 'opacity-60'}
            `}
          >
            {chestOpen ? '🎁' : '🎁'}
          </button>
          <div className="flex-1">
            <h3 className="text-lg font-extrabold font-[Fredoka] text-gray-900">
              Daily Reward Chest
            </h3>
            {chestOpen ? (
              <p className="text-base font-bold text-jungle-dark font-[Fredoka] animate-xp-pop">
                +{chestReward} XP earned! ✨
              </p>
            ) : canOpen ? (
              <p className="text-sm font-bold text-gray-600 font-[Fredoka]">
                Tap to open today's chest!
              </p>
            ) : (
              <p className="text-sm font-bold text-gray-500 font-[Fredoka]">
                Come back tomorrow! 🕐
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Streak Freeze */}
      <div className="card-brutal bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-blue/20 border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center">
            <span className="text-2xl">🧊</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold font-[Fredoka] text-gray-900">
              Streak Freeze
            </h3>
            <p className="text-xs font-bold text-gray-400 font-[Fredoka]">
              Protect your streak for 1 day (50 XP)
            </p>
          </div>
          {hasFreezeItem ? (
            <div className="card-brutal-sm px-3 py-2 bg-sky-blue/10">
              <span className="text-sm font-bold font-[Fredoka] text-sky-blue">✅ Active</span>
            </div>
          ) : (
            <button
              onClick={handleBuyFreeze}
              disabled={progress.xp < 50}
              className={`
                card-brutal-sm px-4 py-2 
                ${progress.xp >= 50 ? 'bg-banana-yellow hover:scale-105' : 'bg-gray-100 opacity-50'}
                transition-transform font-bold font-[Fredoka] text-sm
              `}
            >
              💎 50 XP
            </button>
          )}
        </div>
      </div>

      {/* Achievement Categories */}
      {categories.map((cat) => {
        const catAchievements = achievements.filter((a) => a.category === cat.key);
        const catUnlocked = catAchievements.filter((a) => a.unlocked).length;

        return (
          <div key={cat.key} className="card-brutal bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.emoji}</span>
              <h3 className="text-sm font-extrabold font-[Fredoka] text-gray-800 uppercase tracking-wider">
                {cat.label}
              </h3>
              <span className="text-xs font-bold text-gray-400 font-[Fredoka] ml-auto">
                {catUnlocked}/{catAchievements.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {catAchievements.map((a) => (
                <div
                  key={a.id}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-[#2d3436]
                    transition-all duration-300
                    ${
                      a.unlocked
                        ? 'bg-banana-light shadow-[3px_3px_0_#2d3436] scale-100'
                        : 'bg-gray-50 opacity-40 shadow-[2px_2px_0_#2d3436] grayscale'
                    }
                  `}
                >
                  <span className={`text-2xl ${a.unlocked ? '' : 'filter blur-[1px]'}`}>
                    {a.emoji}
                  </span>
                  <span className="text-xs font-extrabold font-[Fredoka] text-gray-800 text-center leading-tight">
                    {a.title}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 font-[Fredoka] text-center">
                    {a.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
