"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface Student {
  name: string;
  role: string;
  avatar: string;
}

interface HighSchoolHeaderProps {
  student: Student;
}

export function HighSchoolHeader({ student }: HighSchoolHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-2xl">
              {student.avatar}
            </div>
            <div>
              <h1 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white">
                {student.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {student.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="#" className="text-gray-900 dark:text-white font-semibold">
                Dashboard
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Portfolio
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Resources
              </a>
            </nav>
            <ThemeToggle />
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <span className="text-lg">⚙️</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
