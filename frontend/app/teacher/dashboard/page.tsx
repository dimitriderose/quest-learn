"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { QuickStatsCard } from "@/components/teacher/dashboard/QuickStatsCard";
import { StudentGrid } from "@/components/teacher/dashboard/StudentGrid";
import { CreateCurriculumFAB } from "@/components/teacher/dashboard/CreateCurriculumFAB";
import { getMyClasses } from "@/lib/api/classes";
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
  const [classes, setClasses] = useState<any[]>([]);
  const [curricula, setCurricula] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      // Wait for auth to complete
      if (authLoading) {
        return;
      }

      // If no user and no token in storage, we're definitely not logged in
      if (!user && !localStorage.getItem('auth_token')) {
        setLoading(false);
        return;
      }

      // If we have a token but no user yet, AuthContext is still loading
      if (!user) {
        return;
      }

      try {
        setError(null);
        console.log('Loading dashboard data for user:', user.uid);
        console.log('Auth token:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');

        // Fetch teacher's classes only (skip curricula for now due to auth issues)
        const classesData = await getMyClasses();
        
        console.log('Classes:', classesData);

        setClasses(classesData || []);
        setCurricula([]); // TODO: Fix curricula endpoint authentication

        // Fetch student details for all students across all classes
        const studentIdSet = new Set<string>();
        (classesData || []).forEach((classItem: any) => {
          (classItem.studentIds || []).forEach((id: string) => studentIdSet.add(id));
        });

        const studentIds = Array.from(studentIdSet);
        console.log('Student IDs:', studentIds);
        
        if (studentIds.length > 0) {
          // Fetch user details for all students
          const studentPromises = studentIds.map(async (studentId) => {
            try {
              const response = await apiClient.get(`/api/v1/users/${studentId}`);
              return response.data.data || response.data; // Handle both wrapped and unwrapped responses
            } catch (error) {
              console.error(`Error fetching student ${studentId}:`, error);
              return null;
            }
          });

          const studentData = await Promise.all(studentPromises);
          console.log('Student data:', studentData);
          
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

  if (authLoading || loading) {
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
          curricula={curricula}
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
