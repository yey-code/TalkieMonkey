interface ScoreDisplayProps {
  score: number;
  correctCount: number;
  totalCount: number;
}

/**
 * Animated score card with counting effect and emoji rewards.
 * Neo-brutalism style with gradient fills.
 */
export default function ScoreDisplay({ score, correctCount, totalCount }: ScoreDisplayProps) {
  const getScoreEmoji = () => {
    if (score === 100) return '🏆';
    if (score >= 80) return '⭐';
    if (score >= 50) return '👍';
    return '🌱';
  };

  const getScoreMessage = () => {
    if (score === 100) return 'PERFECT!';
    if (score >= 80) return 'Almost there!';
    if (score >= 50) return 'Good try!';
    return "Let's try again!";
  };

  const getBarColor = () => {
    if (score >= 80) return 'bg-gradient-to-r from-jungle-green to-jungle-dark';
    if (score >= 50) return 'bg-gradient-to-r from-monkey-orange to-banana-yellow';
    return 'bg-gradient-to-r from-sunset-pink to-red-400';
  };

  return (
    <div className="card-brutal bg-white p-4 md:p-5 animate-float-in mt-4">
      <div className="flex items-center gap-4">
        {/* Big score circle */}
        <div className="animate-score-count flex-shrink-0">
          <div className={`
            w-16 h-16 lg:w-20 lg:h-20 rounded-full
            border-3 border-[#2d3436]
            flex items-center justify-center
            shadow-[3px_3px_0_#2d3436]
            ${score >= 80 ? 'bg-jungle-light' : score >= 50 ? 'bg-monkey-light' : 'bg-sunset-light'}
          `}>
            <span className="text-2xl lg:text-3xl font-extrabold font-[Fredoka]">{score}%</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getScoreEmoji()}</span>
            <span className="text-base lg:text-lg font-bold font-[Fredoka] text-gray-800">
              {getScoreMessage()}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mb-2">
            {correctCount}/{totalCount} words correct
          </p>
          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full border-2 border-[#2d3436] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor()}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
