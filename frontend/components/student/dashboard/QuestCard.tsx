"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Quest {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: "completed" | "in-progress" | "locked";
  score?: number;
  stars?: number;
  xpEarned?: number;
  progress?: number;
  attempts?: number;
  isFinal?: boolean;
}

interface QuestCardProps {
  quest: Quest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const isLocked = quest.status === "locked";
  const isCompleted = quest.status === "completed";
  const isInProgress = quest.status === "in-progress";

  const cardStyle = quest.isFinal
    ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
    : isCompleted
    ? "bg-gradient-to-br from-green-400 to-emerald-600"
    : isInProgress
    ? "bg-gradient-to-br from-blue-400 to-purple-600"
    : "bg-gray-400";

  return (
    <Card
      className={`p-6 border-0 shadow-xl ${cardStyle} ${!isLocked && "hover:scale-105"} transition-all duration-300 relative overflow-hidden`}
    >
      {/* Quest Number Badge */}
      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center font-fredoka font-bold text-white text-lg">
        {quest.number}
      </div>

      {/* Lock Icon Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <span className="text-6xl">🔒</span>
        </div>
      )}

      {/* Icon */}
      <div className="text-6xl mb-4">{quest.icon}</div>

      {/* Title */}
      <h3 className="font-fredoka text-2xl font-bold text-white mb-2">
        {quest.title}
      </h3>

      {/* Description */}
      <p className="font-nunito text-white/90 mb-4 min-h-[48px]">
        {quest.description}
      </p>

      {/* Completed State */}
      {isCompleted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white/20 rounded-lg px-3 py-2">
            <span className="font-nunito text-white">Score</span>
            <span className="font-fredoka text-xl font-bold text-white">
              {quest.score}%
            </span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`text-2xl ${star <= (quest.stars || 0) ? "" : "opacity-30"}`}
              >
                ⭐
              </span>
            ))}
          </div>
          <div className="text-center font-nunito text-white/90 text-sm">
            +{quest.xpEarned} XP earned!
          </div>
          <Link href={`/student/quest/${quest.id}`}>
            <Button variant="secondary" className="w-full">
              ▶️ Play Again
            </Button>
          </Link>
        </div>
      )}

      {/* In Progress State */}
      {isInProgress && (
        <div className="space-y-3">
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${quest.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-white/90 text-sm font-nunito">
            <span>{quest.progress}% complete</span>
            <span>Attempt {quest.attempts}</span>
          </div>
          <Link href={`/student/quest/${quest.id}`}>
            <Button variant="hero" className="w-full font-fredoka">
              ▶️ Continue Quest!
            </Button>
          </Link>
        </div>
      )}

      {/* Locked State */}
      {isLocked && !quest.isFinal && (
        <div className="text-center">
          <p className="font-nunito text-white/70 text-sm">
            Complete previous quests to unlock
          </p>
        </div>
      )}

      {/* Final Quest Locked */}
      {isLocked && quest.isFinal && (
        <div className="text-center">
          <p className="font-fredoka text-white text-lg font-bold">
            🏆 Final Challenge!
          </p>
          <p className="font-nunito text-white/90 text-sm mt-2">
            Complete all 6 quests to unlock
          </p>
        </div>
      )}
    </Card>
  );
}
