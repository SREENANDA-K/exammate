
import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('exammate_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('exammate_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('exammate_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((previous) => !previous)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
    >
      <span className="text-xl" aria-hidden="true">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
};
