"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isStudent, login } = useAuth();
  const [classCode, setClassCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isStudent) {
      router.push("/student/dashboard");
    }
  }, [isAuthenticated, isStudent, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(classCode.toUpperCase(), studentName);
    } catch (err: any) {
      setError(err.message || "Invalid class code or name. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-purple via-student-teal to-student-yellow dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block mb-4">
            <h1 className="font-fredoka text-5xl font-bold text-white drop-shadow-lg">
              QuestLearn
            </h1>
          </Link>
          <p className="text-white text-xl font-fredoka drop-shadow">
            Ready for an adventure? 🎮
          </p>
        </div>

        <Card className="p-8">
          <h2 className="font-fredoka text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Enter Your Class Code
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Class Code
              </label>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-student-purple focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 uppercase text-center text-2xl font-bold tracking-wider"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-student-purple focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={loading || !classCode || !studentName}
            >
              {loading ? "Logging in..." : "Start Learning! 🚀"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              <strong>Don't have a class code?</strong> Ask your teacher for your class code.
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-white drop-shadow hover:underline"
          >
            ← Back to login options
          </Link>
        </div>
      </div>
    </div>
  );
}
