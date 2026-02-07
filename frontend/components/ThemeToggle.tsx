"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  variant?: "default" | "playful" | "professional";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const styles = {
    default: "fixed top-6 right-6 w-12 h-12 rounded-full border-2 border-landing-orange",
    playful: "fixed top-8 right-8 w-15 h-15 rounded-full border-3 border-student-purple",
    professional: "fixed top-6 right-6 w-11 h-11 rounded-full border border-teacher-border dark:border-teacher-border-dark",
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${styles[variant]} bg-white dark:bg-gray-800 flex items-center justify-center 
        shadow-lg hover:scale-110 transition-transform z-50`}
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
