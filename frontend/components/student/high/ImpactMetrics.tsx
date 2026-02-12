"use client";

import { Card } from "@/components/ui/Card";

interface ImpactMetricsProps {
  totalXP: number;
  averageScore: number;
  completedQuests: number;
  totalQuests: number;
}

export function ImpactMetrics({ totalXP, averageScore, completedQuests, totalQuests }: ImpactMetricsProps) {
  return (
    <Card className="p-6">
      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-4">
        Impact Metrics
      </h3>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total XP Earned
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalXP.toLocaleString()}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Average Score
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              style={{ width: `${averageScore}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {averageScore}% average score
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Progress Summary
          </div>
          <div className="space-y-2">
            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {completedQuests} of {totalQuests} projects completed
            </div>
            {averageScore >= 80 && (
              <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                Strong performance - keep it up!
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
