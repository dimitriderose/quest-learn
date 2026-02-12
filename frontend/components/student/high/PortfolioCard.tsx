"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Student {
  portfolioPieces: number;
  articlesPublished: number;
}

interface PortfolioCardProps {
  student: Student;
  averageGrade: string;
  totalXP: number;
  completedQuests: number;
  totalQuests: number;
}

export function PortfolioCard({ student, averageGrade, totalXP, completedQuests, totalQuests }: PortfolioCardProps) {
  const remaining = totalQuests - completedQuests;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white">
            Your Portfolio
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your academic progress
          </p>
        </div>
        <Button variant="primary">View Portfolio</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {student.portfolioPieces}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Portfolio Pieces
          </div>
        </div>
        <div className="border-l-4 border-green-500 pl-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {student.articlesPublished}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Published
          </div>
        </div>
        <div className="border-l-4 border-purple-500 pl-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {averageGrade}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Average Grade
          </div>
        </div>
        <div className="border-l-4 border-orange-500 pl-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalXP.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total XP
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              Next Milestone
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {remaining > 0
                ? `Complete ${remaining} more portfolio piece${remaining !== 1 ? "s" : ""} to finish all assignments`
                : "All assignments completed! Great work!"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
