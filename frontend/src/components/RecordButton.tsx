import { useEffect, useRef } from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  analyserNode: AnalyserNode | null;
}

/**
 * Massive pulsating record button with integrated audio visualizer ring.
 * Inspired by Magic UI's PulsatingButton.
 */
export default function RecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  analyserNode,
}: RecordButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Circular audio visualizer ring around the button
  useEffect(() => {
    if (!isRecording || !analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 20;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, size, size);

      const bars = 48;
      for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor((i / bars) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = value * 30 + 4;
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;

        const x1 = center + Math.cos(angle) * radius;
        const y1 = center + Math.sin(angle) * radius;
        const x2 = center + Math.cos(angle) * (radius + barHeight);
        const y2 = center + Math.sin(angle) * (radius + barHeight);

        const hue = (i / bars) * 120 + 30; // warm yellows to greens
        ctx.strokeStyle = `hsla(${hue}, 90%, 55%, 0.9)`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, analyserNode]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-32 h-32 lg:w-40 lg:h-40">
          {/* Spinner ring */}
          <div className="absolute inset-0 rounded-full border-[6px] border-monkey-light border-t-monkey-orange animate-spin" />
          {/* Center */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-monkey-orange to-banana-yellow flex items-center justify-center shadow-[4px_4px_0_#2d3436] border-3 border-[#2d3436]">
            <span className="text-4xl animate-float-gentle">🙈</span>
          </div>
        </div>
        <p className="text-base font-bold text-white/90 font-[Fredoka] drop-shadow-md">
          Checking your words...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Button container with visualizer ring */}
      <div className="relative w-36 h-36 lg:w-44 lg:h-44">
        {/* Visualizer canvas (behind button) */}
        {isRecording && (
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="absolute inset-0 w-full h-full"
          />
        )}

        {/* Outer glow ring */}
        <div
          className={`
            absolute inset-0 rounded-full transition-all duration-500
            ${isRecording ? 'bg-sunset-pink/20 animate-pulse-record' : 'bg-jungle-green/15'}
          `}
        />

        {/* The Big Button */}
        <button
          onClick={isRecording ? onStop : onStart}
          className={`
            absolute inset-3 rounded-full
            flex items-center justify-center
            border-4 border-b-8 border-[#2d3436]
            transition-all duration-200
            focus:outline-none
            active:border-b-4 active:translate-y-[4px]
            ${
              isRecording
                ? 'bg-gradient-to-br from-sunset-pink to-red-500 shadow-[0_0_30px_rgba(238,90,36,.5)]'
                : 'bg-gradient-to-br from-jungle-green to-jungle-dark shadow-[0_0_30px_rgba(46,204,113,.3)] hover:shadow-[0_0_40px_rgba(46,204,113,.5)] hover:scale-105'
            }
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-lg shadow-md" />
          ) : (
            <svg
              className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-md"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Label */}
      <p className="text-lg font-bold text-white/90 font-[Fredoka] drop-shadow-md">
        {isRecording ? '🔴 Tap to stop' : '🎤 Tap to speak!'}
      </p>
    </div>
  );
}
