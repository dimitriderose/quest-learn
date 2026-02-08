"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-fredoka text-2xl font-bold text-teacher-primary">
              QuestLearn
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link
                href="/teacher/dashboard"
                className="text-teacher-primary font-semibold"
              >
                Dashboard
              </Link>
              <Link
                href="/teacher/curricula"
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                My Curricula
              </Link>
              <Link
                href="/teacher/reports"
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                Reports
              </Link>
              <Link
                href="/teacher/settings"
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-full bg-teacher-primary text-white flex items-center justify-center font-semibold">
              MS
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
