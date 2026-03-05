interface BottomNavProps {
  attempts: number;
  bestScore: number;
  streak: number;
  xp: number;
  level: number;
  onDifficultyTap: () => void;
}

/**
 * Mobile-only bottom navigation bar with quick stats.
 * Fixed at bottom, hidden on desktop. Glass morphism + neo-brutalism hybrid.
 */
export default function BottomNav({
  attempts,
  bestScore,
  streak,
  xp,
  level,
  onDifficultyTap,
}: BottomNavProps) {
  const stats = [
    { icon: '🎯', val: attempts, label: 'Tries' },
    { icon: '🏆', val: `${bestScore}%`, label: 'Best' },
    { icon: '🔥', val: streak, label: 'Streak' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-2 mb-2 rounded-2xl border-2 border-[#2d3436] bg-white/95 backdrop-blur-md shadow-[4px_-2px_0_#2d3436] px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Level badge */}
          <button
            onClick={onDifficultyTap}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-grape-purple to-berry-pink border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]"
          >
            <span className="text-sm font-extrabold text-white font-[Fredoka]">Lv.{level}</span>
            <span className="text-xs font-bold text-white/80 font-[Fredoka]">{xp} XP</span>
          </button>

          {/* Quick stats */}
          <div className="flex gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-extrabold text-gray-800 font-[Fredoka]">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
