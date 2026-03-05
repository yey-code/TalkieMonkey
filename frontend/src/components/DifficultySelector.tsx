interface DifficultySelectorProps {
  current: number;
  onChange: (level: number) => void;
  unlockStatus?: { easy: boolean; medium: boolean; hard: boolean };
}

const levels = [
  { level: 1, emoji: '🌱', label: 'Easy', color: 'bg-jungle-green', lightColor: 'bg-jungle-light', desc: 'Short & simple', key: 'easy' as const },
  { level: 2, emoji: '🌿', label: 'Medium', color: 'bg-monkey-orange', lightColor: 'bg-monkey-light', desc: 'Getting harder', key: 'medium' as const },
  { level: 3, emoji: '🌳', label: 'Hard', color: 'bg-sunset-pink', lightColor: 'bg-sunset-light', desc: 'Big challenge', key: 'hard' as const },
];

/**
 * Interactive difficulty level selector pills.
 * Locked levels show a lock icon and can't be selected.
 */
export default function DifficultySelector({ current, onChange, unlockStatus }: DifficultySelectorProps) {
  const isUnlocked = (key: 'easy' | 'medium' | 'hard') => {
    if (!unlockStatus) return true; // default: all unlocked
    return unlockStatus[key];
  };

  return (
    <div className="flex gap-2">
      {levels.map((l) => {
        const isActive = current === l.level;
        const locked = !isUnlocked(l.key);

        return (
          <button
            key={l.level}
            onClick={() => !locked && onChange(l.level)}
            disabled={locked}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl
              border-2 border-[#2d3436]
              transition-all duration-200
              focus:outline-none
              ${locked
                ? 'bg-gray-100 opacity-40 cursor-not-allowed shadow-[1px_1px_0_#2d3436]'
                : isActive
                  ? `${l.lightColor} shadow-[3px_3px_0_#2d3436] scale-105`
                  : 'bg-gray-50 shadow-[2px_2px_0_#2d3436] opacity-60 hover:opacity-80 hover:scale-102'
              }
            `}
            title={locked ? '🔒 Locked' : l.desc}
          >
            <span className="text-xl">{locked ? '🔒' : l.emoji}</span>
            <span className={`text-[10px] font-bold font-[Fredoka] uppercase tracking-wider ${isActive && !locked ? 'text-gray-800' : 'text-gray-400'}`}>
              {l.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
