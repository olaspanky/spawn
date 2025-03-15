// components/ThemeToggle.tsx
"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Initialize theme on component mount
  useEffect(() => {
    // Get saved theme from localStorage or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: 'light' | 'dark';
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    } else {
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);
  
  // Apply theme changes
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200 ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
};

export default ThemeToggle;