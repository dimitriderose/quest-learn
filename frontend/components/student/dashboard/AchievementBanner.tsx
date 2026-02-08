"use client";

import { Card } from "@/components/ui/Card";

export function AchievementBanner() {
  // This would be dynamic based on recent achievements
  const recentAchievement = {
    title: "First Steps!",
    description: "Completed your first quest",
    icon: "🎉",
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-xl mb-6">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{recentAchievement.icon}</div>
        <div className="flex-1">
          <h3 className="font-fredoka text-xl font-bold text-white">
            Achievement Unlocked!
          </h3>
          <p className="font-nunito text-white/90">
            {recentAchievement.title}: {recentAchievement.description}
          </p>
        </div>
        <button className="font-fredoka bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
          View All
        </button>
      </div>
    </Card>
  );
}
