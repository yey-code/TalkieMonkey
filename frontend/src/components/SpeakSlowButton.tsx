interface SpeakSlowButtonProps {
  sentence: string;
}

export default function SpeakSlowButton({ sentence }: SpeakSlowButtonProps) {
  const speak = (rate: number) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <button
        onClick={() => speak(0.5)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-banana-light rounded-xl border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]
          hover:shadow-[1px_1px_0_#2d3436] hover:translate-x-[1px] hover:translate-y-[1px]
          transition-all text-xs font-bold font-[Fredoka] text-gray-700"
        title="Listen slowly"
      >
        <span>🐢</span> Slow
      </button>
      <button
        onClick={() => speak(1.0)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-jungle-light rounded-xl border-2 border-[#2d3436] shadow-[2px_2px_0_#2d3436]
          hover:shadow-[1px_1px_0_#2d3436] hover:translate-x-[1px] hover:translate-y-[1px]
          transition-all text-xs font-bold font-[Fredoka] text-gray-700"
        title="Listen normally"
      >
        <span>🐇</span> Normal
      </button>
    </div>
  );
}
