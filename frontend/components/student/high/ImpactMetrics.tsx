"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  avgReadership: number;
}

interface ImpactMetricsProps {
  student: Student;
}

export function ImpactMetrics({ student }: ImpactMetricsProps) {
  return (
    <Card className="p-6">
      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-4">
        Impact Metrics
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Readership
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            1,247
          </div>
          <div className="text-xs text-green-600 mt-1">
            ↑ +23% this week
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Engagement Rate
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              style={{ width: "78%" }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            78% engagement
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Recent Feedback
          </div>
          <div className="space-y-2">
            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
              “Excellent investigative work”
            </div>
            <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
              “Strong source verification”
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
