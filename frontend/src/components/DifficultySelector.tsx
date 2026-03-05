interface DifficultySelectorProps {
  current: number;
  onChange: (level: number) => void;
}

const levels = [
  { level: 1, emoji: '🌱', label: 'Easy', color: 'bg-jungle-green', lightColor: 'bg-jungle-light', desc: 'Short & simple' },
  { level: 2, emoji: '🌿', label: 'Medium', color: 'bg-monkey-orange', lightColor: 'bg-monkey-light', desc: 'Getting harder' },
  { level: 3, emoji: '🌳', label: 'Hard', color: 'bg-sunset-pink', lightColor: 'bg-sunset-light', desc: 'Big challenge' },
];

/**
 * Interactive difficulty level selector pills.
 * Each pill is tappable and shows the current active difficulty.
 */
export default function DifficultySelector({ current, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex gap-2">
      {levels.map((l) => {
        const isActive = current === l.level;
        return (
          <button
            key={l.level}
            onClick={() => onChange(l.level)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl
              border-2 border-[#2d3436]
              transition-all duration-200
              focus:outline-none
              ${
                isActive
                  ? `${l.lightColor} shadow-[3px_3px_0_#2d3436] scale-105`
                  : 'bg-gray-50 shadow-[2px_2px_0_#2d3436] opacity-60 hover:opacity-80 hover:scale-102'
              }
            `}
            title={l.desc}
          >
            <span className="text-xl">{l.emoji}</span>
            <span className={`text-[10px] font-bold font-[Fredoka] uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
              {l.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
