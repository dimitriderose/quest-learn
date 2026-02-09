"use client";

import { useEffect, useState, useRef } from "react";
import { progressApi } from "@/lib/api/progress";

interface QuestPlayerProps {
  questId: string;
  studentId: string;
  curriculumId: string;
  classId: string;
  onComplete?: () => void;
}

export function QuestPlayer({ 
  questId, 
  studentId, 
  curriculumId,
  classId,
  onComplete 
}: QuestPlayerProps) {
  const [questUrl, setQuestUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Use the backend API endpoint for quest HTML
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      setIsLoading(false);
      return;
    }
    const url = `${apiUrl}/api/v1/quests/${questId}/html`;
    setQuestUrl(url);
    setIsLoading(false);
  }, [questId]);

  useEffect(() => {
    const handleQuestComplete = async (event: MessageEvent) => {
      if (event.data.type !== 'QUEST_COMPLETE') return;

      const data = event.data;
      console.log('Quest completion data received:', data);

      const attempts = data.attempts || 1;
      const timeSpentMinutes = Math.round((data.timeSpent || 0) / 60);
      const hintsUsed = data.hintsUsed || 0;

      try {
        await progressApi.recordQuestCompletion({
          studentId,
          curriculumId,
          questId,
          classId,
          questTitle: data.questTitle || 'Quest',
          questNumber: data.questNumber || 1,
          score: data.score || 0,
          attempts,
          timeSpentMinutes,
          hintsUsed,
          tutorialsViewed: data.tutorialsViewed || 0,
          tutorialStylesViewed: data.tutorialStylesViewed || [],
          completedChallenges: data.completedChallenges || 0,
          skippedChallenges: data.skippedChallenges || 0,
          totalChallenges: data.totalChallenges || 1,
          challengeResults: data.challengeResults || [],
        });

        console.log('Quest completion recorded successfully');
        onComplete?.();
      } catch (error) {
        console.error('Failed to record quest completion:', error);
      }
    };

    window.addEventListener('message', handleQuestComplete);
    return () => window.removeEventListener('message', handleQuestComplete);
  }, [studentId, curriculumId, classId, questId, onComplete]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading quest...</div>
      </div>
    );
  }

  if (!questUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">Error: API URL not configured</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <iframe
        ref={iframeRef}
        src={questUrl}
        className="w-full h-full border-0"
        title="Quest"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
