"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { StudentHeader } from "@/components/student/dashboard/StudentHeader";
import { XPTracker } from "@/components/student/dashboard/XPTracker";
import { QuestGrid } from "@/components/student/dashboard/QuestGrid";
import { QuestHistory } from "@/components/student/dashboard/QuestHistory";
import { AchievementBanner } from "@/components/student/dashboard/AchievementBanner";
import { getMyQuests, StudentQuestDto } from "@/lib/api/studentQuests";
import { progressApi, StudentProgress, QuestCompletion } from "@/lib/api/progress";

// Helper function to convert StudentQuestDto to Quest format for QuestGrid
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

/**
 * Calculate overall average across all curricula/subjects.
 * Each subject weighted equally regardless of quest count.
 */
function calculateAverageScore(allProgress: StudentProgress[]): number {
  if (allProgress.length === 0) return 0;
  
  const curriculumAverages: number[] = [];
  
  // Calculate average for each curriculum
  allProgress.forEach(progress => {
    if (progress.questCompletions.length === 0) return;
    
    // Get best score per quest (handles retries)
    const bestScores = new Map<string, number>();
    progress.questCompletions.forEach(completion => {
      const currentBest = bestScores.get(completion.questId) || 0;
      if (completion.score > currentBest) {
        bestScores.set(completion.questId, completion.score);
      }
    });
    
    // Calculate this curriculum's average
    const scores = Array.from(bestScores.values());
    const curriculumAvg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    curriculumAverages.push(curriculumAvg);
  });
  
  if (curriculumAverages.length === 0) return 0;
  
  // Average the curriculum averages
  const overallAvg = curriculumAverages.reduce((sum, avg) => sum + avg, 0) / curriculumAverages.length;
  return Math.round(overallAvg);
}

function calculateXPForNextLevel(currentLevel: number): number {
  // XP needed = (level + 1) * 100
  return (currentLevel + 1) * 100;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);
  const [allProgress, setAllProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Create student object from real progress data
  const student = user && allProgress.length > 0 ? {
    name: user.displayName || user.email?.split('@')[0] || "Student",
    level: allProgress[0]?.currentLevel || 1,
    currentXP: allProgress[0]?.totalXP || 0,
    xpToNextLevel: calculateXPForNextLevel(allProgress[0]?.currentLevel || 1),
    totalXP: allProgress[0]?.totalXP || 0,
    averageScore: calculateAverageScore(allProgress),
    streak: 0, // TODO: Calculate from lastActivityAt
    avatar: "🌟",
  } : {
    name: user?.displayName || "Student",
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    averageScore: 0,
    streak: 0,
    avatar: "🌟",
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch assigned quests
        const assignedQuests = await getMyQuests();
        const formattedQuests = convertToQuestFormat(assignedQuests);
        setQuests(formattedQuests);

        // Fetch all student progress
        if (user?.uid) {
          const progressData = await progressApi.getAllProgress(user.uid);
          console.log('📊 Dashboard loaded progress data:', progressData);
          console.log('👤 Student object will be:', {
            totalXP: progressData[0]?.totalXP,
            currentLevel: progressData[0]?.currentLevel,
            completedQuests: progressData[0]?.completedQuests,
            averageScore: calculateAverageScore(progressData)
          });
          setAllProgress(progressData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setQuests([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  console.log('🎯 Current student state:', student);
  console.log('📈 Progress data length:', allProgress.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-purple via-student-teal to-student-yellow dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <StudentHeader student={student} />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <AchievementBanner />
        
        <XPTracker student={student} />
        
        {/* Average Score Card */}
        {allProgress.length > 0 && student.averageScore > 0 && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl border-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-fredoka text-2xl text-white mb-2">
                    📈 Overall Average
                  </h3>
                  <p className="font-nunito text-white/80 text-sm">
                    Across all subjects
                  </p>
                </div>
                <div className="text-5xl font-bold text-white">
                  {student.averageScore}%
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
            🎯 My Assigned Quests
          </h2>
          <p className="font-nunito text-xl text-white/90 text-center mb-8">
            Complete your assigned quests to earn XP and level up!
          </p>
          
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="font-nunito">Loading your quests...</p>
            </div>
          ) : quests.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <p className="font-nunito text-xl text-white mb-2">
                No quests assigned yet! 📚
              </p>
              <p className="font-nunito text-white/80">
                Ask your teacher to assign you some learning adventures!
              </p>
            </div>
          ) : (
            <QuestGrid quests={quests} />
          )}
        </div>

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
