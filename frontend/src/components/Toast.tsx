import { useEffect, useState, useCallback } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

/**
 * Imperative toast trigger — call from anywhere.
 */
export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

/**
 * Playful toast notification container.
 * Inspired by shadcn/ui Toast but styled for kids.
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-sunset-pink to-red-500 border-red-800';
      case 'success':
        return 'bg-gradient-to-r from-jungle-green to-jungle-dark border-jungle-deep';
      case 'info':
        return 'bg-gradient-to-r from-sky-blue to-grape-purple border-sky-blue';
    }
  };

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'error': return '🙈 Oopsie!';
      case 'success': return '🎉 Yay!';
      case 'info': return '🐵 Hey!';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            animate-float-in
            px-5 py-3 rounded-xl
            border-2 shadow-[4px_4px_0_#2d3436]
            text-white font-bold font-[Fredoka]
            flex items-center gap-3
            ${getStyles(toast.type)}
          `}
        >
          <span className="text-lg whitespace-nowrap">{getIcon(toast.type)}</span>
          <span className="text-sm md:text-base">{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-auto text-white/70 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
