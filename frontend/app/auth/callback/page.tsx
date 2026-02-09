"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/api/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL params (if backend sends it)
        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
          setError(decodeURIComponent(error));
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (token) {
          // Save token
          localStorage.setItem("auth_token", token);

          // Get user info
          const response = await apiClient.get("/api/v1/auth/me");
          const user = response.data;

          localStorage.setItem("user", JSON.stringify(user));

          // CRITICAL: Use window.location.href for full page reload
          // This ensures localStorage is fully persisted before navigation
          if (user.role === "TEACHER") {
            window.location.href = "/teacher/dashboard";
          } else if (user.role === "STUDENT") {
            window.location.href = "/student/dashboard";
          } else {
            window.location.href = "/";
          }
        } else {
          // No token in URL - backend might have set it in session/cookie
          // Try to get current user
          try {
            const response = await apiClient.get("/api/v1/auth/me");
            const user = response.data;
            localStorage.setItem("user", JSON.stringify(user));

            // Use full page reload to ensure localStorage is persisted
            if (user.role === "TEACHER") {
              window.location.href = "/teacher/dashboard";
            } else if (user.role === "STUDENT") {
              window.location.href = "/student/dashboard";
            } else {
              window.location.href = "/";
            }
          } catch (err) {
            setError("Authentication failed. Please try again.");
            setTimeout(() => router.push("/login"), 3000);
          }
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed. Please try again.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-6xl mb-4">😞</div>
            <h2 className="font-fredoka text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oops!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="font-fredoka text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Signing you in...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Just a moment while we set up your account
            </p>
          </>
        )}
      </div>
    </div>
  );
}
