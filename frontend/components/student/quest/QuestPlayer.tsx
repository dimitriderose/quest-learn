"use client";

import { useRef, useState, useEffect } from "react";
import { progressApi } from "@/lib/api/progress";

interface QuestPlayerProps {
  questId: string;
  studentId: string;
  curriculumId: string;
  onComplete?: () => void;
}

export function QuestPlayer({ 
  questId, 
  studentId, 
  curriculumId,
  onComplete 
}: QuestPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track quest session
  const [startTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [answersShown, setAnswersShown] = useState(0);

  // Handle messages from quest iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const { type, data } = event.data;
      const normalizedType = type?.toLowerCase().replace(/_/g, '');

      switch (normalizedType) {
        case 'validateanswer':
          await handleValidateAnswer(data);
          break;
        
        case 'hintused':
          setHintsUsed(prev => prev + 1);
          break;
        
        case 'questcomplete':
          await handleQuestComplete(data);
          break;
        
        case 'answershown':
          setAnswersShown(prev => prev + 1);
          break;
        
        case 'error':
          console.error('Quest error:', data);
          setError(data.message || 'An error occurred in the quest');
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [questId, studentId, curriculumId, attempts, hintsUsed]);

  const handleValidateAnswer = async (data: any) => {
    try {
      setAttempts(prev => prev + 1);
      
      const result = await progressApi.validateAnswer({
        studentId,
        curriculumId,
        questId,
        challengeId: data.challengeId,
        answer: data.answer,
        expectedAnswer: data.expectedAnswer,
        validationType: data.validationType || 'exact_match',
        hintsUsed,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
      });

      iframeRef.current?.contentWindow?.postMessage({
        type: 'validationResult',
        data: result,
      }, '*');

    } catch (error) {
      console.error('Validation error:', error);
      iframeRef.current?.contentWindow?.postMessage({
        type: 'validationResult',
        data: {
          correct: false,
          feedback: 'Unable to validate answer. Please try again.',
          score: 0,
        },
      }, '*');
    }
  };

  const handleQuestComplete = async (data: any) => {
    try {
      const timeSpentMinutes = Math.floor((Date.now() - startTime) / 60000);
      
      await progressApi.recordQuestCompletion({
        studentId,
        curriculumId,
        questId,
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

      onComplete?.();

    } catch (error) {
      console.error('Error recording completion:', error);
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-white font-fredoka text-2xl mb-2">Configuration Required</h2>
          <p className="text-white/80">API URL not configured. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-student-purple mx-auto mb-4" />
            <p className="text-white font-fredoka text-xl">Loading Quest...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md mx-4">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-white font-fredoka text-2xl mb-2">Oops!</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-student-purple text-white rounded-lg font-semibold hover:bg-student-purple/90"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={`${apiUrl}/api/v1/quests/${questId}/html`}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError("Failed to load quest. Please try again.");
        }}
        title={`Quest ${questId}`}
        sandbox="allow-scripts allow-same-origin allow-forms"
        allow="fullscreen"
      />
    </div>
  );
}
