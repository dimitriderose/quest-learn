"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  const { user, logout } = useAuth();

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
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/teacher/classes"
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                My Classes
              </Link>
              <Link
                href="/teacher/curricula"
                className="text-gray-600 dark:text-gray-400 hover:text-teacher-primary"
              >
                Curricula
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
            <ThemeToggle variant="professional" />
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.displayName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-teacher-primary text-white flex items-center justify-center font-semibold">
                  {user.displayName?.charAt(0) || "T"}
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
