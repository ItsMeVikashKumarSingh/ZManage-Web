import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, Trash2, HelpCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Are you sure?',
    message: '',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  const variant = options.variant || 'warning';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={handleCancel}
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#121216] border border-[#e4e1d9] dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-5 text-charcoal dark:text-zinc-100 ring-1 ring-black/5 dark:ring-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    variant === 'danger'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      : variant === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : variant === 'info'
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                  }`}
                >
                  {variant === 'danger' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : variant === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : variant === 'info' ? (
                    <Info className="w-5 h-5" />
                  ) : (
                    <HelpCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-charcoal dark:text-white tracking-tight">
                      {options.title}
                    </h3>
                    <button
                      onClick={handleCancel}
                      className="text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white transition p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-steel dark:text-zinc-300 font-sans mt-2 leading-relaxed">
                    {options.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e4e1d9] dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl border border-[#e4e1d9] dark:border-zinc-800 text-xs font-medium text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  {options.cancelText || 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer ${
                    variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : variant === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : variant === 'info'
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {options.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};
