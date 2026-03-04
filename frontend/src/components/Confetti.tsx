import { useEffect, useState } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  emoji: string;
  size: number;
  delay: number;
  duration: number;
}

const EMOJIS = ['⭐', '🎉', '🌟', '🍌', '🐵', '✨', '🎊', '💛', '🏆', '🌈'];
const COLORS = ['#feca57', '#ff9f43', '#2ecc71', '#54a0ff', '#fd79a8', '#6c5ce7'];

/**
 * Confetti / Particles burst triggered on success.
 * Inspired by Magic UI's Confetti effect.
 */
export default function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size: Math.random() * 1.5 + 0.8,
        delay: Math.random() * 0.8,
        duration: Math.random() * 2 + 1.5,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 100 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}rem`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
