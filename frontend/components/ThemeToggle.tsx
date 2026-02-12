"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  variant?: "default" | "playful" | "professional";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const styles = {
    default:
      "w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
    playful:
      "w-10 h-10 rounded-full border-2 border-white/40 bg-white/20 hover:bg-white/30",
    professional:
      "w-10 h-10 rounded-full border border-teacher-border dark:border-teacher-border-dark bg-white dark:bg-gray-800",
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${styles[variant]} flex items-center justify-center
        shadow-sm hover:scale-110 transition-transform`}
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
}
