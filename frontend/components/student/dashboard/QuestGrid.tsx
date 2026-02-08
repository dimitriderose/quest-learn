"use client";

import { QuestCard } from "./QuestCard";

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

interface QuestGridProps {
  quests: Quest[];
}

export function QuestGrid({ quests }: QuestGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
}
