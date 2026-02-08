"use client";

import { useParams, useRouter } from "next/navigation";
import { QuestPlayer } from "@/components/student/quest/QuestPlayer";
import { useEffect, useState } from "react";

const questModules: Record<string, { title: string; filename: string }> = {
  "1": { title: "The Mystery Begins", filename: "quest1_mystery_begins.html" },
  "2": { title: "The Three Ingredients", filename: "quest2_three_ingredients.html" },
  "3": { title: "The Green Machine", filename: "quest3_green_machine.html" },
  "4": { title: "What Do Plants Make?", filename: "quest4_what_plants_make.html" },
  "5": { title: "Energy Detective", filename: "quest5_energy_detective.html" },
  "6": { title: "Real-World Plant Doctor", filename: "quest6_real_world_doctor.html" },
  "7": { title: "Save the Forest!", filename: "quest7_final_mission.html" },
};

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params.questId as string;
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const quest = questModules[questId];

  useEffect(() => {
    if (!quest) {
      router.push("/student/dashboard");
    }
  }, [quest, router]);

  if (!quest) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-white font-fredoka text-xl">{quest.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white/60 text-sm">Quest {questId} of 7</div>
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-student-purple to-student-teal h-2 rounded-full"
              style={{ width: `${(parseInt(questId) / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1">
        <QuestPlayer questId={questId} filename={quest.filename} />
      </div>

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
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold"
              >
                Keep Playing
              </button>
              <button
                onClick={() => router.push("/student/dashboard")}
                className="flex-1 px-4 py-3 bg-student-purple text-white rounded-lg font-semibold"
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
