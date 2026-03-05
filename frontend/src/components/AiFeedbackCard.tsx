import type { AiFeedback } from '../services/api';

interface AiFeedbackCardProps {
  feedback: AiFeedback;
  onWordTipClick: (word: string) => void;
}

export default function AiFeedbackCard({ feedback, onWordTipClick }: AiFeedbackCardProps) {
  const wordTipEntries = Object.entries(feedback.word_tips || {});

  return (
    <div className="card-brutal bg-gradient-to-br from-grape-light to-white p-4 md:p-5 animate-float-in space-y-3">
      {/* Monkey Coach Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-grape-purple border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🐵</span>
        </div>
        <div>
          <p className="text-xs font-bold text-grape-purple uppercase tracking-widest font-[Fredoka]">
            Monkey Coach says...
          </p>
        </div>
      </div>

      {/* Encouragement */}
      <p className="text-sm md:text-base font-bold text-gray-800 font-[Fredoka] leading-relaxed">
        {feedback.encouragement}
      </p>

      {/* Word Tips */}
      {wordTipEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-[Fredoka]">
            🔤 Word Help
          </p>
          <div className="grid gap-2">
            {wordTipEntries.map(([word, tip]) => (
              <button
                key={word}
                onClick={() => onWordTipClick(word)}
                className="flex items-start gap-3 p-3 bg-white rounded-xl border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]
                  hover:shadow-[1px_1px_0_#2d3436] hover:translate-x-[1px] hover:translate-y-[1px]
                  transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-sunset-light border-2 border-[#2d3436] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold font-[Fredoka] text-sunset-pink">🔊</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-gray-800 font-[Fredoka] group-hover:text-sunset-pink transition-colors">
                    "{word}" → <span className="text-grape-purple">{tip.phonetic}</span>
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    {tip.tip}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fun Fact */}
      {feedback.fun_fact && (
        <div className="flex items-start gap-2 p-3 bg-banana-light rounded-xl border-2 border-[#2d3436]">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs font-semibold text-gray-700 font-[Fredoka]">
            {feedback.fun_fact}
          </p>
        </div>
      )}

      {/* Practice Suggestion */}
      {feedback.practice_suggestion && (
        <div className="flex items-start gap-2 p-2 bg-jungle-light/50 rounded-lg">
          <span className="text-sm flex-shrink-0">🎯</span>
          <p className="text-xs font-bold text-jungle-dark font-[Fredoka]">
            {feedback.practice_suggestion}
          </p>
        </div>
      )}
    </div>
  );
}
