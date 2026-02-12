"use client";

import { Card } from "@/components/ui/Card";

interface LeaderboardCardProps {
  student: {
    name: string;
  };
  totalXP: number;
  level: number;
  averageScore: number;
  completedQuests: number;
}

export function LeaderboardCard({ student, totalXP, level, averageScore, completedQuests }: LeaderboardCardProps) {
  const stats = [
    { label: "Total XP", value: totalXP.toLocaleString(), icon: "⚡" },
    { label: "Level", value: level, icon: "🔨" },
    { label: "Avg Score", value: `${averageScore}%`, icon: "🎯" },
    { label: "Quests Done", value: completedQuests, icon: "✅" },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-4">
        Your Forge Progress
      </h3>

      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-lg">
              {stat.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
              <div className="font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
