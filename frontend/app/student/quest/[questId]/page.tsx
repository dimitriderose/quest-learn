"use client";

import { useParams, useRouter } from "next/navigation";
import { QuestPlayer } from "@/components/student/quest/QuestPlayer";
import { useState } from "react";

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // TODO: Get studentId and curriculumId from auth context
  const studentId = "student-123"; // Placeholder
  const curriculumId = "curriculum-456"; // Placeholder

  const handleQuestComplete = () => {
    // Show completion animation/modal
    setTimeout(() => {
      router.push("/student/dashboard");
    }, 2000);
  };

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
          <h1 className="text-white font-fredoka text-xl">Quest {questId}</h1>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="text-white/60 text-sm">In Progress</div>
        </div>
      </div>

      {/* Quest Player */}
      <div className="flex-1">
        <QuestPlayer 
          questId={questId}
          studentId={studentId}
          curriculumId={curriculumId}
          onComplete={handleQuestComplete}
        />
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4">
            <h2 className="font-fredoka text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Exit Quest?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your progress is saved. Continue later from where you left off.
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
