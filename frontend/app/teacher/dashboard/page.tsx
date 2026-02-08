"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { QuickStatsCard } from "@/components/teacher/dashboard/QuickStatsCard";
import { StudentGrid } from "@/components/teacher/dashboard/StudentGrid";
import { CreateCurriculumFAB } from "@/components/teacher/dashboard/CreateCurriculumFAB";
import { getMyClasses } from "@/lib/api/classes";

interface Student {
  id: string;
  name: string;
  avatar: string;
  currentQuest: string;
  progress: number;
  status: "on-track" | "excelling" | "struggling";
  lastActive: string;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        // Fetch teacher's classes
        const classesData = await getMyClasses();
        setClasses(classesData);

        // Convert class roster to student format for display
        const allStudents: Student[] = [];
        
        classesData.forEach((classItem) => {
          // For now, create placeholder students from studentIds
          // In production, we'd fetch actual student details
          classItem.studentIds?.forEach((studentId: string, index: number) => {
            allStudents.push({
              id: studentId,
              name: `Student ${studentId.slice(0, 8)}`, // Placeholder - would fetch real name
              avatar: `S${index + 1}`,
              currentQuest: "No quest assigned",
              progress: 0,
              status: "on-track",
              lastActive: "Not tracked yet",
            });
          });
        });

        setStudents(allStudents);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teacher-teal mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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

        <QuickStatsCard students={students} />

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
