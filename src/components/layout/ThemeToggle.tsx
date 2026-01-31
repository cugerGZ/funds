import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [darkMode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
      className="relative overflow-hidden h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-300 group touch-manipulation active:scale-95"
    >
      {/* 背景光晕 */}
      <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
        darkMode ? 'bg-primary/0 group-hover:bg-primary/10' : 'bg-amber-500/0 group-hover:bg-amber-500/10'
      }`} />

      <Sun
        className={`h-5 w-5 text-amber-500 transition-all duration-500 ${
          darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 text-primary transition-all duration-500 ${
          darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
