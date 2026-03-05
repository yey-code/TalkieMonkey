import { useEffect, useState } from 'react';
import { getXpForLevel } from '../services/api';

interface XpProgressBarProps {
  xp: number;
  level: number;
  xpGained?: number; // flash "+XP" when set
}

/**
 * Animated XP progress bar with level badge.
 * Shows current XP, XP needed for next level, and a "+XP" pop when gaining XP.
 */
export default function XpProgressBar({ xp, level, xpGained }: XpProgressBarProps) {
  const [showXpPop, setShowXpPop] = useState(false);
  const xpForNext = getXpForLevel(level);
  const xpInLevel = xp % xpForNext || (xp > 0 ? xpForNext : 0);
  const progress = Math.min((xpInLevel / xpForNext) * 100, 100);

  useEffect(() => {
    if (xpGained && xpGained > 0) {
      setShowXpPop(true);
      const t = setTimeout(() => setShowXpPop(false), 2000);
      return () => clearTimeout(t);
    }
  }, [xpGained, xp]);

  const getLevelTitle = () => {
    if (level <= 2) return 'Baby Monkey';
    if (level <= 5) return 'Jungle Explorer';
    if (level <= 8) return 'Tree Climber';
    if (level <= 12) return 'Vine Swinger';
    if (level <= 16) return 'Banana Champion';
    return 'Jungle King';
  };

  const getLevelEmoji = () => {
    if (level <= 2) return '🐒';
    if (level <= 5) return '🌿';
    if (level <= 8) return '🌴';
    if (level <= 12) return '🍌';
    if (level <= 16) return '👑';
    return '🏆';
  };

  return (
    <div className="card-brutal bg-white p-3 md:p-4">
      <div className="flex items-center gap-3">
        {/* Level badge */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-grape-purple to-berry-pink border-3 border-[#2d3436] shadow-[3px_3px_0_#2d3436] flex items-center justify-center">
            <span className="text-lg md:text-xl font-extrabold text-white font-[Fredoka]">
              {level}
            </span>
          </div>
          {/* Level emoji */}
          <span className="absolute -top-1 -right-1 text-sm">{getLevelEmoji()}</span>
        </div>

        {/* XP info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 font-[Fredoka] uppercase tracking-wider">
              {getLevelTitle()}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-grape-purple font-[Fredoka]">
                {xpInLevel}/{xpForNext} XP
              </span>
              {/* XP pop animation */}
              {showXpPop && xpGained && (
                <span className="text-sm font-extrabold text-jungle-green font-[Fredoka] animate-xp-pop">
                  +{xpGained}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-gray-100 rounded-full border-2 border-[#2d3436] overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-grape-purple via-berry-pink to-grape-purple transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer on bar */}
              <div className="absolute inset-0 animate-shimmer opacity-40"
                style={{
                  background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
