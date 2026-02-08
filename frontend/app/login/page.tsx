"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isTeacher, isStudent } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isTeacher) {
        router.push("/teacher/dashboard");
      } else if (isStudent) {
        router.push("/student/dashboard");
      }
    }
  }, [isAuthenticated, isTeacher, isStudent, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-fredoka text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QuestLearn
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Learn through adventure
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👨‍🏫</div>
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Teachers
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign in with your Google Workspace account
              </p>
            </div>
            <Link href="/login/teacher">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Teacher Sign In
              </button>
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎮</div>
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Students
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter your class code to start learning
              </p>
            </div>
            <Link href="/login/student">
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Student Sign In
              </button>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
