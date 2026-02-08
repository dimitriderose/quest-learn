"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "TEACHER" | "STUDENT" | "ADMIN";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (requiredRole && user?.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (user?.role === "TEACHER") {
          router.push("/teacher/dashboard");
        } else if (user?.role === "STUDENT") {
          router.push("/student/dashboard");
        } else {
          router.push("/login");
        }
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-fredoka text-xl">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
