"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { StudentHeader } from "@/components/student/dashboard/StudentHeader";
import { XPTracker } from "@/components/student/dashboard/XPTracker";
import { QuestGrid } from "@/components/student/dashboard/QuestGrid";
import { QuestHistory } from "@/components/student/dashboard/QuestHistory";
import { AchievementBanner } from "@/components/student/dashboard/AchievementBanner";
import { CurriculumSection } from "@/components/student/dashboard/CurriculumSection";
import {
  getMyCurricula,
  StudentQuestDto,
  StudentCurriculumDto,
} from "@/lib/api/studentQuests";
import { progressApi, StudentProgress, DashboardStats } from "@/lib/api/progress";

function convertToQuestFormat(quests: StudentQuestDto[]) {
  return quests.map((quest, index) => ({
    id: quest.questId,
    number: index + 1,
    title: quest.title,
    description: quest.description,
    icon: getIconForSubject(quest.subject),
    status: "available" as const,
    className: quest.className,
    classId: quest.classId,
    subject: quest.subject,
    gradeLevel: quest.gradeLevel,
    dueDate: quest.dueDate,
    xpReward: quest.xpReward,
    playUrl: quest.playUrl,
  }));
}

function getIconForSubject(subject: string): string {
  const icons: Record<string, string> = {
    Science: "🔬",
    Math: "🔢",
    "English Language Arts": "📚",
    "Social Studies": "🌍",
    History: "📜",
    Geography: "🗺️",
    Art: "🎨",
    Music: "🎵",
    "Physical Education": "⚽",
  };
  return icons[subject] || "📖";
}

export default function ElementaryDashboard() {
  const { user } = useAuth();
  const [curricula, setCurricula] = useState<StudentCurriculumDto[]>([]);
  const [standaloneQuests, setStandaloneQuests] = useState<any[]>([]);
  const [allProgress, setAllProgress] = useState<StudentProgress[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const student = {
    name: user?.displayName || user?.email?.split('@')[0] || "Student",
    level: dashboardStats?.classLevel ?? 1,
    avatar: "🌟",
  };

  useEffect(() => {
    async function loadData() {
      try {
        const curriculaPromise = getMyCurricula();
        const progressPromise = user?.uid
          ? progressApi.getAllProgress(user.uid, user.classId)
          : Promise.resolve([]);
        const statsPromise = user?.uid
          ? progressApi.getDashboardStats(user.uid, user.classId)
          : Promise.resolve(null);

        const [curriculaData, progressData, stats] = await Promise.all([
          curriculaPromise,
          progressPromise,
          statsPromise,
        ]);

        setCurricula(curriculaData.curricula);
        setStandaloneQuests(convertToQuestFormat(curriculaData.standaloneQuests));
        setAllProgress(progressData);
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error loading data:", error);
        setCurricula([]);
        setStandaloneQuests([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-purple via-student-teal to-student-yellow dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <StudentHeader student={student} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AchievementBanner />

        {/* Class Progress Section (Main/Top) */}
        <div className="mb-6">
          <h2 className="font-fredoka text-2xl font-bold text-white mb-4 text-center">
            🏫 Class Progress
          </h2>
          <XPTracker
            label="Class XP"
            level={dashboardStats?.classLevel ?? 1}
            currentXP={dashboardStats?.classCurrentXP ?? 0}
            xpToNextLevel={dashboardStats?.classXPToNextLevel ?? 200}
            totalXP={dashboardStats?.classTotalXP ?? 0}
            averageScore={dashboardStats?.classAverageScore ?? 0}
            colorScheme="primary"
          />
        </div>

        {/* Overall Progress Section */}
        <div className="mb-8">
          <h2 className="font-fredoka text-2xl font-bold text-white mb-4 text-center">
            🌟 Overall Progress
          </h2>
          <XPTracker
            label="Overall XP"
            level={dashboardStats?.overallLevel ?? 1}
            currentXP={dashboardStats?.overallCurrentXP ?? 0}
            xpToNextLevel={dashboardStats?.overallXPToNextLevel ?? 200}
            totalXP={dashboardStats?.overallTotalXP ?? 0}
            averageScore={dashboardStats?.overallAverageScore ?? 0}
            colorScheme="secondary"
          />
        </div>

        {loading ? (
          <div className="text-center text-white py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="font-nunito">Loading your quests...</p>
          </div>
        ) : (
          <>
            {/* Curricula Sections */}
            {curricula.length > 0 && (
              <div className="mt-8">
                <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
                  🗺️ Your Learning Adventures
                </h2>
                <p className="font-nunito text-xl text-white/90 text-center mb-8">
                  Follow the path day by day to complete your adventures!
                </p>
                {curricula.map((curriculum) => (
                  <CurriculumSection
                    key={curriculum.curriculumId}
                    curriculum={curriculum}
                    variant="elementary"
                  />
                ))}
              </div>
            )}

            {/* Standalone Quests */}
            {standaloneQuests.length > 0 && (
              <div className="mt-8">
                <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
                  🎯 Extra Quests
                </h2>
                <p className="font-nunito text-xl text-white/90 text-center mb-8">
                  Bonus quests to earn extra XP!
                </p>
                <QuestGrid quests={standaloneQuests} />
              </div>
            )}

            {/* Empty state */}
            {curricula.length === 0 && standaloneQuests.length === 0 && (
              <div className="mt-8">
                <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
                  🎯 My Assigned Quests
                </h2>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                  <p className="font-nunito text-xl text-white mb-2">
                    No quests assigned yet! 📚
                  </p>
                  <p className="font-nunito text-white/80">
                    Ask your teacher to assign you some learning adventures!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quest History Section */}
        {allProgress.length > 0 && (
          <div className="mt-12">
            <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
              📜 Quest History
            </h2>
            <p className="font-nunito text-xl text-white/90 text-center mb-8">
              Your completed quests and achievements
            </p>
            <QuestHistory progressData={allProgress} />
          </div>
        )}
      </main>
    </div>
  );
}
