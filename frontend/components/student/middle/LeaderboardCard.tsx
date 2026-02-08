"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  name: string;
  rank: number;
}

interface LeaderboardCardProps {
  student: Student;
}

export function LeaderboardCard({ student }: LeaderboardCardProps) {
  const topStudents = [
    { name: "Alex M.", xp: 2890, trend: "up" },
    { name: "Sam K.", xp: 2650, trend: "up" },
    { name: student.name, xp: 2450, trend: "same" },
    { name: "Riley P.", xp: 2340, trend: "down" },
    { name: "Casey L.", xp: 2180, trend: "up" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-4">
        Class Leaderboard
      </h3>
      
      <div className="space-y-3">
        {topStudents.map((student, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              index === 2
                ? "bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500"
                : "bg-gray-50 dark:bg-gray-800"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
              #{index + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                {student.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {student.xp} XP
              </div>
            </div>
            <div className="text-lg">
              {student.trend === "up" && "↑"}
              {student.trend === "down" && "↓"}
              {student.trend === "same" && "→"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
