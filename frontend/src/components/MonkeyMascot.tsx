interface MonkeyMascotProps {
  state: 'idle' | 'recording' | 'processing' | 'success' | 'tryAgain';
  compact?: boolean;
}

/**
 * Interactive monkey mascot zone with animated
 * speech bubble and state-driven expressions.
 * `compact` mode renders just the emoji + small bubble for mobile inline use.
 */
export default function MonkeyMascot({ state, compact = false }: MonkeyMascotProps) {
  const getMessage = () => {
    switch (state) {
      case 'idle':
        return compact ? "Tap to speak!" : "Read the sentence and press the big button!";
      case 'recording':
        return compact ? "Listening..." : "I'm listening! Keep going!";
      case 'processing':
        return compact ? 'Thinking...' : 'Let me think...';
      case 'success':
        return compact ? 'Amazing!' : 'Amazing job! You nailed it!';
      case 'tryAgain':
        return compact ? 'Try again!' : "Tap red words to hear them!";
      default:
        return "Let's practice!";
    }
  };

  const getEmoji = () => {
    switch (state) {
      case 'recording': return '🙉';
      case 'processing': return '🙈';
      case 'success': return '🐒';
      default: return '🐵';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'recording': return '🎤';
      case 'processing': return '⏳';
      case 'success': return '🎉';
      case 'tryAgain': return '💪';
      default: return '👋';
    }
  };

  // Compact mode for mobile top bar
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`text-2xl transition-transform duration-300 ${
            state === 'recording' ? 'animate-wiggle' : ''
          } ${state === 'success' ? 'animate-bounce-word' : ''}`}
        >
          {getEmoji()}
        </span>
        <div className="card-brutal-sm px-2.5 py-1 bg-banana-light max-w-[140px]">
          <p className="text-xs font-bold text-gray-700 font-[Fredoka] truncate">
            {getStateIcon()} {getMessage()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Monkey with platform */}
      <div className="relative">
        {/* Glow ring behind monkey */}
        <div
          className={`absolute inset-0 rounded-full blur-xl transition-colors duration-500 ${
            state === 'recording'
              ? 'bg-sunset-pink/30'
              : state === 'success'
              ? 'bg-banana-yellow/40'
              : 'bg-jungle-green/20'
          }`}
        />

        {/* Monkey */}
        <div
          className={`
            relative text-6xl lg:text-7xl
            transition-transform duration-300
            ${state === 'recording' ? 'animate-wiggle' : ''}
            ${state === 'success' ? 'animate-bounce-word' : ''}
            ${state === 'processing' ? 'animate-float-gentle' : ''}
          `}
        >
          {getEmoji()}
        </div>
      </div>

      {/* Speech bubble — neo-brutalism card */}
      <div className="relative card-brutal-sm px-4 py-2.5 max-w-[220px] text-center bg-banana-light">
        {/* Arrow */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-banana-light border-l-2 border-t-2 border-[#2d3436] rotate-45" />
        <p className="text-sm lg:text-base font-bold text-gray-800 font-[Fredoka] leading-snug">
          <span className="mr-1">{getStateIcon()}</span>
          {getMessage()}
        </p>
      </div>
    </div>
  );
}
