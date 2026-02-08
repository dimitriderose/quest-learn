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
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{student.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-teacher-primary h-2 rounded-full transition-all"
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>
          
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
