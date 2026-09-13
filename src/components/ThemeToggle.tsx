import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'expanded' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    return (
      <div className={`w-full p-1 bg-paper dark:bg-zinc-900 border border-ash dark:border-zinc-800 rounded-xl flex items-center gap-1 shadow-xs ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            !isDark
              ? 'bg-white text-charcoal shadow-xs font-semibold'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
          }`}
          title="Switch to Light Mode"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-steel dark:text-zinc-500'}`} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            isDark
              ? 'bg-zinc-800 text-zinc-100 shadow-xs font-semibold'
              : 'text-steel dark:text-zinc-400 hover:text-charcoal dark:hover:text-zinc-100'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-steel dark:text-zinc-500'}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between p-2 rounded-xl border border-ash/80 dark:border-zinc-800 bg-paper/40 dark:bg-zinc-900/40 hover:bg-paper dark:hover:bg-zinc-800/80 text-xs transition cursor-pointer group shadow-xs ${className}`}
        title={`Click to switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle Theme"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-ash/80 dark:border-zinc-700/80 flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
          <div className="text-left leading-tight">
            <span className="font-medium text-xs text-charcoal dark:text-zinc-200 block">Theme</span>
            <span className="text-[10px] text-steel dark:text-zinc-400 font-mono block">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </div>

        {/* Modern iOS/Linear style sliding switch */}
        <div
          className={`w-9 h-5 rounded-full transition-colors duration-200 ease-in-out p-0.5 flex items-center shrink-0 ${
            isDark ? 'bg-electric' : 'bg-ash/90 dark:bg-zinc-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out transform flex items-center justify-center ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          >
            {isDark ? (
              <Moon className="w-2 h-2 text-blue-500" />
            ) : (
              <Sun className="w-2 h-2 text-amber-500" />
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shadow-xs ${
        isDark 
          ? 'bg-zinc-900 border-zinc-800 text-blue-400 hover:bg-zinc-800 hover:text-blue-300' 
          : 'bg-white border-ash text-amber-500 hover:bg-paper hover:text-amber-600'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="w-3.5 h-3.5" />
      ) : (
        <Sun className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
