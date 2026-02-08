"use client";

import { Card } from "@/components/ui/Card";

interface Student {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
}

interface XPTrackerProps {
  student: Student;
}

export function XPTracker({ student }: XPTrackerProps) {
  const progress = (student.currentXP / student.xpToNextLevel) * 100;
  const xpNeeded = student.xpToNextLevel - student.currentXP;

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500 to-blue-600 border-0 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-fredoka text-2xl font-bold text-white mb-1">
            ⭐ Level {student.level}
          </h3>
          <p className="font-nunito text-white/90">
            {xpNeeded} XP until Level {student.level + 1}!
          </p>
        </div>
        <div className="text-right">
          <div className="font-fredoka text-3xl font-bold text-yellow-300">
            {student.currentXP}
          </div>
          <div className="font-nunito text-white/80 text-sm">
            / {student.xpToNextLevel} XP
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-6 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-fredoka text-sm font-bold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-2xl">💎</span>
        <span className="font-nunito text-white/90">
          Total: {student.totalXP} XP earned!
        </span>
      </div>
    </Card>
  );
}
