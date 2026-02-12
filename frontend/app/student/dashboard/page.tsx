"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getStudentDashboardPath } from "@/lib/contexts/AuthContext";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const dashboardPath = getStudentDashboardPath(user.gradeLevel);
      if (dashboardPath !== "/student/dashboard") {
        router.replace(dashboardPath);
      }
    }
  }, [user, loading, router]);

  // If no gradeLevel is set, show a loading state while redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-fredoka text-xl">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Fallback: if no gradeLevel, redirect to elementary as default
  if (user && user.gradeLevel == null) {
    router.replace("/student/elementary/dashboard");
    return null;
  }

  return null;
}
