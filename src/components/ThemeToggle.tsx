import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Moon className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      default:
        return theme;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        title={`Tema atual: ${getLabel()}`}
        aria-label="Alternar tema"
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 dark:bg-slate-800/40 high-contrast:bg-yellow-400/20 hover:bg-white/20 dark:hover:bg-slate-800/60 high-contrast:hover:bg-yellow-400/30 text-slate-900 dark:text-white high-contrast:text-white text-sm transition-colors"
      >
        {getIcon()}
        <span className="hidden sm:inline">{getLabel()}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 high-contrast:bg-black border border-slate-200 dark:border-slate-700 high-contrast:border-yellow-400 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setTheme('light');
              setShowMenu(false);
            }}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 high-contrast:hover:bg-yellow-400/20 transition-colors ${
              theme === 'light'
                ? 'bg-slate-100 dark:bg-slate-700 high-contrast:bg-yellow-400/30 text-slate-900 dark:text-white high-contrast:text-white font-semibold'
                : 'text-slate-700 dark:text-slate-300 high-contrast:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => {
              setTheme('dark');
              setShowMenu(false);
            }}
            className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 high-contrast:hover:bg-yellow-400/20 transition-colors ${
              theme === 'dark'
                ? 'bg-slate-100 dark:bg-slate-700 high-contrast:bg-yellow-400/30 text-slate-900 dark:text-white high-contrast:text-white font-semibold'
                : 'text-slate-700 dark:text-slate-300 high-contrast:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Escuro</span>
          </button>
        </div>
      )}
    </div>
  );
}
