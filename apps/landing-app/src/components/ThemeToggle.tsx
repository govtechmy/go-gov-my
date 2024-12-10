'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import Moon from '@/icons/moon';
import Sun from '@/icons/sun';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className={`p-2 border-none shadow-none ${
        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
      }`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
