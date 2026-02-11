"use client";

import { Card } from "@/components/ui/Card";

interface XPTrackerProps {
  label: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  averageScore: number;
  colorScheme?: "primary" | "secondary";
}

const colorSchemes = {
  primary: {
    card: "from-purple-500 to-blue-600",
    bar: "from-yellow-300 to-orange-400",
    accent: "text-yellow-300",
  },
  secondary: {
    card: "from-green-500 to-teal-600",
    bar: "from-emerald-300 to-green-400",
    accent: "text-emerald-300",
  },
};

export function XPTracker({
  label,
  level,
  currentXP,
  xpToNextLevel,
  totalXP,
  averageScore,
  colorScheme = "primary",
}: XPTrackerProps) {
  const progress = xpToNextLevel > 0 ? (currentXP / xpToNextLevel) * 100 : 0;
  const xpNeeded = xpToNextLevel - currentXP;
  const colors = colorSchemes[colorScheme];

  return (
    <Card className={`p-6 bg-gradient-to-br ${colors.card} border-0 shadow-2xl`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-fredoka text-2xl font-bold text-white mb-1">
            ⭐ Level {level}
          </h3>
          <p className="font-nunito text-white/90">
            {xpNeeded} XP until Level {level + 1}!
          </p>
        </div>
        <div className="text-right">
          <div className={`font-fredoka text-3xl font-bold ${colors.accent}`}>
            {currentXP}
          </div>
          <div className="font-nunito text-white/80 text-sm">
            / {xpToNextLevel} XP
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-6 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${colors.bar} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-fredoka text-sm font-bold text-white drop-shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <span className="font-nunito text-white/90">
            Total: {totalXP} XP earned!
          </span>
        </div>
        {averageScore > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <span className="font-fredoka text-xl font-bold text-white">
              {averageScore}%
            </span>
            <span className="font-nunito text-white/80 text-sm">avg</span>
          </div>
        )}
      </div>
    </Card>
  );
}
