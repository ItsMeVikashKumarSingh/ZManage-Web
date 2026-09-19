import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message, title }]);

      // Auto remove after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast('success', message, title),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast('error', message, title),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast('info', message, title),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ success, error, info, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-white/95 dark:bg-[#0e1612]/95 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-white/95 dark:bg-[#1a0e10]/95 border-rose-500/30 text-rose-950 dark:text-rose-100'
                : 'bg-white/95 dark:bg-[#0e121a]/95 border-cyan-500/30 text-cyan-950 dark:text-cyan-100'
            }`}
          >
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-4 h-4 text-rose-500" />
              )}
              {toast.type === 'info' && (
                <Info className="w-4 h-4 text-cyan-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="text-xs font-semibold font-satoshi mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-xs font-mono leading-relaxed opacity-90 break-words">
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md opacity-60 hover:opacity-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
