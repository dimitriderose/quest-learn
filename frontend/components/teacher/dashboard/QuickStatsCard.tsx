"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  id: string;
  status: "on-track" | "struggling" | "excelling";
}

interface Curriculum {
  id: string;
  name: string;
}

interface QuickStatsCardProps {
  students: Student[];
  curricula: Curriculum[];
}

export function QuickStatsCard({ students, curricula }: QuickStatsCardProps) {
  const totalStudents = students.length;
  const struggling = students.filter(s => s.status === "struggling").length;
  const onTrack = students.filter(s => s.status === "on-track").length;
  const excelling = students.filter(s => s.status === "excelling").length;
  
  const completionRate = totalStudents > 0 
    ? Math.round(((onTrack + excelling) / totalStudents) * 100)
    : 0;

  const activeCurricula = curricula.length;
  const curriculaNames = curricula.slice(0, 2).map(c => c.name).join(", ");
  const moreCount = curricula.length > 2 ? ` +${curricula.length - 2} more` : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Curricula</div>
        <div className="text-3xl font-bold text-teacher-primary">{activeCurricula}</div>
        {activeCurricula > 0 && (
          <div className="text-xs text-gray-500 mt-1 truncate" title={curricula.map(c => c.name).join(", ")}>
            {curriculaNames}{moreCount}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
        <div className="text-3xl font-bold text-green-600">
          {totalStudents > 0 ? `${completionRate}%` : "—"}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Need Attention</div>
        <div className="text-3xl font-bold text-red-600">{struggling}</div>
        <div className="text-xs text-gray-500 mt-1">{struggling} students struggling</div>
      </Card>
    </div>
  );
}
