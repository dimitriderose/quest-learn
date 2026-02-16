"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { HighSchoolHeader } from "@/components/student/high/HighSchoolHeader";
import { PortfolioCard } from "@/components/student/high/PortfolioCard";
import { ProjectGrid } from "@/components/student/high/ProjectGrid";
import { ImpactMetrics } from "@/components/student/high/ImpactMetrics";
import { CurriculumSection } from "@/components/student/dashboard/CurriculumSection";
import {
  getMyCurricula,
  StudentQuestDto,
  StudentCurriculumDto,
} from "@/lib/api/studentQuests";
import { progressApi, StudentProgress, DashboardStats } from "@/lib/api/progress";

function scoreToGrade(score: number): string {
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 60) return "D";
  return "F";
}

function convertToProjectFormat(
  quests: StudentQuestDto[],
  progressData: StudentProgress[]
) {
  const completionMap = new Map<string, { score: number; questTitle: string }>();
  for (const prog of progressData) {
    for (const qc of prog.questCompletions) {
      completionMap.set(qc.questId, {
        score: qc.score,
        questTitle: qc.questTitle,
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
      type: quest.subject.toLowerCase().replace(/\s+/g, "-"),
      status: isCompleted ? ("completed" as const) : ("in-progress" as const),
      grade: completion ? scoreToGrade(completion.score) : undefined,
      feedback: undefined,
      artifactCount: isCompleted ? 1 : undefined,
      progress: isCompleted ? 100 : undefined,
      draftStatus: isCompleted ? undefined : "In progress",
      deadline: quest.dueDate || undefined,
      playUrl: quest.playUrl,
      classId: quest.classId,
    };
  });
}

export default function HighSchoolDashboard() {
  const { user } = useAuth();
  const [curricula, setCurricula] = useState<StudentCurriculumDto[]>([]);
  const [standaloneProjects, setStandaloneProjects] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const completedCount = standaloneProjects.filter((p) => p.status === "completed").length;

  const student = {
    name: user?.displayName || user?.email?.split("@")[0] || "Student",
    role: "Student Researcher",
    portfolioPieces: completedCount,
    articlesPublished: completedCount,
    avatar: "📰",
  };

  const averageGrade = dashboardStats && dashboardStats.classAverageScore > 0
    ? scoreToGrade(dashboardStats.classAverageScore)
    : "--";

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
        setStandaloneProjects(
          convertToProjectFormat(curriculaData.standaloneQuests, progressData)
        );
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error loading data:", error);
        setCurricula([]);
        setStandaloneProjects([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  const totalProjects = standaloneProjects.length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <HighSchoolHeader student={student} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <PortfolioCard
              student={student}
              averageGrade={averageGrade}
              totalXP={dashboardStats?.classTotalXP ?? 0}
              completedQuests={completedCount}
              totalQuests={totalProjects}
            />
          </div>
          <div>
            <ImpactMetrics
              totalXP={dashboardStats?.classTotalXP ?? 0}
              averageScore={dashboardStats?.classAverageScore ?? 0}
              completedQuests={completedCount}
              totalQuests={totalProjects}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your projects...</p>
          </div>
        ) : (
          <>
            {/* Curricula Sections */}
            {curricula.length > 0 && (
              <div className="mb-8">
                <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Course Modules
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Complete each module sequentially to progress through the course
                </p>
                {curricula.map((curriculum) => (
                  <CurriculumSection
                    key={curriculum.curriculumId}
                    curriculum={curriculum}
                    variant="high"
                  />
                ))}
              </div>
            )}

            {/* Standalone Projects */}
            {standaloneProjects.length > 0 && (
              <div>
                <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {curricula.length > 0 ? "Additional Projects" : "Your Projects"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {curricula.length > 0
                    ? "Supplementary projects to expand your portfolio"
                    : "Complete projects to build your academic portfolio"}
                </p>
                <ProjectGrid projects={standaloneProjects} />
              </div>
            )}

            {/* Empty state */}
            {curricula.length === 0 && standaloneProjects.length === 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-xl text-gray-900 dark:text-white mb-2">
                  No projects assigned yet!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Ask your teacher to assign you some projects.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
