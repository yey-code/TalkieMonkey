import { useState, useEffect } from 'react';
import SpeakSlowButton from './SpeakSlowButton';

interface SentenceDisplayProps {
  sentence: string;
  comparison: { word: string; status: 'correct' | 'incorrect'; confidence: number }[] | null;
  onWordClick: (word: string) => void;
  difficulty?: number;
}

const difficultyInfo: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '🌱', label: 'Easy', color: 'bg-jungle-light text-jungle-dark' },
  2: { emoji: '🌿', label: 'Medium', color: 'bg-monkey-light text-monkey-dark' },
  3: { emoji: '🌳', label: 'Hard', color: 'bg-sunset-light text-sunset-pink' },
};

/**
 * Text Generate Effect — words appear one by one when idle,
 * then color-code on results. Neo-brutalism card styling.
 */
export default function SentenceDisplay({
  sentence,
  comparison,
  onWordClick,
  difficulty = 1,
}: SentenceDisplayProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const words = sentence.split(' ');

  // Text generate effect — reveal words one by one
  useEffect(() => {
    if (comparison) {
      setRevealedCount(words.length);
      return;
    }
    setRevealedCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealedCount(i);
      if (i >= words.length) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [sentence, comparison, words.length]);

  // No comparison yet — show animated reveal
  if (!comparison) {
    return (
      <div className="card-brutal bg-white p-5 md:p-8">
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-jungle-green" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-[Fredoka]">
            Read this sentence
          </span>
          {/* Difficulty badge */}
          <span className={`ml-auto text-[10px] font-bold font-[Fredoka] px-2 py-0.5 rounded-full border border-[#2d3436] ${difficultyInfo[difficulty]?.color || ''}`}>
            {difficultyInfo[difficulty]?.emoji} {difficultyInfo[difficulty]?.label}
          </span>
        </div>
        {/* Sentence */}
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className={`
                text-2xl md:text-4xl lg:text-5xl font-bold font-[Fredoka] text-gray-800
                transition-all duration-300
                ${i < revealedCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              `}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {word}
            </span>
          ))}
        </div>
        {/* Listen buttons */}
        <div className="mt-4">
          <SpeakSlowButton sentence={sentence} />
        </div>
      </div>
    );
  }

  // Helper: get style based on confidence level
  const getWordStyle = (item: { status: string; confidence: number }) => {
    if (item.status === 'correct') {
      if (item.confidence >= 0.95) {
        // Perfect match
        return 'text-jungle-green bg-jungle-light cursor-default';
      }
      // Close match (fuzzy/positional) — show a softer green
      return 'text-jungle-dark bg-emerald-100 cursor-default';
    }
    // Incorrect — red/pink
    return 'text-sunset-pink bg-sunset-light cursor-pointer hover:scale-110 hover:bg-red-100 underline decoration-wavy decoration-sunset-pink/40 decoration-2';
  };

  const getWordIcon = (item: { status: string; confidence: number }) => {
    if (item.status === 'correct') {
      if (item.confidence >= 0.95) return '✓';
      return '~'; // close but not perfect
    }
    return '🔊';
  };

  // Show color-coded results
  return (
    <div className="card-brutal bg-white p-5 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-banana-yellow" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-[Fredoka]">
          Your results
        </span>
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-2 md:gap-x-3">
        {comparison.map((item, index) => (
          <button
            key={`${item.word}-${index}`}
            onClick={() => {
              if (item.status === 'incorrect') {
                onWordClick(item.word);
              }
            }}
            className={`
              text-2xl md:text-4xl lg:text-5xl font-bold font-[Fredoka]
              px-2 py-0.5 rounded-xl
              transition-all duration-300
              animate-pop-in
              ${getWordStyle(item)}
            `}
            style={{ animationDelay: `${index * 80}ms` }}
            title={
              item.status === 'incorrect'
                ? '🔊 Click for pronunciation help!'
                : item.confidence >= 0.95
                  ? '✅ Perfect!'
                  : '✅ Close enough!'
            }
            disabled={item.status === 'correct'}
          >
            {item.word}
            <span className="inline-block ml-1 text-base align-top">
              {getWordIcon(item)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
