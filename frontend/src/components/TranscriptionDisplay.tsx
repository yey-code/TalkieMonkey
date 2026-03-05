interface TranscriptionDisplayProps {
  transcription: string;
  score: number;
}

/**
 * Shows "You said: ..." after evaluation so kids can see
 * what the AI heard them say. Neo-brutalism card style.
 */
export default function TranscriptionDisplay({
  transcription,
  score,
}: TranscriptionDisplayProps) {
  const getEmoji = () => {
    if (score === 100) return '🌟';
    if (score >= 80) return '😊';
    if (score >= 50) return '🤔';
    return '😅';
  };

  return (
    <div className="card-brutal-sm bg-banana-light p-4 animate-float-in">
      <div className="flex items-start gap-3">
        {/* Ear icon */}
        <div className="w-10 h-10 rounded-xl bg-monkey-orange border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{getEmoji()}</span>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-[Fredoka] mb-1">
            🎧 I heard you say
          </p>
          <p className="text-base md:text-lg font-bold text-gray-800 font-[Fredoka] leading-relaxed">
            "{transcription}"
          </p>
        </div>
      </div>
    </div>
  );
}
