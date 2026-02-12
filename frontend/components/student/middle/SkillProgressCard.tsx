"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

interface SkillProgressCardProps {
  student: Student;
  mastery: number;
  accuracy: number;
  completedQuests: number;
}

export function SkillProgressCard({ student, mastery, accuracy, completedQuests }: SkillProgressCardProps) {
  const progress = (student.currentXP / student.xpToNextLevel) * 100;
  const xpNeeded = student.xpToNextLevel - student.currentXP;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white">
            Skill Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {xpNeeded} XP to Level {student.level + 1}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {student.currentXP}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            / {student.xpToNextLevel} XP
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Level {student.level}</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mastery</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{mastery}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{accuracy}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Quests</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedQuests}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
