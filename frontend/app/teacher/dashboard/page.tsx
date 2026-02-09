"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { QuickStatsCard } from "@/components/teacher/dashboard/QuickStatsCard";
import { StudentGrid } from "@/components/teacher/dashboard/StudentGrid";
import { CreateCurriculumFAB } from "@/components/teacher/dashboard/CreateCurriculumFAB";
import { getMyClasses } from "@/lib/api/classes";
import { questApi, QuestMetadata } from "@/lib/api/quests";
import apiClient from "@/lib/api/client";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentQuest: string;
  progress: number;
  status: "on-track" | "excelling" | "struggling";
  lastActive: string;
}

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [quests, setQuests] = useState<QuestMetadata[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Timeout if user doesn't load within 5 seconds when token exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasToken = localStorage.getItem('auth_token');
    
    if (hasToken && !user && !authLoading) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  useEffect(() => {
    async function loadDashboardData() {
      // Wait for auth to complete
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Fetch teacher's classes and quests in parallel
        const [classesData, questsData] = await Promise.all([
          getMyClasses(),
          questApi.list({ teacherId: user.uid })
        ]);

        setClasses(classesData || []);
        setQuests(questsData || []);

        // Fetch student details for all students across all classes
        const studentIdSet = new Set<string>();
        (classesData || []).forEach((classItem: any) => {
          (classItem.studentIds || []).forEach((id: string) => studentIdSet.add(id));
        });

        const studentIds = Array.from(studentIdSet);
        
        if (studentIds.length > 0) {
          // Fetch user details for all students
          const studentPromises = studentIds.map(async (studentId) => {
            try {
              const response = await apiClient.get(`/api/v1/users/${studentId}`);
              return response.data.data || response.data;
            } catch (error) {
              console.error(`Error fetching student ${studentId}:`, error);
              return null;
            }
          });

          const studentData = await Promise.all(studentPromises);
          
          // Convert to Student format
          const formattedStudents: Student[] = studentData
            .filter((s) => s !== null)
            .map((student: any) => ({
              id: student.uid,
              name: student.displayName || student.email.split('@')[0],
              email: student.email,
              avatar: (student.displayName || student.email)
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
              currentQuest: "No quest assigned",
              progress: 0,
              status: "on-track" as const,
              lastActive: "Not tracked yet",
            }));

          setStudents(formattedStudents);
        }
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading]);

  // Show timeout error
  if (timeoutError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Timeout
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Failed to load user information. This might be due to a network issue or expired session.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-teacher-teal text-white rounded-lg hover:bg-teal-600 transition"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wait for user to load if token exists
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
  if (authLoading || (hasToken && !user) || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teacher-teal mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading dashboard</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teacher-teal text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-merriweather text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {classes.length} {classes.length === 1 ? 'class' : 'classes'} • {students.length} {students.length === 1 ? 'student' : 'students'}
          </p>
        </div>

        <QuickStatsCard 
          students={students}
          quests={quests}
        />

        <div className="mt-8">
          {students.length > 0 ? (
            <StudentGrid
              students={students}
              onStudentClick={setSelectedStudent}
            />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No students enrolled yet
              </p>
              <p className="text-sm text-gray-400">
                Students will appear here when they join your classes
              </p>
            </div>
          )}
        </div>
      </main>

      <CreateCurriculumFAB />
    </div>
  );
}
