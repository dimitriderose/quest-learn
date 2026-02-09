"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://questlearn-production.up.railway.app';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL params (if backend sends it)
        const token = searchParams.get("token");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (token) {
          // Save token FIRST
          localStorage.setItem("auth_token", token);

          // Get user info with explicit Authorization header
          // Don't use apiClient here because it might not pick up the token fast enough
          const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
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
          setError("No authentication token received");
          setTimeout(() => router.push("/login"), 3000);
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
