"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  id: string;
  status: "on-track" | "struggling" | "excelling";
}

interface Quest {
  id: string;
  title: string;
}

interface QuickStatsCardProps {
  students: Student[];
  quests: Quest[];
}

export function QuickStatsCard({ students, quests }: QuickStatsCardProps) {
  const totalStudents = students.length;
  const struggling = students.filter(s => s.status === "struggling").length;
  const onTrack = students.filter(s => s.status === "on-track").length;
  const excelling = students.filter(s => s.status === "excelling").length;
  
  const completionRate = totalStudents > 0 
    ? Math.round(((onTrack + excelling) / totalStudents) * 100)
    : 0;

  const activeQuests = quests.length;
  const questTitles = quests.slice(0, 2).map(q => q.title).join(", ");
  const moreCount = quests.length > 2 ? ` +${quests.length - 2} more` : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Students</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents}</div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Quests</div>
        <div className="text-3xl font-bold text-teacher-primary">{activeQuests}</div>
        {activeQuests > 0 && (
          <div className="text-xs text-gray-500 mt-1 truncate" title={quests.map(q => q.title).join(", ")}>
            {questTitles}{moreCount}
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
