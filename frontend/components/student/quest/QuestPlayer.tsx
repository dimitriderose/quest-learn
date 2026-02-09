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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    const url = `${apiUrl}/api/v1/quests/${questId}/html`;
    setQuestUrl(url);
    setIsLoading(false);
  }, [questId]);

  useEffect(() => {
    const handleQuestComplete = async (event: MessageEvent) => {
      console.log('QuestPlayer received message:', event.data);

      // The message might be wrapped in a data property
      const messageData = event.data.data || event.data;
      const messageType = messageData.type;

      if (messageType !== 'QUEST_COMPLETE') return;

      console.log('Quest completion data received:', messageData);

      const attempts = messageData.attempts || 1;
      const timeSpentMinutes = Math.round((messageData.timeSpent || 0) / 60);
      const hintsUsed = messageData.hintsUsed || 0;

      try {
        await progressApi.recordQuestCompletion({
          studentId,
          curriculumId,
          questId,
          classId,
          questTitle: messageData.questTitle || 'Quest',
          questNumber: messageData.questNumber || 1,
          score: messageData.score || 0,
          attempts,
          timeSpentMinutes,
          hintsUsed,
          tutorialsViewed: messageData.tutorialsViewed || 0,
          tutorialStylesViewed: messageData.tutorialStylesViewed || [],
          completedChallenges: messageData.completedChallenges || 0,
          skippedChallenges: messageData.skippedChallenges || 0,
          totalChallenges: messageData.totalChallenges || 1,
          challengeResults: messageData.challengeResults || [],
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
