"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  id: string;
  status: "on-track" | "struggling" | "excelling";
}

interface QuickStatsCardProps {
  students: Student[];
}

export function QuickStatsCard({ students }: QuickStatsCardProps) {
  const totalStudents = students.length;
  const struggling = students.filter(s => s.status === "struggling").length;
  const onTrack = students.filter(s => s.status === "on-track").length;
  const excelling = students.filter(s => s.status === "excelling").length;
  
  const completionRate = Math.round(((onTrack + excelling) / totalStudents) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Curricula</div>
        <div className="text-3xl font-bold text-teacher-primary">1</div>
        <div className="text-xs text-gray-500 mt-1">Photosynthesis</div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
        <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Need Attention</div>
        <div className="text-3xl font-bold text-red-600">{struggling}</div>
        <div className="text-xs text-gray-500 mt-1">{struggling} students struggling</div>
      </Card>
    </div>
  );
}
