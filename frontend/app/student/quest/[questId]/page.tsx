"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { QuestPlayer } from "@/components/student/quest/QuestPlayer";
import { getQuest } from "@/lib/api/quests";

interface QuestDetails {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  curriculumId?: string;
  curriculum?: {
    id: string;
    name: string;
  };
}

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questId = params.questId as string;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quest, setQuest] = useState<QuestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get student info from auth context
  const studentId = user?.uid || "";
  const studentName = user?.displayName || user?.email?.split('@')[0] || "Student";

  useEffect(() => {
    async function loadQuest() {
      console.log("Loading quest:", questId);
      try {
        const questData = await getQuest(questId);
        console.log("Quest data received:", questData);
        
        setQuest({
          id: questData.id,
          title: questData.title,
          description: questData.description,
          subject: questData.subject,
          gradeLevel: questData.gradeLevel,
          curriculumId: (questData as any).curriculumId, // Backend returns curriculumId directly
          curriculum: questData.curriculum ? {
            id: questData.curriculum.id,
            name: questData.curriculum.name,
          } : undefined,
        });
        
        // Update browser tab title
        document.title = `${questData.title} - QuestLearn`;
      } catch (error) {
        console.error("Error loading quest:", error);
        setError("Failed to load quest. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadQuest();
  }, [questId]);

  const handleQuestComplete = () => {
    // Show completion animation/modal
    setTimeout(() => {
      router.push("/student/dashboard");
    }, 2000);
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-white font-fredoka text-2xl mb-4">😞 Oops!</h1>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="px-6 py-3 bg-student-purple text-white rounded-lg font-semibold hover:bg-student-purple/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Exit quest"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div>
            <h1 className="text-white font-fredoka text-xl">
              {loading ? "Loading..." : quest?.title || "Quest"}
            </h1>
            {quest?.curriculum && (
              <p className="text-white/60 text-sm">
                {quest.curriculum.name}
              </p>
            )}
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-white/80 text-sm">
            👤 {studentName}
          </div>
          {quest && (
            <div className="text-white/80 text-sm">
              {quest.subject} • Grade {quest.gradeLevel}
            </div>
          )}
          <div className="text-white/60 text-sm">In Progress</div>
        </div>
      </div>

      {/* Quest Player */}
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-student-purple mx-auto mb-4" />
              <p className="text-white font-fredoka text-xl">Loading Quest...</p>
            </div>
          </div>
        ) : (
          <QuestPlayer 
            questId={questId}
            studentId={studentId}
            curriculumId={quest?.curriculumId || quest?.curriculum?.id || ""}
            onComplete={handleQuestComplete}
          />
        )}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4">
            <h2 className="font-fredoka text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Exit Quest?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your progress is saved, {studentName}. Continue later from where you left off.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Keep Playing
              </button>
              <button
                onClick={() => router.push("/student/dashboard")}
                className="flex-1 px-4 py-3 bg-student-purple text-white rounded-lg font-semibold hover:bg-student-purple/90"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
