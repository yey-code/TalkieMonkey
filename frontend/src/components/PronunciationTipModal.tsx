import { useState, useEffect } from 'react';
import type { PronunciationTipDetail } from '../services/api';
import { fetchPronunciationTips } from '../services/api';

interface PronunciationTipModalProps {
  word: string;
  onClose: () => void;
}

export default function PronunciationTipModal({ word, onClose }: PronunciationTipModalProps) {
  const [tip, setTip] = useState<PronunciationTipDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const result = await fetchPronunciationTips([word]);
      if (!cancelled) {
        const wordLower = word.toLowerCase().replace(/[^a-z'-]/g, '');
        const matched = result?.tips?.[wordLower] || result?.tips?.[word] || null;
        setTip(matched);
        setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [word]);

  const speakWord = (text: string, rate = 0.6) => {
    const stripped = text.replace(/[^a-zA-Z'-]/g, '');
    const utterance = new SpeechSynthesisUtterance(stripped);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm card-brutal bg-white p-5 animate-float-in space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-grape-purple border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436] flex items-center justify-center">
              <span className="text-xl">🔤</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest font-[Fredoka]">
                How to say
              </p>
              <p className="text-xl font-extrabold text-gray-800 font-[Fredoka]">
                "{word}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-[#2d3436] flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="text-3xl animate-bounce mb-2">🐵</div>
            <p className="text-sm font-bold text-gray-400 font-[Fredoka]">
              Monkey is thinking...
            </p>
          </div>
        ) : tip ? (
          <div className="space-y-3">
            {/* Phonetic Breakdown */}
            <div className="p-4 bg-grape-light rounded-xl border-2 border-[#2d3436] text-center">
              <p className="text-xs font-bold text-grape-purple uppercase tracking-widest font-[Fredoka] mb-1">
                Sound it out 🗣️
              </p>
              <p className="text-2xl font-extrabold text-gray-800 font-[Fredoka]">
                {tip.phonetic}
              </p>
            </div>

            {/* Listen Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => speakWord(word, 0.5)}
                className="card-brutal-sm bg-banana-light p-3 flex flex-col items-center gap-1 hover:translate-y-[-2px] transition-transform"
              >
                <span className="text-2xl">🐢</span>
                <span className="text-xs font-bold text-gray-700 font-[Fredoka]">
                  Say Slow
                </span>
              </button>
              <button
                onClick={() => speakWord(word, 1.0)}
                className="card-brutal-sm bg-jungle-light p-3 flex flex-col items-center gap-1 hover:translate-y-[-2px] transition-transform"
              >
                <span className="text-2xl">🐇</span>
                <span className="text-xs font-bold text-gray-700 font-[Fredoka]">
                  Say Normal
                </span>
              </button>
            </div>

            {/* Rhyme Helper */}
            {tip.rhyme && (
              <div className="flex items-start gap-2 p-3 bg-monkey-light rounded-xl border-2 border-[#2d3436]">
                <span className="text-lg flex-shrink-0">🎵</span>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-[Fredoka]">
                    Rhyme Helper
                  </p>
                  <p className="text-sm font-bold text-gray-800 font-[Fredoka]">
                    {tip.rhyme}
                  </p>
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="flex items-start gap-2 p-3 bg-jungle-light/50 rounded-xl">
              <span className="text-sm flex-shrink-0">💡</span>
              <p className="text-xs font-semibold text-gray-700 font-[Fredoka]">
                {tip.tip}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            {/* Fallback when AI tips unavailable */}
            <p className="text-sm font-bold text-gray-500 font-[Fredoka]">
              Listen and try again! 🐵
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => speakWord(word, 0.5)}
                className="card-brutal-sm bg-banana-light p-3 flex flex-col items-center gap-1 hover:translate-y-[-2px] transition-transform"
              >
                <span className="text-2xl">🐢</span>
                <span className="text-xs font-bold text-gray-700 font-[Fredoka]">
                  Say Slow
                </span>
              </button>
              <button
                onClick={() => speakWord(word, 1.0)}
                className="card-brutal-sm bg-jungle-light p-3 flex flex-col items-center gap-1 hover:translate-y-[-2px] transition-transform"
              >
                <span className="text-2xl">🐇</span>
                <span className="text-xs font-bold text-gray-700 font-[Fredoka]">
                  Say Normal
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Try Again Button */}
        <button
          onClick={onClose}
          className="w-full card-brutal-sm bg-jungle-green text-white p-3 text-center font-extrabold font-[Fredoka] text-sm hover:translate-y-[-1px] transition-transform"
        >
          Got it! Let me try! 🐵
        </button>
      </div>
    </div>
  );
}
