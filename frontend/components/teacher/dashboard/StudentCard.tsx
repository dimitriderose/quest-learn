"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  id: string;
  name: string;
  avatar: string;
  currentQuest: string;
  progress: number;
  status: "on-track" | "struggling" | "excelling";
  lastActive: string;
  totalXP?: number;
  completedQuests?: number;
  averageScore?: number;
  tutorialStatus?: string | null;
}

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  const statusColors = {
    "on-track": "bg-green-500",
    struggling: "bg-red-500",
    excelling: "bg-blue-500",
  };

  const statusLabels = {
    "on-track": "On Track",
    struggling: "Needs Help",
    excelling: "Excelling",
  };

  return (
    <Card
      hover
      className="p-6 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-student-purple text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
          {student.avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {student.name}
            </h3>
            <div className={`w-3 h-3 rounded-full ${statusColors[student.status]} flex-shrink-0`} />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
            {student.currentQuest}
          </p>

          {/* Tutorial Status Badge */}
          {student.tutorialStatus && (
            <div className="mt-2">
              {(student.tutorialStatus === "pending" || student.tutorialStatus === "generating") && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Tutorial in Progress
                </span>
              )}
              {student.tutorialStatus === "failed" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Tutorial Failed
                </span>
              )}
              {student.tutorialStatus === "exhausted" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Needs Intervention
                </span>
              )}
            </div>
          )}

          {/* XP and Quests Completed */}
          {(student.totalXP !== undefined || student.completedQuests !== undefined) && (
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {student.totalXP !== undefined && (
                <span className="flex items-center gap-1">
                  ⭐ <strong>{student.totalXP}</strong> XP
                </span>
              )}
              {student.completedQuests !== undefined && (
                <span className="flex items-center gap-1">
                  ✓ <strong>{student.completedQuests}</strong> quest{student.completedQuests !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          
          {/* Average Score */}
          {student.averageScore !== undefined && student.averageScore > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Average Score</span>
                <span className="font-semibold">{student.averageScore}%</span>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Overall Progress</span>
              <span>{student.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-teacher-primary h-2 rounded-full transition-all"
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>
          
          {/* Status and Last Active */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className={`font-semibold ${
              student.status === "struggling"
                ? "text-red-600"
                : student.status === "excelling"
                ? "text-blue-600"
                : "text-green-600"
            }`}>
              {statusLabels[student.status]}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {student.lastActive}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
