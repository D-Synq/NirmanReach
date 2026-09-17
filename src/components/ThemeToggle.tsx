import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE5E0] bg-white/50 text-[#0D322B] backdrop-blur-sm transition-colors hover:bg-[#E6F7F3] dark:border-[#184239] dark:bg-[#0D2721]/50 dark:text-[#F4F9F6] dark:hover:bg-[#143830]"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
