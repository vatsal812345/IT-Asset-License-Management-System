import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 group relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute inset-0 transition-all duration-500 transform ${
            theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
          }`}
        />
      </div>
      <span className="sr-only">Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
      
      {/* Tooltip subtle effect */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {theme === 'light' ? 'Dark' : 'Light'} Mode
      </div>
    </button>
  );
};

export default ThemeToggle;
