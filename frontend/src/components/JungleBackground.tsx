import { useEffect, useRef } from 'react';

/**
 * Animated jungle-themed background with layered SVG waves,
 * floating leaves, and a subtle gradient sky.
 * Inspired by Aceternity UI's WavyBackground / BackgroundBeams.
 */
export default function JungleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Firefly / particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; r: number; dx: number; dy: number; o: number; do: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create fireflies
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random(),
        do: (Math.random() - 0.5) * 0.01,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        p.o += p.do;

        if (p.o <= 0 || p.o >= 1) p.do *= -1;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 202, 87, ${Math.abs(p.o) * 0.6})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 202, 87, ${Math.abs(p.o) * 0.1})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #48dbfb 0%, #a3e4d7 25%, #2ecc71 55%, #1a9c54 75%, #0d6b3a 100%)',
        }}
      />

      {/* Subtle clouds */}
      <div className="absolute top-[5%] left-[10%] w-40 h-16 bg-white/20 rounded-full blur-xl animate-float-gentle" />
      <div className="absolute top-[8%] right-[15%] w-56 h-20 bg-white/15 rounded-full blur-2xl animate-float-gentle" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[3%] left-[50%] w-32 h-12 bg-white/20 rounded-full blur-lg animate-float-gentle" style={{ animationDelay: '2s' }} />

      {/* Sun */}
      <div className="absolute top-6 right-12 w-20 h-20 md:w-28 md:h-28 rounded-full bg-banana-yellow/80 blur-sm animate-glow-pulse" />
      <div className="absolute top-8 right-14 w-16 h-16 md:w-24 md:h-24 rounded-full bg-banana-yellow" />

      {/* Layered hills */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '30%' }}>
        <path fill="#1a9c54" fillOpacity="0.6" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,213.3C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        <path fill="#0d6b3a" fillOpacity="0.7" d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,240C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
      </svg>

      {/* Animated leaves / vines on edges */}
      <div className="absolute top-0 left-0 text-5xl md:text-7xl opacity-40 animate-sway origin-top-left select-none">🌿</div>
      <div className="absolute top-12 left-8 text-3xl md:text-5xl opacity-30 animate-sway origin-top-left select-none" style={{ animationDelay: '.5s' }}>🍃</div>
      <div className="absolute top-0 right-0 text-5xl md:text-7xl opacity-40 animate-sway origin-top-right select-none" style={{ animationDelay: '1s' }}>🌿</div>
      <div className="absolute top-16 right-6 text-3xl opacity-25 animate-sway origin-top-right select-none" style={{ animationDelay: '1.5s' }}>🍃</div>
      <div className="absolute bottom-[28%] left-4 text-4xl opacity-30 animate-sway select-none" style={{ animationDelay: '2s' }}>🌴</div>
      <div className="absolute bottom-[26%] right-6 text-5xl opacity-25 animate-sway select-none" style={{ animationDelay: '.8s' }}>🌴</div>

      {/* Firefly canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
