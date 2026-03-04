import { type ReactNode } from 'react';

interface ShimmerButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  size?: 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'danger' | 'secondary';
  className?: string;
}

/**
 * A chunky, glowing button with a shimmer sweep effect.
 * Inspired by Magic UI's ShimmerButton / PulsatingButton.
 */
export default function ShimmerButton({
  children,
  onClick,
  disabled = false,
  size = 'lg',
  variant = 'primary',
  className = '',
}: ShimmerButtonProps) {
  const sizeClasses = {
    md: 'px-6 py-3 text-lg',
    lg: 'px-8 py-4 text-xl md:text-2xl',
    xl: 'px-10 py-5 text-2xl md:text-3xl',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-jungle-green via-jungle-dark to-jungle-green text-white border-jungle-deep',
    danger: 'bg-gradient-to-r from-sunset-pink via-red-500 to-sunset-pink text-white border-red-800',
    secondary: 'bg-gradient-to-r from-monkey-orange via-banana-yellow to-monkey-orange text-gray-900 border-monkey-dark',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden
        font-bold font-[Fredoka] rounded-2xl
        border-3 border-b-6
        shadow-[4px_4px_0_#2d3436]
        transition-all duration-150
        hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#2d3436]
        active:translate-y-[2px] active:shadow-[2px_2px_0_#2d3436]
        focus:outline-none focus:ring-4 focus:ring-banana-yellow/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {/* Shimmer sweep overlay */}
      <div
        className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
