"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { QuickStatsCard } from "@/components/teacher/dashboard/QuickStatsCard";
import { StudentGrid } from "@/components/teacher/dashboard/StudentGrid";
import { CreateCurriculumFAB } from "@/components/teacher/dashboard/CreateCurriculumFAB";

// Mock data for demo - will connect to backend later
const mockStudents = [
  {
    id: "1",
    name: "Marcus Johnson",
    avatar: "MJ",
    currentQuest: "Quest 3: The Green Machine",
    progress: 67,
    status: "on-track" as const,
    lastActive: "2 minutes ago",
  },
  {
    id: "2",
    name: "Emma Rodriguez",
    avatar: "ER",
    currentQuest: "Quest 5: Energy Detective",
    progress: 92,
    status: "excelling" as const,
    lastActive: "5 minutes ago",
  },
  {
    id: "3",
    name: "Jamal Williams",
    avatar: "JW",
    currentQuest: "Quest 2: Three Ingredients",
    progress: 34,
    status: "struggling" as const,
    lastActive: "15 minutes ago",
  },
  {
    id: "4",
    name: "Sofia Chen",
    avatar: "SC",
    currentQuest: "Quest 4: What Plants Make",
    progress: 78,
    status: "on-track" as const,
    lastActive: "1 hour ago",
  },
  {
    id: "5",
    name: "David Kim",
    avatar: "DK",
    currentQuest: "Quest 1: Mystery Begins",
    progress: 23,
    status: "struggling" as const,
    lastActive: "30 minutes ago",
  },
  {
    id: "6",
    name: "Aaliyah Thompson",
    avatar: "AT",
    currentQuest: "Quest 6: Real-World Doctor",
    progress: 88,
    status: "on-track" as const,
    lastActive: "10 minutes ago",
  },
];

export default function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-merriweather text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor your students' progress in real-time
          </p>
        </div>

        <QuickStatsCard students={mockStudents} />

        <div className="mt-8">
          <StudentGrid
            students={mockStudents}
            onStudentClick={setSelectedStudent}
          />
        </div>
      </main>

      <CreateCurriculumFAB />
    </div>
  );
}
