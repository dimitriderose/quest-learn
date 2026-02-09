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
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Trust localStorage - JWT will be validated by backend on API calls
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('[AuthContext] Loaded user from localStorage:', parsedUser.uid);
      } catch (error) {
        // Only clear if parsing fails
        console.error('[AuthContext] Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      console.log('[AuthContext] No token or user in localStorage');
    }
    
    setLoading(false);
    console.log('[AuthContext] Loading complete');
  }, []);

  const login = async (classCode: string, studentName: string) => {
    try {
      const response = await authApi.loginStudent({ classCode, studentName });
      
      // Save token and user
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      // Redirect based on role
      if (response.user.role === 'STUDENT') {
        router.push('/student/dashboard');
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
