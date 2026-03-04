interface MonkeyMascotProps {
  state: 'idle' | 'recording' | 'processing' | 'success' | 'tryAgain';
}

/**
 * Interactive monkey mascot zone with SVG monkey, animated
 * speech bubble, and state-driven expressions.
 */
export default function MonkeyMascot({ state }: MonkeyMascotProps) {
  const getMessage = () => {
    switch (state) {
      case 'idle':
        return "Read the sentence and press the big button!";
      case 'recording':
        return "I'm listening! Keep going!";
      case 'processing':
        return 'Let me think...';
      case 'success':
        return 'Amazing job! You nailed it!';
      case 'tryAgain':
        return "Tap red words to hear them!";
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
