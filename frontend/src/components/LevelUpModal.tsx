import { useEffect, useState } from 'react';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

/**
 * Celebratory level-up modal with big animation.
 * Auto-closes after 3 seconds or on tap.
 */
export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const getLevelTitle = () => {
    if (level <= 2) return 'Baby Monkey';
    if (level <= 5) return 'Jungle Explorer';
    if (level <= 8) return 'Tree Climber';
    if (level <= 12) return 'Vine Swinger';
    if (level <= 16) return 'Banana Champion';
    return 'Jungle King';
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 400);
      }}
    >
      <div
        className={`card-brutal bg-gradient-to-br from-banana-yellow via-monkey-orange to-banana-yellow p-8 text-center max-w-sm mx-4 transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Big celebration emoji */}
        <div className="text-7xl mb-3 animate-bounce-word">🎉</div>

        <h2 className="text-2xl font-extrabold font-[Fredoka] text-gray-900 mb-1">
          LEVEL UP!
        </h2>

        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-grape-purple to-berry-pink border-3 border-[#2d3436] shadow-[3px_3px_0_#2d3436] flex items-center justify-center">
            <span className="text-2xl font-extrabold text-white font-[Fredoka]">{level}</span>
          </div>
        </div>

        <p className="text-lg font-bold font-[Fredoka] text-gray-700 mb-4">
          You are now a <span className="text-grape-purple">{getLevelTitle()}</span>!
        </p>

        <p className="text-sm font-bold text-gray-500 font-[Fredoka]">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
