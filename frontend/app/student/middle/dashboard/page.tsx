"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { MiddleSchoolHeader } from "@/components/student/middle/MiddleSchoolHeader";
import { SkillProgressCard } from "@/components/student/middle/SkillProgressCard";
import { ChallengeGrid } from "@/components/student/middle/ChallengeGrid";
import { LeaderboardCard } from "@/components/student/middle/LeaderboardCard";
import { getMyQuests, StudentQuestDto } from "@/lib/api/studentQuests";
import { progressApi, StudentProgress, DashboardStats } from "@/lib/api/progress";

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

function convertToChallengeFormat(
  quests: StudentQuestDto[],
  progressData: StudentProgress[]
) {
  const completionMap = new Map<string, { score: number; xpEarned: number }>();
  for (const prog of progressData) {
    for (const qc of prog.questCompletions) {
      completionMap.set(qc.questId, {
        score: qc.score,
        xpEarned: prog.totalXP,
      });
    }
  }

  return quests.map((quest, index) => {
    const completion = completionMap.get(quest.questId);
    const isCompleted = !!completion;

    return {
      id: quest.questId,
      number: index + 1,
      title: quest.title,
      description: quest.description,
      icon: getIconForSubject(quest.subject),
      status: isCompleted ? ("completed" as const) : ("in-progress" as const),
      score: completion?.score,
      mastery: completion?.score,
      xpEarned: isCompleted ? quest.xpReward : undefined,
      progress: isCompleted ? 100 : undefined,
      currentMastery: undefined,
      playUrl: quest.playUrl,
    };
  });
}

export default function MiddleSchoolDashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const student = {
    name: user?.displayName || user?.email?.split("@")[0] || "Student",
    level: dashboardStats?.classLevel ?? 1,
    currentXP: dashboardStats?.classCurrentXP ?? 0,
    xpToNextLevel: dashboardStats?.classXPToNextLevel ?? 200,
    rank: 1,
    classSize: 1,
    avatar: "🎯",
  };

  useEffect(() => {
    async function loadData() {
      try {
        const questsPromise = getMyQuests();
        const progressPromise = user?.uid
          ? progressApi.getAllProgress(user.uid, user.classId)
          : Promise.resolve([]);
        const statsPromise = user?.uid
          ? progressApi.getDashboardStats(user.uid, user.classId)
          : Promise.resolve(null);

        const [assignedQuests, progressData, stats] = await Promise.all([
          questsPromise,
          progressPromise,
          statsPromise,
        ]);

        setChallenges(convertToChallengeFormat(assignedQuests, progressData));
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error loading data:", error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <MiddleSchoolHeader student={student} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SkillProgressCard student={student} />
          </div>
          <div>
            <LeaderboardCard student={student} />
          </div>
        </div>

        <div>
          <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Blacksmith Academy Challenges
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete challenges to level up your skills
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-xl text-gray-900 dark:text-white mb-2">
                No challenges assigned yet!
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Ask your teacher to assign you some challenges.
              </p>
            </div>
          ) : (
            <ChallengeGrid challenges={challenges} />
          )}
        </div>
      </main>
    </div>
  );
}
