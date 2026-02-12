"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  classId?: string;
  gradeLevel?: number;
}

export function getStudentDashboardPath(gradeLevel?: number): string {
  if (gradeLevel == null) return '/student/dashboard';
  if (gradeLevel <= 5) return '/student/elementary/dashboard';
  if (gradeLevel <= 8) return '/student/middle/dashboard';
  return '/student/high/dashboard';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (classCode: string, studentName: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // First useEffect: Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Second useEffect: Load user from localStorage ONLY after mounted
  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    setLoading(false);
  }, [mounted]);

  const login = async (classCode: string, studentName: string) => {
    try {
      const response = await authApi.loginStudent({ classCode, studentName });
      
      // Save token and user
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      // Redirect based on role and grade level
      if (response.user.role === 'STUDENT') {
        router.push(getStudentDashboardPath(response.user.gradeLevel));
      } else {
        router.push('/teacher/dashboard');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = authApi.getGoogleAuthUrl();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'TEACHER',
        isStudent: user?.role === 'STUDENT',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
