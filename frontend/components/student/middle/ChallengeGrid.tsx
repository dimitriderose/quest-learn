"use client";

import { ChallengeCard } from "./ChallengeCard";

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

interface ChallengeGridProps {
  challenges: Challenge[];
}

export function ChallengeGrid({ challenges }: ChallengeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {challenges.map((challenge) => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}
