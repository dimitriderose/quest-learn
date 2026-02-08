"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Challenge {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: "completed" | "in-progress" | "locked";
  score?: number;
  mastery?: number;
  xpEarned?: number;
  progress?: number;
  currentMastery?: number;
  isFinal?: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isLocked = challenge.status === "locked";
  const isCompleted = challenge.status === "completed";
  const isInProgress = challenge.status === "in-progress";

  return (
    <Card
      hover={!isLocked}
      className={`p-6 relative ${
        isLocked ? "opacity-60" : ""
      } ${challenge.isFinal ? "border-2 border-yellow-500" : ""}`}
    >
      {isLocked && (
        <div className="absolute top-4 right-4 text-3xl opacity-50">
          🔒
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{challenge.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              CHALLENGE {challenge.number}
            </span>
            {challenge.isFinal && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                FINAL
              </span>
            )}
          </div>
          <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white">
            {challenge.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {challenge.description}
      </p>

      {isCompleted && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenge.score}%
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Mastery</div>
              <div className="text-2xl font-bold text-indigo-600">
                {challenge.mastery}%
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            +{challenge.xpEarned} XP earned
          </div>
          <Link href={`/student/middle/challenge/${challenge.id}`}>
            <Button variant="secondary" className="w-full">
              Review
            </Button>
          </Link>
        </div>
      )}

      {isInProgress && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {challenge.progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all"
                style={{ width: `${challenge.progress}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Mastery: {challenge.currentMastery}%
          </div>
          <Link href={`/student/middle/challenge/${challenge.id}`}>
            <Button variant="hero" className="w-full">
              Continue Challenge
            </Button>
          </Link>
        </div>
      )}

      {isLocked && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Complete previous challenges to unlock
        </div>
      )}
    </Card>
  );
}
