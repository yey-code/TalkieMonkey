export type TabId = 'practice' | 'rewards' | 'dashboard' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  xp: number;
  level: number;
}

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'practice', icon: '🏠', label: 'Practice' },
  { id: 'rewards', icon: '🏆', label: 'Rewards' },
  { id: 'dashboard', icon: '📊', label: 'Progress' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

/**
 * Mobile-only bottom navigation bar with tab switching.
 * Fixed at bottom, hidden on desktop.
 */
export default function BottomNav({
  activeTab,
  onTabChange,
  xp,
  level,
}: BottomNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-2 mb-2 rounded-2xl border-2 border-[#2d3436] bg-white/95 backdrop-blur-md shadow-[4px_-2px_0_#2d3436] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-b from-banana-yellow/30 to-monkey-orange/20 scale-110'
                    : 'opacity-60 hover:opacity-80'
                  }
                `}
              >
                <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {tab.icon}
                </span>
                <span
                  className={`text-[10px] font-extrabold font-[Fredoka] tracking-wider
                    ${isActive ? 'text-gray-800' : 'text-gray-400'}
                  `}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
